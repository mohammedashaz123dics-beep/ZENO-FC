import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Users, Radar, Loader2, AlertCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const sportEmojis = {
  football: '🏈', basketball: '🏀', soccer: '⚽', baseball: '⚾', hockey: '🏒', cricket: '🏏', other: '🏟️'
};

const sportFilters = ['all', 'football', 'basketball', 'soccer', 'baseball', 'hockey', 'cricket', 'other'];

const getStyleUrl = (theme) => theme === 'white'
  ? 'https://tiles.openfreemap.org/styles/positron'
  : 'https://tiles.openfreemap.org/styles/liberty';

const mapSport = (sportTag) => {
  const mapping = {
    'soccer': 'soccer',
    'american_football': 'football',
    'basketball': 'basketball',
    'baseball': 'baseball',
    'ice_hockey': 'hockey',
    'hockey': 'hockey',
    'cricket': 'cricket',
  };
  const firstSport = (sportTag || '').split(';')[0].trim();
  return mapping[firstSport] || 'other';
};

const parseOverpassResult = (elements) => {
  const seen = new Set();
  return elements
    .filter(el => el.tags && el.tags.name)
    .map(el => {
      const lat = el.lat || el.center?.lat;
      const lon = el.lon || el.center?.lon;
      if (!lat || !lon) return null;
      const key = `${el.tags.name}_${lat.toFixed(4)}_${lon.toFixed(4)}`;
      if (seen.has(key)) return null;
      seen.add(key);
      return {
        name: el.tags.name,
        lat,
        lng: lon,
        sport: mapSport(el.tags.sport),
        capacity: el.tags.capacity ? parseInt(el.tags.capacity) : null,
      };
    })
    .filter(Boolean);
};

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const fetchNearbyStadiums = async (lat, lon) => {
  const query = `[out:json][timeout:25];(
    node["leisure"="stadium"](around:100000,${lat},${lon});
    way["leisure"="stadium"](around:100000,${lat},${lon});
    node["leisure"="pitch"]["name"](around:100000,${lat},${lon});
    way["leisure"="pitch"]["name"](around:100000,${lat},${lon});
  );out center 500;`;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!response.ok) throw new Error('Failed to fetch nearby stadiums');
  const data = await response.json();
  return parseOverpassResult(data.elements || []);
};

