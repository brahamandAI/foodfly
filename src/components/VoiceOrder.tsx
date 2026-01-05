'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, CheckCircle, AlertCircle, Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { unifiedCartService } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { sanitizeImageUrl } from '@/lib/imageUtils';

interface VoiceOrderProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedItem {
  name: string;
  quantity: number;
  originalText: string;
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  restaurantId: string;
  restaurantName: string;
}

interface ConfirmedItem extends MenuItem {
  quantity: number;
  status: 'available' | 'unavailable';
}

const VoiceOrder: React.FC<VoiceOrderProps> = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [confirmedItems, setConfirmedItems] = useState<ConfirmedItem[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcriptText = event.results[0][0].transcript;
        setTranscript(transcriptText);
        handleVoiceInput(transcriptText);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          toast.error('Microphone permission denied. Please enable microphone access.');
        } else {
          toast.error('Speech recognition error. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };
    } else if (isOpen) {
      toast.error('Speech recognition is not supported in your browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isOpen]);

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not available');
      return;
    }

    // Check if already listening
    if (isListening) {
      return;
    }

    try {
      // Stop any existing recognition first
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping (might not be running)
      }

      // Reset state
      setTranscript('');
      setParsedItems([]);
      setConfirmedItems([]);
      setShowConfirmation(false);
      
      // Small delay to ensure previous recognition is fully stopped
      setTimeout(() => {
        try {
          setIsListening(true);
          recognitionRef.current.start();
          toast.success('Listening... Speak your order now!');
        } catch (error) {
          console.error('Error starting recognition:', error);
          setIsListening(false);
          toast.error('Failed to start voice recognition');
        }
      }, 100);
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
      toast.error('Failed to start voice recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    setIsListening(false);
  };

  const parseVoiceInput = (text: string): ParsedItem[] => {
    const items: ParsedItem[] = [];
    const lowerText = text.toLowerCase();
    
    // Common phrases to remove
    const removePhrases = [
      'hello', 'hi', 'hey', 'i want', 'i need', 'i\'d like', 'i would like',
      'give me', 'add', 'get', 'order', 'please', 'can i have', 'i\'ll have',
      'i\'ll take', 'i want to order', 'i need to order', 'let me have',
      'show me', 'bring me', 'thanks', 'thank you'
    ];
    
    // Quantity words
    const quantityWords: { [key: string]: number } = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'a': 1, 'an': 1, 'some': 1
    };
    
    // Split by common separators (comma, and, &)
    const parts = text.split(/,|and|&|plus/).map(p => p.trim()).filter(p => p.length > 0);
    
    // If no separators found, treat the whole text as one item
    const textParts = parts.length > 0 ? parts : [text];
    
    for (const part of textParts) {
      let quantity = 1;
      let itemName = part;
      
      // Extract numeric quantity first
      const numberMatch = part.match(/\d+/);
      if (numberMatch) {
        quantity = parseInt(numberMatch[0], 10);
        itemName = part.replace(/\d+/g, '').trim();
      }
      
      // Extract word quantity
      const lowerPart = part.toLowerCase();
      for (const [word, num] of Object.entries(quantityWords)) {
        const wordPattern = new RegExp(`^${word}\\s+`, 'i');
        if (wordPattern.test(lowerPart)) {
          quantity = num;
          itemName = part.replace(wordPattern, '').trim();
          break;
        }
      }
      
      // Remove common phrases from the beginning and end
      let cleanedName = itemName;
      for (const phrase of removePhrases) {
        const phrasePattern = new RegExp(`^${phrase}\\s+`, 'i');
        cleanedName = cleanedName.replace(phrasePattern, '');
      }
      cleanedName = cleanedName.replace(/\s+(please|thanks|thank you|\.)$/i, '').trim();
      
      // If cleaned name is too short or empty, try to extract the last meaningful words
      if (cleanedName.length < 3) {
        // Try to find food-related keywords
        const words = part.toLowerCase().split(/\s+/);
        const foodKeywords = words.filter(w => 
          w.length > 2 && 
          !removePhrases.includes(w) && 
          !Object.keys(quantityWords).includes(w) &&
          !/^\d+$/.test(w)
        );
        if (foodKeywords.length > 0) {
          cleanedName = foodKeywords.join(' ');
        }
      }
      
      // Final cleanup - remove any remaining common words at the start
      cleanedName = cleanedName
        .replace(/^(the|a|an|some|one|two|three|four|five|six|seven|eight|nine|ten)\s+/i, '')
        .trim();
      
      if (cleanedName.length > 0) {
        items.push({
          name: cleanedName,
          quantity: quantity || 1,
          originalText: part
        });
      }
    }
    
    // If still no items found, try to extract the most meaningful words
    if (items.length === 0) {
      const words = text.toLowerCase().split(/\s+/);
      const meaningfulWords = words.filter(w => 
        w.length > 2 && 
        !removePhrases.includes(w) && 
        !Object.keys(quantityWords).includes(w) &&
        !/^\d+$/.test(w) &&
        !['want', 'need', 'like', 'have', 'get', 'order'].includes(w)
      );
      
      if (meaningfulWords.length > 0) {
        items.push({
          name: meaningfulWords.join(' '),
          quantity: 1,
          originalText: text
        });
      }
    }
    
    return items;
  };

  const searchMenuItems = async (itemName: string): Promise<MenuItem[]> => {
    try {
      // Clean the search query
      const cleanQuery = itemName.trim().toLowerCase();
      if (cleanQuery.length < 2) {
        return [];
      }
      
      // Try multiple search strategies for better matching
      const searchQueries = [
        cleanQuery, // Original query
        cleanQuery.split(' ').slice(-2).join(' '), // Last 2 words (e.g., "tikka burger" from "chicken tikka burger")
        cleanQuery.split(' ').pop() || cleanQuery, // Last word only (e.g., "burger" from "chicken tikka burger")
      ];
      
      const allResults: MenuItem[] = [];
      const seenIds = new Set<string>();
      
      // Search with each query strategy
      for (const query of searchQueries) {
        if (query.length < 2) continue;
        
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            continue;
          }
          
          const data = await response.json();
          
          // Extract dish results - API returns { dishes: [...], restaurants: [...] }
          if (data.dishes && Array.isArray(data.dishes)) {
            for (const dish of data.dishes) {
              if (dish && dish._id && !seenIds.has(dish._id)) {
                seenIds.add(dish._id);
                allResults.push({
                  _id: dish._id || dish.restaurantId + '_' + dish.name,
                  name: dish.name,
                  description: dish.description || '',
                  price: typeof dish.price === 'number' ? dish.price : parseFloat(String(dish.price)) || 0,
                  image: dish.image || '/images/placeholder.svg',
                  category: dish.category || 'Uncategorized',
                  isVeg: dish.isVeg !== undefined ? dish.isVeg : true,
                  isAvailable: dish.isAvailable !== undefined ? dish.isAvailable : true,
                  restaurantId: dish.restaurantId || '',
                  restaurantName: dish.restaurantName || 'Restaurant'
                });
              }
            }
          }
          
          // If we found results with the first query, prioritize those
          if (allResults.length > 0 && query === cleanQuery) {
            break;
          }
        } catch (error) {
          console.error(`Error searching with query "${query}":`, error);
          // Continue with next query
        }
      }
      
      // Sort by relevance (exact name match first, then partial matches)
      const queryLower = cleanQuery.toLowerCase();
      allResults.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        // Exact match gets highest priority
        if (aName === queryLower) return -1;
        if (bName === queryLower) return 1;
        
        // Starts with query gets second priority
        if (aName.startsWith(queryLower)) return -1;
        if (bName.startsWith(queryLower)) return 1;
        
        // Contains query gets third priority
        if (aName.includes(queryLower)) return -1;
        if (bName.includes(queryLower)) return 1;
        
        return 0;
      });
      
      return allResults.slice(0, 5); // Return top 5 matches
    } catch (error) {
      console.error('Error searching menu items:', error);
      toast.error('Failed to search menu. Please try again.');
      return [];
    }
  };

  const handleVoiceInput = async (text: string) => {
    setIsProcessing(true);
    setTranscript(text);
    
    try {
      // Parse the voice input
      const parsed = parseVoiceInput(text);
      setParsedItems(parsed);
      
      if (parsed.length === 0) {
        toast.error('Could not understand your order. Please try again.');
        setIsProcessing(false);
        return;
      }
      
      // Search for each item
      const confirmed: ConfirmedItem[] = [];
      
      for (const parsedItem of parsed) {
        const searchResults = await searchMenuItems(parsedItem.name);
        
        if (searchResults.length > 0) {
          // Take the first (most relevant) result
          const bestMatch = searchResults[0];
          confirmed.push({
            ...bestMatch,
            quantity: parsedItem.quantity,
            status: bestMatch.isAvailable ? 'available' : 'unavailable'
          });
        } else {
          // Item not found - create a placeholder
          confirmed.push({
            _id: `not_found_${parsedItem.name}`,
            name: parsedItem.name,
            description: '',
            price: 0,
            image: '/images/placeholder.svg',
            category: 'Not Found',
            isVeg: false,
            isAvailable: false,
            restaurantId: '',
            restaurantName: '',
            quantity: parsedItem.quantity,
            status: 'unavailable'
          });
        }
      }
      
      setConfirmedItems(confirmed);
      setShowConfirmation(true);
      toast.success(`Found ${confirmed.filter(c => c.status === 'available').length} available item(s)`);
    } catch (error) {
      console.error('Error processing voice input:', error);
      toast.error('Error processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmOrder = async () => {
    const availableItems = confirmedItems.filter(item => item.status === 'available');
    
    if (availableItems.length === 0) {
      toast.error('No available items to add to cart');
      return;
    }
    
    setIsAddingToCart(true);
    
    try {
      for (const item of availableItems) {
        await unifiedCartService.addToCart(
          item._id,
          item.name,
          item.description,
          item.price,
          item.quantity,
          item.image,
          item.restaurantId,
          item.restaurantName,
          []
        );
      }
      
      toast.success(`${availableItems.length} item(s) added to cart!`);
      
      // Close modal and go to checkout
      onClose();
      router.push('/checkout');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add items to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Voice Order</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>How to use:</strong> Click the microphone button and speak your order naturally.
              For example: "I want 2 butter chicken and 1 pizza" or "Give me 3 burgers"
            </p>
          </div>

          {/* Voice Input Section */}
          <div className="text-center">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-gray-200 hover:bg-gray-300'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isListening ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-gray-700" />
              )}
            </button>
            <p className="mt-4 text-gray-600">
              {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Click to start speaking'}
            </p>
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">You said:</p>
              <p className="text-gray-900 font-medium">{transcript}</p>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Searching for items...</span>
            </div>
          )}

          {/* Confirmation UI */}
          {showConfirmation && confirmedItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Order Confirmation</h3>
              
              <div className="space-y-3">
                {confirmedItems.map((item, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      item.status === 'available'
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 relative flex-shrink-0">
                        <Image
                          src={sanitizeImageUrl(item.image)}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                              Quantity: {item.quantity} × ₹{item.price} = ₹{item.price * item.quantity}
                            </p>
                            {item.restaurantName && (
                              <p className="text-xs text-gray-400 mt-1">From: {item.restaurantName}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {item.status === 'available' ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </div>
                        
                        {item.status === 'unavailable' && (
                          <div className="mt-2 text-sm text-red-600 font-medium">
                            {item._id.startsWith('not_found_') 
                              ? 'Item not found in menu'
                              : 'Currently unavailable'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    setConfirmedItems([]);
                    setTranscript('');
                    setParsedItems([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={isAddingToCart || confirmedItems.filter(i => i.status === 'available').length === 0}
                  className="flex-1 px-4 py-2 bg-yellow-400 text-[#232323] rounded-lg hover:bg-yellow-500 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Confirm Order ({confirmedItems.filter(i => i.status === 'available').length} items)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceOrder;

