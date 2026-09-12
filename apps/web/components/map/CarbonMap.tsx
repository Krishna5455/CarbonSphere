'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Facility, CandidateEvaluation, PathwayType } from '@/lib/types';

interface CarbonMapProps {
  origin?: {
    lat: number;
    lon: number;
    name: string;
    wasteType?: string;
  };
  facilities?: Facility[] | CandidateEvaluation[];
  recommendedId?: string;
  routeGeometry?: {
    type: string;
    coordinates: [number, number][];
  };
  className?: string;
}

function getCartoDarkStyle(): string | maplibregl.StyleSpecification {
  const customUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL;
  const apiKey = process.env.NEXT_PUBLIC_CARTO_API_KEY ? process.env.NEXT_PUBLIC_CARTO_API_KEY.trim() : '';

  if (customUrl) {
    if (apiKey && !customUrl.includes('key=')) {
      const delimiter = customUrl.includes('?') ? '&' : '?';
      return `${customUrl}${delimiter}key=${encodeURIComponent(apiKey)}`;
    }
    return customUrl;
  }

  const keyParam = apiKey ? `?key=${encodeURIComponent(apiKey)}` : '';
  const tiles = [
    `https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png${keyParam}`,
    `https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png${keyParam}`,
    `https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png${keyParam}`,
    `https://d.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png${keyParam}`
  ];

  return {
    version: 8,
    name: 'CARTO Dark Matter',
    sources: {
      'carto-dark': {
        type: 'raster',
        tiles: tiles,
        tileSize: 256,
        attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'
      }
    },
    layers: [
      {
        id: 'carto-dark-layer',
        type: 'raster',
        source: 'carto-dark',
        minzoom: 0,
        maxzoom: 20
      }
    ]
  };
}