export default function StadiumMap({ stadiums = [], selectedStadium, onSelectStadium }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeSport, setActiveSport] = useState('all');
  const [mapReady, setMapReady] = useState(false);
  const [tileTheme, setTileTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');
  const [nearbyStadiums, setNearbyStadiums] = useState(null);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [nearbyError, setNearbyError] = useState(null);

  const displayStadiums = nearbyStadiums !== null ? nearbyStadiums : stadiums;
  const filteredStadiums = activeSport === 'all' ? displayStadiums : displayStadiums.filter(s => s.sport === activeSport);

  // Theme observer
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTileTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Initialize map
  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: getStyleUrl(tileTheme),
      center: [0, 20],
      zoom: 2,
    });
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.on('load', () => setMapReady(true));
    return () => {
      map.current?.remove();
      map.current = null;
      setMapReady(false);
    };
  }, []);

  // Update style when theme changes
  useEffect(() => {
    if (!map.current || !mapReady) return;
    map.current.setStyle(getStyleUrl(tileTheme));
  }, [tileTheme, mapReady]);

  // Update markers + dynamically center
  useEffect(() => {
    if (!map.current || !mapReady) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (filteredStadiums.length === 0) return;

    filteredStadiums.forEach((stadium) => {
      const el = document.createElement('div');
      el.style.cursor = 'pointer';
      const bgColor = stadium.sport === 'other' ? '#6366f1' : '#f97316';
      el.innerHTML = `<div style="background:${bgColor};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;">${sportEmojis[stadium.sport] || '🏟️'}</div>`;
      const popupContent = stadium.capacity
        ? `Capacity: ${stadium.capacity.toLocaleString()}`
        : `Sport: ${stadium.sport === 'other' ? 'Multi-purpose' : stadium.sport}`;
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<div style="min-width:150px;"><p style="font-weight:600;margin:0;color:#1e293b;">${stadium.name}</p><p style="font-size:12px;color:#64748b;margin:4px 0 0;">${popupContent}</p></div>`
      );
      const marker = new maplibregl.Marker(el)
        .setLngLat([stadium.lng, stadium.lat])
        .setPopup(popup)
        .addTo(map.current);
      el.addEventListener('click', () => onSelectStadium?.(stadium));
      markersRef.current.push(marker);
    });

    if (filteredStadiums.length === 1) {
      map.current.flyTo({ center: [filteredStadiums[0].lng, filteredStadiums[0].lat], zoom: 12 });
    } else {
      const bounds = new maplibregl.LngLatBounds();
      filteredStadiums.forEach(s => bounds.extend([s.lng, s.lat]));
      map.current.fitBounds(bounds, { padding: 40, maxZoom: 14 });
    }
  }, [filteredStadiums, mapReady]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        if (map.current && mapReady) {
          if (userMarkerRef.current) userMarkerRef.current.remove();
          const el = document.createElement('div');
          el.innerHTML = '<div style="background:#3b82f6;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:12px;">📍</div>';
          userMarkerRef.current = new maplibregl.Marker(el)
            .setLngLat([longitude, latitude])
            .setPopup(new maplibregl.Popup({ offset: 15 }).setHTML('<p style="font-weight:600;color:#1e293b;">You are here</p>'))
            .addTo(map.current);
        }
      }, () => {});
    }
  }, [mapReady]);

  const addUserMarker = (lat, lon) => {
    if (!map.current) return;
    if (userMarkerRef.current) userMarkerRef.current.remove();
    const el = document.createElement('div');
    el.innerHTML = '<div style="background:#3b82f6;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:12px;">📍</div>';
    userMarkerRef.current = new maplibregl.Marker(el)
      .setLngLat([lon, lat])
      .setPopup(new maplibregl.Popup({ offset: 15 }).setHTML('<p style="font-weight:600;color:#1e293b;">You are here</p>'))
      .addTo(map.current);
  };

  const handleFindNearby = async () => {
    setLoadingNearby(true);
    setNearbyError(null);
    try {
      let lat, lon;
      if (userLocation) {
        [lat, lon] = userLocation;
      } else {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, enableHighAccuracy: true });
        });
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        setUserLocation([lat, lon]);
        addUserMarker(lat, lon);
      }

      const results = await fetchNearbyStadiums(lat, lon);
      results.sort((a, b) =>
        calculateDistanceKm(lat, lon, a.lat, a.lng) - calculateDistanceKm(lat, lon, b.lat, b.lng)
      );
      setNearbyStadiums(results);
      setActiveSport('all');
    } catch (err) {
      setNearbyError(
        err.code === 1 ? 'Location access denied. Enable GPS to find nearby stadiums.'
        : 'Failed to scan nearby stadiums. Try again.'
      );
    } finally {
      setLoadingNearby(false);
    }
  };

  const handleShowAll = () => {
    setNearbyStadiums(null);
    setNearbyError(null);
    setActiveSport('all');
  };

  const handleMyLocation = () => {
    if (userLocation && map.current) {
      map.current.flyTo({ center: [userLocation[1], userLocation[0]], zoom: 12 });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900"
    >
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-xl">
            <MapPin className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">
              {nearbyStadiums !== null ? 'Stadiums Near You' : 'Nearby Stadiums'}
            </h3>
            <p className="text-slate-400 text-sm">
              {filteredStadiums.length} venues{nearbyStadiums !== null ? ' within 100km' : ' found'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {nearbyStadiums !== null && (
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800" onClick={handleShowAll}>
              Show All
            </Button>
          )}
          {userLocation && (
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800" onClick={handleMyLocation}>
              <Navigation className="w-4 h-4 mr-1" />
              My GPS
            </Button>
          )}
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:opacity-90" onClick={handleFindNearby} disabled={loadingNearby}>
            {loadingNearby ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Radar className="w-4 h-4 mr-2" />}
            {loadingNearby ? 'Scanning...' : 'Find Nearby'}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {nearbyError && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{nearbyError}</span>
          <button className="ml-auto text-red-400 hover:text-red-300" onClick={() => setNearbyError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sport Filter */}
      <div className="px-4 pt-3 pb-1 flex gap-2 overflow-x-auto scrollbar-hide">
        {sportFilters.map(sport => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeSport === sport
                ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            {sport !== 'all' && <span>{sportEmojis[sport]}</span>}
            <span className="capitalize">{sport === 'all' ? 'All Sports' : sport === 'other' ? 'Other' : sport}</span>
          </button>
        ))}
      </div>

      {/* Map container with loading overlay */}
      <div className="h-[300px] relative">
        <div ref={mapContainer} className="absolute inset-0" />
        {loadingNearby && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
              <p className="text-slate-300 text-sm">Scanning for stadiums within 100km...</p>
            </div>
          </div>
        )}
      </div>

      {/* Stadium List */}
      <div className="p-4 space-y-3 max-h-[200px] overflow-y-auto">
        {filteredStadiums.length > 0 ? (
          filteredStadiums.map((stadium, idx) => (
            <motion.div
              key={`${stadium.name}-${idx}`}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                onSelectStadium?.(stadium);
                if (map.current) map.current.flyTo({ center: [stadium.lng, stadium.lat], zoom: 12 });
              }}
              className={`p-3 rounded-xl cursor-pointer transition-all ${
                selectedStadium?.name === stadium.name
                  ? 'bg-orange-500/20 border border-orange-500/50'
                  : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{stadium.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    {userLocation && (
                      <span className="text-slate-400 text-sm flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {calculateDistanceKm(userLocation[0], userLocation[1], stadium.lat, stadium.lng).toFixed(1)} km
                      </span>
                    )}
                    {stadium.capacity && (
                      <span className="text-slate-400 text-sm flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {stadium.capacity.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-2xl">{sportEmojis[stadium.sport] || '🏟️'}</span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">
              {nearbyStadiums !== null ? 'No stadiums found within 100km' : 'No stadiums for this sport'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}