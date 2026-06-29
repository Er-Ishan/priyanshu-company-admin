"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { backendProxyPath } from "@/app/lib/backendProxy";

type PlaceResult = {
  postcode?: string;
  latitude?: string;
  longitude?: string;
};

type Props = {
  onPlaceSelect: (result: PlaceResult) => void;
  label?: string;
  placeholder?: string;
  className?: string;
};

declare global {
  interface Window {
    google?: any;
  }
}

function extractPostcode(components: any[] | undefined): string {
  if (!components) return "";
  for (const c of components) {
    if (c.types?.includes("postal_code")) return c.long_name || "";
  }
  return "";
}

export default function GooglePlacesInput({
  onPlaceSelect,
  label = "Search address or postcode",
  placeholder = "Start typing an address or postcode…",
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMaps() {
      if (window.google?.maps?.places) {
        setReady(true);
        return;
      }

      try {
        const res = await fetch(backendProxyPath("/api/tracking/google-maps-key"), {
          credentials: "include",
        });
        const json = await res.json();
        const key = json?.data?.key;
        if (!key || cancelled) return;

        const existing = document.querySelector('script[data-tracking-maps="1"]');
        if (!existing) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
            script.async = true;
            script.dataset.trackingMaps = "1";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Maps failed to load"));
            document.head.appendChild(script);
          });
        }
        if (!cancelled) setReady(true);
      } catch {
        // Places search is optional; manual entry still works
      }
    }

    loadMaps();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || inputRef.current.dataset.placesBound) return;

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ["geometry", "address_components", "formatted_address"],
    });

    inputRef.current.dataset.placesBound = "1";

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place?.geometry?.location) return;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      onPlaceSelect({
        postcode: extractPostcode(place.address_components),
        latitude: String(Math.round(lat * 1e7) / 1e7),
        longitude: String(Math.round(lng * 1e7) / 1e7),
      });
    });
  }, [ready, onPlaceSelect]);

  return (
    <div className={className}>
      <Label className="mb-1.5 block text-sm">{label}</Label>
      <Input ref={inputRef} placeholder={placeholder} autoComplete="off" />
      <p className="mt-1 text-xs text-muted-foreground">
        Selecting a place fills postcode, latitude and longitude below.
      </p>
    </div>
  );
}