export default function CarbonMap({
  origin,
  facilities = [],
  recommendedId,
  routeGeometry,
  className = 'w-full h-[520px] rounded-2xl overflow-hidden'
}: CarbonMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const initialLat = origin ? origin.lat : 18.5204;
    const initialLon = origin ? origin.lon : 73.8567;
    const mapStyle = getCartoDarkStyle();

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [initialLon, initialLat],
      zoom: 7.8,
      attributionControl: false
    });

    map.on('error', (e) => {
      console.warn('Notice: MapLibre tile/style notice:', e);
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(
      new maplibregl.AttributionControl({
        compact: false,
        customAttribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a> · <a href="https://project-osrm.org/" target="_blank" rel="noopener">OSRM</a>'
      }),
      'bottom-right'
    );

    const handleLoad = () => {
      setMapLoaded(true);
      map.resize();
    };

    if (map.isStyleLoaded() || map.loaded()) {
      handleLoad();
    } else {
      map.on('load', handleLoad);
    }

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update Markers and Route
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapLoaded) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();

    // 1. Add Generator Origin Marker
    if (origin) {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center w-9 h-9 cursor-pointer';
      el.innerHTML = `
        <span class="absolute w-full h-full bg-emerald-500/30 rounded-full animate-ping"></span>
        <div class="relative w-8 h-8 rounded-full bg-emerald-500 border-2 border-[#080c0b] shadow-lg flex items-center justify-center text-black font-bold text-xs">
          📍
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="text-xs font-sans">
          <div class="font-semibold text-emerald-400 text-sm mb-1">Waste Generator Origin</div>
          <div class="text-gray-200 font-medium">${origin.name}</div>
          ${origin.wasteType ? `<div class="text-gray-400 mt-1">Feedstock: ${origin.wasteType}</div>` : ''}
          <div class="text-gray-500 text-[10px] mt-1">${origin.lat.toFixed(4)}° N, ${origin.lon.toFixed(4)}° E</div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([origin.lon, origin.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([origin.lon, origin.lat]);
    }

    // 2. Add Facilities Markers
    facilities.forEach((fac: any) => {
      const fid = fac.facility_id || fac.id;
      const lat = fac.latitude !== undefined ? fac.latitude : (fac.facility_location ? 18.0 : 0);
      const lon = fac.longitude !== undefined ? fac.longitude : 74.0;
      
      // If coordinates missing on CandidateEvaluation, try extracting from coords or skip
      if (!lat || !lon) return;

      const isRecommended = fid === recommendedId;
      const pathway: PathwayType = fac.pathway;

      let colorClass = 'bg-emerald-500';
      let pathwayLabel = 'Circular Pathway';
      let icon = '⚡';

      if (pathway === 'biochar') {
        colorClass = 'bg-amber-500';
        pathwayLabel = 'Biochar Pyrolysis';
        icon = '🔥';
      } else if (pathway === 'biogas') {
        colorClass = 'bg-sky-400';
        pathwayLabel = 'Anaerobic Biogas';
        icon = '💧';
      } else if (pathway === 'carbon_materials') {
        colorClass = 'bg-purple-400';
        pathwayLabel = 'Carbon Materials';
        icon = '🧱';
      }

      const el = document.createElement('div');
      el.className = `relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
        isRecommended ? 'z-30 w-10 h-10' : 'z-10 w-7 h-7'
      }`;

      el.innerHTML = `
        ${isRecommended ? `<span class="absolute w-12 h-12 rounded-full border-2 border-emerald-400 animate-ping"></span>` : ''}
        <div class="${isRecommended ? 'w-10 h-10 border-2 border-emerald-300 shadow-xl' : 'w-7 h-7 border border-[#080c0b] shadow-md'} rounded-full ${colorClass} flex items-center justify-center text-black text-xs font-bold">
          ${icon}
        </div>
      `;

      const name = fac.facility_name || fac.name;
      const operator = fac.operator || '';
      const netCarbon = fac.net_carbon_impact_tco2e !== undefined ? `${fac.net_carbon_impact_tco2e} tCO2e` : '';
      const distance = fac.distance_km !== undefined ? `${fac.distance_km.toFixed(1)} km` : '';

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="text-xs font-sans min-w-[200px]">
          ${isRecommended ? '<span class="inline-block px-2 py-0.5 mb-1 text-[10px] uppercase tracking-wider font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">★ Recommended</span>' : ''}
          <div class="font-bold text-gray-100 text-sm">${name}</div>
          <div class="text-xs text-gray-400 mb-2">${operator}</div>
          <div class="flex items-center gap-1.5 text-[11px] text-gray-300 mb-1">
            <span class="w-2 h-2 rounded-full ${colorClass}"></span>
            <span>${pathwayLabel}</span>
          </div>
          ${distance ? `<div class="text-gray-300 text-xs mt-1">Transit Distance: <b class="text-white">${distance}</b></div>` : ''}
          ${netCarbon ? `<div class="text-emerald-400 text-xs font-semibold">Net Abatement: ${netCarbon}</div>` : ''}
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lon, lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([lon, lat]);
    });

    // 3. Render Route Layer
    if (routeGeometry && routeGeometry.coordinates && routeGeometry.coordinates.length > 0) {
      routeGeometry.coordinates.forEach((coord) => {
        bounds.extend([coord[0], coord[1]]);
      });

      if (map.getSource('optimized-route')) {
        (map.getSource('optimized-route') as maplibregl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: routeGeometry as any
        });
      } else {
        map.addSource('optimized-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: routeGeometry as any
          }
        });

        // Glow casing layer
        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'optimized-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#10b981',
            'line-width': 8,
            'line-opacity': 0.35,
            'line-blur': 4
          }
        });

        // Inner crisp line layer
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'optimized-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#34d399',
            'line-width': 3.5,
            'line-opacity': 0.95
          }
        });
      }
    } else if (map.getSource('optimized-route')) {
      (map.getSource('optimized-route') as maplibregl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: [] }
      });
    }

    // Adjust camera bounds to fit markers and route nicely
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        maxZoom: 12,
        duration: 800
      });
      map.resize();
    }
  }, [mapLoaded, origin, facilities, recommendedId, routeGeometry]);

  return (
    <div className={`relative ${className} bg-[#0e1514] border border-[#1e332f]`}>
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 glass-panel px-3.5 py-2.5 rounded-xl border border-white/10 shadow-lg text-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-gray-300 font-medium">Generator Origin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-gray-300">Biochar (Pyrolysis)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
          <span className="text-gray-300">Biogas (AD/CBG)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
          <span className="text-gray-300">Carbon Materials</span>
        </div>
      </div>
    </div>
  );
}
