'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { Navigation, Loader2, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  checkAnyRestaurantInRange,
  checkCartDeliveryRadius,
  type CartItemRef,
  type CartRestaurantCheck,
} from '@/lib/checkoutDeliveryRadius';
import {
  blueDeliveryPinDataUrl,
  redRestaurantPinDataUrl,
  getCartRestaurantPins,
} from '@/lib/checkoutMapMarkers';

export interface CheckoutMapContinuePayload {
  latitude: number;
  longitude: number;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export type DeliveryMapValidationMode = 'cart' | 'anyRestaurant';

interface CheckoutDeliveryMapPickerProps {
  cartItems: CartItemRef[];
  /** `cart` = all cart restaurants must be in range (checkout). `anyRestaurant` = at least one FoodFly restaurant (home / profile). */
  validationMode?: DeliveryMapValidationMode;
  initialPin?: { latitude: number; longitude: number } | null;
  onContinue: (payload: CheckoutMapContinuePayload) => void;
  onCancel: () => void;
}

const DEFAULT_CENTER = { lat: 28.5925, lng: 77.04 };

const ALL_RESTAURANT_CART_REFS: CartItemRef[] = [
  { restaurantId: '1' },
  { restaurantId: '2' },
  { restaurantId: '3' },
];

async function reverseGeocodeLatLng(
  lat: number,
  lng: number
): Promise<{ street: string; city: string; state: string; pincode: string }> {
  try {
    const { googleMapsService } = await import('@/lib/googleMapsService');
    if (googleMapsService.isConfigured()) {
      const r = await googleMapsService.reverseGeocode(lat, lng);
      return {
        street: r.components.street || '',
        city: r.components.city || '',
        state: r.components.state || '',
        pincode: r.components.pincode || '',
      };
    }
  } catch {
    // fall through to Nominatim
  }

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
    { headers: { 'User-Agent': 'FoodFly-Checkout/1.0' } }
  );
  if (!res.ok) throw new Error('Reverse geocode failed');
  const data = await res.json();
  const a = data.address || {};
  const street = [a.house_number, a.road || a.pedestrian, a.neighbourhood || a.suburb]
    .filter(Boolean)
    .join(', ');
  return {
    street: street || (data.display_name?.split(',')[0] ?? ''),
    city: a.city || a.town || a.village || a.county || '',
    state: a.state || '',
    pincode: a.postcode || '',
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function CheckoutDeliveryMapPicker({
  cartItems,
  validationMode = 'cart',
  initialPin,
  onContinue,
  onCancel,
}: CheckoutDeliveryMapPickerProps) {
  const { isLoaded, loadError, google } = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const restaurantMarkersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [pin, setPin] = useState<{ lat: number; lng: number }>(() =>
    initialPin ? { lat: initialPin.latitude, lng: initialPin.longitude } : DEFAULT_CENTER
  );
  const [checks, setChecks] = useState<CartRestaurantCheck[]>([]);
  const [deliveryOk, setDeliveryOk] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [resolvedAddressLine, setResolvedAddressLine] = useState('');
  const [resolvingAddress, setResolvingAddress] = useState(false);

  const pinsCartItems =
    validationMode === 'anyRestaurant' ? ALL_RESTAURANT_CART_REFS : cartItems;

  const updateValidation = useCallback(
    (lat: number, lng: number) => {
      if (validationMode === 'anyRestaurant') {
        const { ok, checks: c } = checkAnyRestaurantInRange(lat, lng);
        setChecks(c);
        setDeliveryOk(ok);
        return;
      }
      const { ok, checks: c } = checkCartDeliveryRadius(lat, lng, cartItems);
      setChecks(c);
      setDeliveryOk(ok);
    },
    [validationMode, cartItems]
  );

  useEffect(() => {
    updateValidation(pin.lat, pin.lng);
  }, [pin, updateValidation]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setResolvingAddress(true);
      try {
        const parts = await reverseGeocodeLatLng(pin.lat, pin.lng);
        if (cancelled) return;
        const line = [parts.street, parts.city, parts.state, parts.pincode].filter(Boolean).join(', ');
        setResolvedAddressLine(line || `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`);
      } catch {
        if (!cancelled) {
          setResolvedAddressLine('Could not resolve this spot — try moving the pin or wait and retry.');
        }
      } finally {
        if (!cancelled) setResolvingAddress(false);
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pin.lat, pin.lng]);

  useEffect(() => {
    if (!isLoaded || !google?.maps || !mapRef.current) return;

    const start = initialPin ? { lat: initialPin.latitude, lng: initialPin.longitude } : DEFAULT_CENTER;
    const g = google.maps;

    const map = new g.Map(mapRef.current, {
      center: start,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
    });
    mapInstanceRef.current = map;

    const marker = new g.Marker({
      position: start,
      map,
      draggable: true,
      title: 'Your delivery location (blue pin)',
      icon: {
        url: blueDeliveryPinDataUrl(),
        scaledSize: new g.Size(40, 48),
        anchor: new g.Point(20, 48),
      },
      zIndex: 1000,
    });
    markerRef.current = marker;

    const syncFromMarker = () => {
      const p = marker.getPosition();
      if (p) setPin({ lat: p.lat(), lng: p.lng() });
    };

    marker.addListener('dragend', syncFromMarker);
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        marker.setPosition(e.latLng);
        syncFromMarker();
      }
    });

    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];
    restaurantMarkersRef.current.forEach((m) => m.setMap(null));
    restaurantMarkersRef.current = [];

