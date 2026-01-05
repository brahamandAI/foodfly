'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Star } from 'lucide-react';
import RestaurantMenu from '@/components/RestaurantMenu';
import { symposiumMenu } from '@/data/symposiumMenu';

export default function SymposiumMenuPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#232323] border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-6 transition-colors font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-yellow-400 mb-3 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Symposium Restaurant
              </h1>
              <p className="text-yellow-300 text-xl mb-6 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                Multi-Cuisine Fine Dining Experience
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-yellow-400 text-[#232323] px-5 py-2.5 rounded-lg font-bold">
                  <Star className="w-5 h-5 fill-[#232323]" />
                  <span>4.7</span>
                  <span className="text-sm">(2.5k+ ratings)</span>
                </div>
                
                <div className="flex items-center gap-2 bg-[#2a2a2a] text-yellow-400 border-2 border-yellow-400 px-5 py-2.5 rounded-lg font-bold">
                  <Clock className="w-5 h-5" />
                  <span>30-40 mins</span>
                </div>
                
                <div className="flex items-center gap-2 bg-[#2a2a2a] text-yellow-400 border-2 border-yellow-400 px-5 py-2.5 rounded-lg font-bold">
                  <MapPin className="w-5 h-5" />
                  <span>Andheri, Mumbai</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-400 text-[#232323] rounded-xl p-6 text-center border-4 border-[#232323] shadow-xl">
              <p className="text-sm mb-1 font-semibold">Delivery Fee</p>
              <p className="text-4xl font-black">₹50</p>
              <p className="text-xs mt-1 font-bold">Within 2km</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Component */}
      <RestaurantMenu 
        categories={symposiumMenu}
        restaurantId="3"
        restaurantName="Symposium Restaurant"
      />
    </div>
  );
}

