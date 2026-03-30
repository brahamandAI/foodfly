'use client';

import { useEffect, useRef } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { blueDeliveryPinDataUrl, redRestaurantPinDataUrl, getCartRestaurantPins, type CartItemRef } from '@/lib/checkoutMapMarkers';

interface CheckoutAddressMapPreviewProps {
  cartItems: CartItemRef[];
  deliveryLat: number;
  deliveryLng: number;
  /** Changes when user picks another address — remount/fit bounds */
  selectionKey?: string;
}

export default function CheckoutAddressMapPreview({
  cartItems,
  deliveryLat,
  deliveryLng,
  selectionKey = '',
}: CheckoutAddressMapPreviewProps) {
  const { isLoaded, loadError, google } = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const deliveryMarkerRef = useRef<google.maps.Marker | null>(null);
  const restaurantMarkersRef = useRef<google.maps.Marker[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!isLoaded || !google?.maps || !mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: deliveryLat, lng: deliveryLng },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
    });
    mapInstanceRef.current = map;

    const g = google.maps;

    const deliveryMarker = new g.Marker({
      position: { lat: deliveryLat, lng: deliveryLng },
      map,
      title: 'Your delivery location',
      icon: {
        url: blueDeliveryPinDataUrl(),
        scaledSize: new g.Size(40, 48),
        anchor: new g.Point(20, 48),
      },
      zIndex: 1000,
    });
    deliveryMarkerRef.current = deliveryMarker;

    const restaurants = getCartRestaurantPins(cartItems);
    const bounds = new g.LatLngBounds();
    bounds.extend({ lat: deliveryLat, lng: deliveryLng });

    restaurants.forEach((r) => {
      bounds.extend({ lat: r.lat, lng: r.lng });

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

      const m = new g.Marker({
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

      m.addListener('click', () => {
        if (infoWindowRef.current) infoWindowRef.current.close();
        const iw = new g.InfoWindow({
          content: `<div style="padding:8px;max-width:240px;font-size:13px;line-height:1.35"><strong style="color:#b91c1c">${escapeHtml(r.label)}</strong><br/><span style="color:#444">${escapeHtml(r.address)}</span></div>`,
        });
        iw.open(map, m);
        infoWindowRef.current = iw;
      });

      restaurantMarkersRef.current.push(m);
    });

    if (restaurants.length > 0) {
      map.fitBounds(bounds, 48);
      const listener = g.event.addListener(map, 'bounds_changed', () => {
        const z = map.getZoom();
        if (z !== undefined && z > 16) map.setZoom(16);
        if (z !== undefined && z < 12) map.setZoom(12);
        g.event.removeListener(listener);
      });
    } else {
      map.setCenter({ lat: deliveryLat, lng: deliveryLng });
      map.setZoom(16);
    }

    return () => {
      infoWindowRef.current?.close();
      infoWindowRef.current = null;
      deliveryMarker.setMap(null);
      restaurantMarkersRef.current.forEach((x) => x.setMap(null));
      restaurantMarkersRef.current = [];
      circlesRef.current.forEach((c) => c.setMap(null));
      circlesRef.current = [];
      mapInstanceRef.current = null;
      deliveryMarkerRef.current = null;
    };
  }, [isLoaded, google, deliveryLat, deliveryLng, selectionKey, cartItems]);

  if (loadError) {
    return (
      <p className="text-xs text-amber-200/80" style={{ fontFamily: "'Satoshi', sans-serif" }}>
        Map preview unavailable. {loadError}
      </p>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-800">
        <span className="text-sm text-gray-400">Loading map…</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-600" /> Restaurant
        </span>
        <span className="mx-2">·</span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600" /> Your delivery pin
        </span>
        <span className="mx-2">·</span>
        Tap a red pin for the full address
      </p>
      <div className="overflow-hidden rounded-lg border border-gray-600">
        <div ref={mapRef} className="h-[220px] w-full bg-gray-900" />
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