    for (const r of getCartRestaurantPins(pinsCartItems)) {
      const circle = new g.Circle({
        strokeColor: '#dc2626',
        strokeOpacity: 0.55,
        strokeWeight: 1,
        fillColor: '#dc2626',
        fillOpacity: 0.06,
        map,
        center: { lat: r.lat, lng: r.lng },
        radius: 2000,
      });
      circlesRef.current.push(circle);

      const rm = new g.Marker({
        position: { lat: r.lat, lng: r.lng },
        map,
        title: r.label,
        icon: {
          url: redRestaurantPinDataUrl(),
          scaledSize: new g.Size(40, 48),
          anchor: new g.Point(20, 48),
        },
        zIndex: 500,
      });

      rm.addListener('click', () => {
        if (infoWindowRef.current) infoWindowRef.current.close();
        const iw = new g.InfoWindow({
          content: `<div style="padding:8px;max-width:260px;font-size:13px;line-height:1.35"><strong style="color:#b91c1c">${escapeHtml(r.label)}</strong><br/><span style="color:#444">${escapeHtml(r.address)}</span></div>`,
        });
        iw.open(map, rm);
        infoWindowRef.current = iw;
        map.panTo({ lat: r.lat, lng: r.lng });
      });

      restaurantMarkersRef.current.push(rm);
    }

