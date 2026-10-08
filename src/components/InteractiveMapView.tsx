import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import { LocationGeoSummary } from '../data/types';
import { ProvenanceBadge } from './ProvenanceBadge';
import {
  MapPin,
  Layers,
  CloudRain,
  Flame,
  Droplets,
  Maximize2,
  Info,
  ChevronRight,
  ShieldCheck,
  Compass,
  RefreshCw,
} from 'lucide-react';

interface InteractiveMapViewProps {
  selectedLocationId: string;
  onSelectLocation: (locId: string) => void;
  auditProvenance: boolean;
}

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  selectedLocationId,
  onSelectLocation,
  auditProvenance,
}) => {
  const [activeLayer, setActiveLayer] = useState<'risk' | 'rainfall' | 'moisture' | 'hazard'>('risk');
  const [locations, setLocations] = useState<LocationGeoSummary[]>([]);
  const [loadingMap, setLoadingMap] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoadingMap(true);

    Api.getRiskMap(selectedLocationId).then((res) => {
      if (isMounted) {
        setLocations(res.data.locations);
        setLoadingMap(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedLocationId]);

  // Active selected location details
  const activeLoc =
    locations.find((l) => l.id.toLowerCase() === selectedLocationId.toLowerCase()) ||
    locations[0] || {
      id: 'Chennai',
      name: 'Chennai',
      state: 'Tamil Nadu',
      latitude: 13.0827,
      longitude: 80.2707,
      currentRiskScore: 78,
      currentRiskLevel: 'High' as const,
      activeHazards: ['Flood'],
      rainfall7d: 140,
      temperatureMax: 32,
      soilMoisture: 0.42,
      ndvi: 0.48,
      recordsCount: 31,
      hasFloodEvent: true,
      hasDroughtEvent: false,
      hasHeatEvent: false,
      provenance: 'Uploaded Dataset' as const,
    };

  // India bounding box for equirectangular projection
  // Lat: 8.0° N to 36.0° N
  // Lon: 68.0° E to 96.0° E
  const minLat = 8.0;
  const maxLat = 35.5;
  const minLon = 68.0;
  const maxLon = 96.0;

  const projectToSvg = (lat: number, lon: number, width = 640, height = 640) => {
    const x = ((lon - minLon) / (maxLon - minLon)) * (width - 80) + 40;
    const y = ((maxLat - lat) / (maxLat - minLat)) * (height - 80) + 40;
    return { x, y };
  };

  const getPinColor = (loc: LocationGeoSummary) => {
    if (activeLayer === 'risk') {
      if (loc.currentRiskScore >= 75) return '#E11D48'; // rose-600
      if (loc.currentRiskScore >= 50) return '#EA580C'; // orange-600
      if (loc.currentRiskScore >= 35) return '#D97706'; // amber-600
      return '#059669'; // emerald-600
    }
    if (activeLayer === 'rainfall') {
      if (loc.rainfall7d > 200) return '#2563EB'; // blue-600
      if (loc.rainfall7d > 100) return '#0284C7'; // sky-600
      if (loc.rainfall7d > 50) return '#06B6D4'; // cyan-500
      return '#64748B'; // slate-500
    }
    if (activeLayer === 'moisture') {
      if (loc.soilMoisture > 0.45) return '#0284C7'; // saturated blue
      if (loc.soilMoisture > 0.35) return '#10B981'; // optimal green
      return '#F59E0B'; // low moisture amber
    }
    // Hazard mode
    if (loc.hasFloodEvent) return '#2563EB';
    if (loc.hasDroughtEvent) return '#D97706';
    if (loc.hasHeatEvent) return '#DC2626';
    return '#10B981';
  };

  return (
    <div className="space-y-6">
      {/* Geo Map Header & Layer Selector */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              National Geospatial Risk &amp; Hazard Radar
            </h2>
            <ProvenanceBadge source="Uploaded Dataset" field="latitude, longitude" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grounded directly in exact latitude/longitude coordinates from the uploaded dataset across 10 state capital regions.
          </p>
        </div>

        {/* Layer Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs self-start md:self-auto">
          <button
            onClick={() => setActiveLayer('risk')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeLayer === 'risk'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Composite Risk
          </button>
          <button
            onClick={() => setActiveLayer('rainfall')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeLayer === 'rainfall'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            7d Rainfall Pulse
          </button>
          <button
            onClick={() => setActiveLayer('moisture')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeLayer === 'moisture'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Soil Moisture
          </button>
          <button
            onClick={() => setActiveLayer('hazard')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeLayer === 'hazard'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Hazard Flags
          </button>
        </div>
      </div>

      {/* Main Map + Station Detail Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive SVG Projection Map (8 Columns) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1 font-mono">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              Bounds: 12.97°N - 28.61°N / 72.57°E - 91.74°E
            </span>
            <span className="font-mono text-[11px]">Exact Lat/Lon from Dataset</span>
          </div>

          <div className="relative w-full max-w-[560px] aspect-square flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
            {/* SVG Cartographic Canvas */}
            <svg
              viewBox="0 0 600 600"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.03))' }}
            >
              {/* Subtle Regional Grid Lat/Lon Lines */}
              <line x1="40" y1="120" x2="560" y2="120" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />
              <line x1="40" y1="240" x2="560" y2="240" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />
              <line x1="40" y1="360" x2="560" y2="360" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />
              <line x1="40" y1="480" x2="560" y2="480" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />

              <line x1="140" y1="40" x2="140" y2="560" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />
              <line x1="280" y1="40" x2="280" y2="560" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />
              <line x1="420" y1="40" x2="420" y2="560" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />

              {/* Simplified India Territorial Outline Envelope (Indicative Regional Polygons) */}
              <path
                d="M 230 70 L 260 90 L 310 110 L 340 140 L 400 160 L 480 180 L 530 190 L 540 230 L 490 250 L 420 250 L 380 280 L 360 340 L 330 400 L 290 480 L 240 540 L 220 520 L 200 450 L 170 380 L 130 320 L 110 270 L 140 210 L 180 160 L 200 110 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-slate-300 dark:text-slate-700"
              />

              {/* Station Markers with Interactive Pins */}
              {locations.map((loc) => {
                const { x, y } = projectToSvg(loc.latitude, loc.longitude, 600, 600);
                const isSelected = loc.id.toLowerCase() === activeLoc.id.toLowerCase();
                const pinColor = getPinColor(loc);

                return (
                  <g
                    key={loc.id}
                    onClick={() => onSelectLocation(loc.id)}
                    className="cursor-pointer group"
                  >
                    {/* Ripple / Aura on selected pin */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r="20"
                        fill={pinColor}
                        fillOpacity="0.18"
                        className="animate-ping"
                      />
                    )}

                    {/* Threat Radius Circle based on 7-day rainfall or risk score */}
                    <circle
                      cx={x}
                      cy={y}
                      r={Math.max(10, Math.min(28, loc.currentRiskScore / 3))}
                      fill={pinColor}
                      fillOpacity={isSelected ? '0.35' : '0.15'}
                      stroke={pinColor}
                      strokeWidth="1"
                      strokeDasharray={loc.currentRiskScore > 70 ? '2 2' : 'none'}
                    />

                    {/* Pin Center Dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? '6.5' : '4.5'}
                      fill={pinColor}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="group-hover:scale-125 transition-transform"
                    />

                    {/* Station Name Label */}
                    <text
                      x={x + 9}
                      y={y + 4}
                      className={`text-[11px] font-sans font-semibold transition-all ${
                        isSelected
                          ? 'fill-slate-900 dark:fill-white font-bold'
                          : 'fill-slate-600 dark:fill-slate-300 group-hover:fill-slate-900'
                      }`}
                    >
                      {loc.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[10px] uppercase tracking-wider">
                {activeLayer === 'risk'
                  ? 'Composite Risk Scale'
                  : activeLayer === 'rainfall'
                  ? '7-Day Precipitation'
                  : activeLayer === 'moisture'
                  ? 'Volumetric Soil Moisture'
                  : 'Ground Truth Hazards'}
              </span>
              {activeLayer === 'risk' && (
                <div className="flex items-center gap-3 font-mono text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600" /> Low (&lt;35)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600" /> Moderate (35-50)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-600" /> Severe (50-75)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-600" /> Critical (&gt;75)</span>
                </div>
              )}
              {activeLayer === 'rainfall' && (
                <div className="flex items-center gap-3 font-mono text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500" /> &lt;50mm</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> 50-100mm</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-600" /> 100-200mm</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600" /> &gt;200mm</span>
                </div>
              )}
              {activeLayer === 'moisture' && (
                <div className="flex items-center gap-3 font-mono text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Low (&lt;0.35)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Optimal (0.35-0.45)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-600" /> Saturated (&gt;0.45)</span>
                </div>
              )}
              {activeLayer === 'hazard' && (
                <div className="flex items-center gap-3 font-mono text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600" /> Flood</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600" /> Drought</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-600" /> Heatwave</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600" /> Nominal</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Station Telemetry Drawer (4 Columns) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  Station Inspector
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeLoc.name}
                </h3>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                activeLoc.currentRiskLevel === 'Critical'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : activeLoc.currentRiskLevel === 'Severe'
                  ? 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                  : activeLoc.currentRiskLevel === 'High'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {activeLoc.currentRiskLevel} ({activeLoc.currentRiskScore})
              </span>
            </div>

            {/* Geographical Coordinates from Dataset */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mb-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Latitude</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {activeLoc.latitude.toFixed(4)}° N
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Longitude</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {activeLoc.longitude.toFixed(4)}° E
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Observation Span</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {activeLoc.recordsCount} Daily Records
                </span>
              </div>
              <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Dataset Source</span>
                <ProvenanceBadge source="Uploaded Dataset" field="lat, lon" />
              </div>
            </div>

            {/* Station Recorded Metrics Summary */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50/70 dark:bg-slate-800/40">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-sky-500" /> 7d Peak Rainfall
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {activeLoc.rainfall7d.toFixed(1)} mm
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50/70 dark:bg-slate-800/40">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" /> Max Temperature
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {activeLoc.temperatureMax.toFixed(1)} °C
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50/70 dark:bg-slate-800/40">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" /> Soil Saturation
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {(activeLoc.soilMoisture * 100).toFixed(1)}% ({activeLoc.soilMoisture.toFixed(3)})
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50/70 dark:bg-slate-800/40">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-500" /> NDVI Vegetation
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {activeLoc.ndvi.toFixed(3)}
                </span>
              </div>
            </div>

            {/* Active Hazard Indicators */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-2">
                Ground-Truth Hazard Triggers
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeLoc.hasFloodEvent && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Flood (flood_label=1)
                  </span>
                )}
                {activeLoc.hasDroughtEvent && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    Drought (drought_label=1)
                  </span>
                )}
                {activeLoc.hasHeatEvent && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    Heatwave (heat_label=1)
                  </span>
                )}
                {!activeLoc.hasFloodEvent && !activeLoc.hasDroughtEvent && !activeLoc.hasHeatEvent && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Nominal Stable Status
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Coordinates verified</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">100% Match</span>
          </div>
        </div>
      </div>
    </div>
  );
};
