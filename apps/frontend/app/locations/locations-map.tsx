"use client";

import { useRef, useEffect, useCallback } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { LOCATIONS } from "./constants";

interface LocationCardProps {
  loc: (typeof LOCATIONS)[0];
  onFlyTo: (lng: number, lat: number) => void;
}

const LocationCard = ({ loc, onFlyTo }: LocationCardProps) => (
  <div
    onClick={() => onFlyTo(loc.lng, loc.lat)}
    className="group cursor-pointer bg-white/5 hover:bg-white/10 rounded-[24px] lg:rounded-4xl p-3 lg:p-4 border border-white/5 hover:border-[#BEFF00]/50 transition-all duration-500"
  >
    <div className="flex gap-4 lg:gap-5 items-center">
      <div className="relative w-24 h-24 lg:w-50 lg:h-26 shrink-0 rounded-[18px] lg:rounded-[24px] overflow-hidden border border-white/10">
        <img
          src={loc.image}
          alt={loc.name}
          className="w-full h-full object-cover transition-all duration-700 scale-110 group-hover:scale-100"
        />
      </div>

      <div className="flex flex-col gap-1 lg:gap-2 overflow-hidden">
        <h4 className="font-bold text-white text-[clamp(1rem,4vw,1.5rem)] lg:text-[clamp(1.25rem,2vw,1.875rem)] leading-tight truncate">
          {loc.name}
        </h4>
        <a
          href={loc.googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center text-[9px] lg:text-[10px] font-black text-[#BEFF00] hover:text-white transition-colors tracking-widest mt-1"
        >
          GOOGLE MAPS ↗
        </a>
      </div>
    </div>
  </div>
);

export const LocationMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);

  const handleFlyTo = useCallback((lng: number, lat: number) => {
    map.current?.flyTo({
      center: [lng, lat],
      zoom: 15,
      essential: true,
    });
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    if (!apiKey) {
      console.warn("Maptiler Key not found in process.env");
      return;
    }

    maptilersdk.config.apiKey = apiKey;

    if (!mapContainer.current || map.current) return;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v4/style.json?key=${apiKey}`,
      center: [98.3, 7.81],
      zoom: 11,
    });

    map.current.on("load", () => {
      LOCATIONS.forEach((loc) => {
        const marker = new maptilersdk.Marker({ color: "#BEFF00" })
          .setLngLat([loc.lng, loc.lat])
          .addTo(map.current!);

        marker.getElement().style.cursor = "pointer";
        marker
          .getElement()
          .addEventListener("click", () => handleFlyTo(loc.lng, loc.lat));
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [handleFlyTo]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-4 bg-brand-white/5 backdrop-blur-md border border-white/10 rounded-[48px]">
      {/* КАРТА */}
      <div className="relative grow h-100 lg:h-110 rounded-[40px] overflow-hidden border border-white/5 shadow-2xl">
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      {/* КАРТОЧКИ */}
      <div className="flex flex-col gap-2 lg:w-137.5 w-full shrink-0">
        {LOCATIONS.map((loc) => (
          <LocationCard key={loc.id} loc={loc} onFlyTo={handleFlyTo} />
        ))}
      </div>

      <style jsx global>{`
        .maplibregl-ctrl-attrib,
        .maplibregl-ctrl-logo {
          display: none !important;
        }
        .maplibregl-canvas {
          outline: none !important;
        }
      `}</style>
    </div>
  );
};