    return () => {
      infoWindowRef.current?.close();
      infoWindowRef.current = null;
      marker.setMap(null);
      circlesRef.current.forEach((c) => c.setMap(null));
      circlesRef.current = [];
      restaurantMarkersRef.current.forEach((m) => m.setMap(null));
      restaurantMarkersRef.current = [];
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map init when loader ready; pinsCartItems from props
  }, [isLoaded, google, validationMode, cartItems]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser.');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPin({ lat, lng });
        const m = markerRef.current;
        const map = mapInstanceRef.current;
        const w = typeof window !== 'undefined' ? window.google?.maps : null;
        if (m && map && w) {
          const ll = new w.LatLng(lat, lng);
          m.setPosition(ll);
          map.panTo(ll);
          map.setZoom(16);
        }
        toast.success('Location detected — drag the blue pin if needed.');
        setDetecting(false);
      },
      (err) => {
        console.warn(err);
        toast.error('Could not detect location. Allow permission or tap the map to place the pin.');
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const handleContinue = async () => {
    if (!deliveryOk) {
      toast.error(
        validationMode === 'anyRestaurant'
          ? 'Move the blue pin within 2 km of at least one FoodFly restaurant (inside a red circle).'
          : 'Move the blue pin inside a red delivery zone (within 2 km of every restaurant in your cart).'
      );
      return;
    }
    setContinuing(true);
    try {
      const parts = await reverseGeocodeLatLng(pin.lat, pin.lng);
      onContinue({
        latitude: pin.lat,
        longitude: pin.lng,
        street: parts.street,
        city: parts.city,
        state: parts.state || 'Delhi',
        pincode: parts.pincode,
      });
    } catch {
      toast.error('Could not resolve address from the pin. Try moving the pin slightly and retry.');
    } finally {
      setContinuing(false);
    }
  };

  if (loadError) {
    return (
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
        <p className="font-semibold text-amber-200">Map could not load</p>
        <p className="mt-1 text-amber-100/90">{loadError}</p>
        <p className="mt-3 text-xs text-amber-200/80">
          Set <code className="rounded bg-black/20 px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> for the delivery map.
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="mt-4 rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-lg bg-gray-800">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
        <span className="font-semibold text-white">Red pins</span> = restaurants (tap for full address).{' '}
        <span className="font-semibold text-blue-300">Blue pin</span> = your spot — drag it or tap the map. Address
        updates below for the blue pin. Shaded circles = 2 km range.
        {validationMode === 'anyRestaurant' ? (
          <> You must be within range of <span className="font-semibold text-white">at least one</span> restaurant.</>
        ) : (
          <> Your cart must be within range of <span className="font-semibold text-white">each</span> restaurant shown.</>
        )}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={detecting}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          style={{ fontFamily: "'Satoshi', sans-serif" }}
        >
          {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          Auto-detect my location
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-600">
        <div ref={mapRef} className="h-[min(55vh,320px)] w-full bg-gray-900" />
      </div>

      <div className="rounded-lg bg-gray-900/80 p-3 text-sm">
        <div className="mb-2 flex items-center gap-2 font-semibold text-blue-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
          <MapPin className="h-4 w-4 shrink-0" />
          <span>Your pin (blue)</span>
        </div>
        <p className="mb-1 font-mono text-xs text-gray-400">
          {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
        </p>
        <p className="text-sm leading-snug text-gray-200" style={{ fontFamily: "'Satoshi', sans-serif" }}>
          {resolvingAddress ? (
            <span className="text-gray-500">Looking up address…</span>
          ) : (
            resolvedAddressLine || 'Move the pin to load the address for this location.'
          )}
        </p>

        <ul className="mt-3 space-y-1.5 border-t border-gray-700 pt-3">
          {checks.map((c) => (
            <li
              key={c.key}
              className={`flex items-center justify-between gap-2 rounded-md px-2 py-1 ${
                c.skipped ? 'bg-gray-800/80 text-gray-400' : c.inRange ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'
              }`}
            >
              <span className="truncate">{c.displayName}</span>
              {c.skipped ? (
                <span className="shrink-0 text-xs">—</span>
              ) : c.distanceKm != null ? (
                <span className="flex shrink-0 items-center gap-1 text-xs font-medium">
                  {c.inRange ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  {c.distanceKm.toFixed(2)} km / max {2} km
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        {!deliveryOk && checks.some((c) => !c.skipped && !c.inRange) && (
          <p className="mt-2 text-xs text-red-300/90">
            {validationMode === 'anyRestaurant'
              ? 'Move the blue pin until at least one restaurant is within range.'
              : 'Move the blue pin until every restaurant shows within range.'}
          </p>
        )}
        {deliveryOk && validationMode === 'anyRestaurant' && (
          <p className="mt-2 text-xs text-green-300/90">This location is within delivery range for at least one restaurant.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!deliveryOk || continuing}
          className="rounded-lg bg-yellow-400 px-6 py-2.5 font-bold text-[#232323] hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontFamily: "'Satoshi', sans-serif" }}
        >
          {continuing ? (
            <>
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              Resolving address…
            </>
          ) : (
            'Continue to address details'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-700 px-6 py-2.5 font-semibold text-white hover:bg-gray-600"
          style={{ fontFamily: "'Satoshi', sans-serif" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
