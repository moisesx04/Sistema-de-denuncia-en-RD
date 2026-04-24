import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Esri Geocoder
import * as Esri from 'esri-leaflet-geocoder';
import 'esri-leaflet-geocoder/dist/esri-leaflet-geocoder.css';

import { Lightbulb, AlertTriangle, Eye, Map as MapIcon, X, PlusCircle, Truck, Trash2, Search, MapPin } from 'lucide-react';

// Standard Leaflet Assets
import 'leaflet/dist/leaflet.css';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { Search, MapPin, X, Loader2 } from 'lucide-react';

const CustomSearchField = () => {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${encodeURIComponent(query)}&f=json&location=-70.1627,18.7357&maxSuggestions=5&countryCode=DOM`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (magicKey, text) => {
    setQuery(text);
    setSuggestions([]);
    setShowResults(false);
    try {
      const res = await fetch(`https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?magicKey=${magicKey}&f=json&outFields=Addr_type,Match_addr,StAddr,City`);
      const data = await res.json();
      if (data.candidates && data.candidates.length > 0) {
        const { x, y } = data.candidates[0].location;
        map.setView([y, x], 17);
      }
    } catch (err) {
      console.error("Select error:", err);
    }
  };

  return (
    <div style={{ 
      position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', 
      zIndex: 2000, width: '90%', maxWidth: '450px' 
    }}>
      <div className="glass-card" style={{ 
        display: 'flex', alignItems: 'center', padding: '8px 16px', 
        background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-ui)'
      }}>
        <Search size={20} color="var(--primary)" style={{ marginRight: '12px' }} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
          placeholder="Busca negocios, plazas o calles..."
          style={{ 
            background: 'none', border: 'none', color: 'white', outline: 'none',
            width: '100%', fontSize: '0.9rem', fontWeight: 500
          }}
        />
        {loading ? <Loader2 size={18} className="animate-spin" color="var(--text-dim)" /> : 
         query && <X size={18} color="var(--text-dim)" style={{ cursor: 'pointer' }} onClick={() => setQuery('')} />}
      </div>

      {showResults && suggestions.length > 0 && (
        <div className="glass-card animate-fade" style={{ 
          marginTop: '10px', overflow: 'hidden', padding: '8px',
          background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--border-ui)'
        }}>
          {suggestions.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => handleSelect(item.magicKey, item.text)}
              style={{ 
                padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s',
                borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'none'}
            >
              <MapPin size={16} color="var(--primary)" />
              <div style={{ fontSize: '0.85rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function MapEventsHandler({ onMapClick }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const handleClick = (e) => {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    };
    
    setTimeout(() => { map.invalidateSize(); }, 400);

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [map, onMapClick]);
  return null;
}

const MapDashboard = ({ reports = [], onReportHere }) => {
  const [clickedPos, setClickedPos] = useState(null);
  const center = [18.4861, -69.9312];

  const icons = useMemo(() => {
    const createIcon = (color) => new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    return {
      Luminaria: createIcon('blue'),
      Hoyo: createIcon('orange'),
      'Carro Chatarra': createIcon('violet'),
      Basura: createIcon('red'),
      Resolved: createIcon('green')
    };
  }, []);

  const openStreetView = useCallback((lat, lng) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  }, []);

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'Palo de Luz': return <Lightbulb size={18} color="#3b82f6" />;
      case 'Hoyo': return <AlertTriangle size={18} color="#f59e0b" />;
      case 'Carro Chatarra': return <Truck size={18} color="#8b5cf6" />;
      case 'Basura': return <Trash2 size={18} color="#ef4444" />;
      default: return <AlertTriangle size={18} />;
    }
  };

  return (
    <div style={{ minHeight: '450px', height: '70vh', width: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-ui)', position: 'relative', boxShadow: var(--shadow-ui) }}>
      <MapContainer 
        key="rd-problems-map-vPremium"
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <CustomSearchField />
        <MapEventsHandler onMapClick={setClickedPos} />

        {Array.isArray(reports) && reports.map((report) => {
          if (!report?.location?.lat || !report?.location?.lng) return null;
          let iconType = icons.Resolved;
          if (report.status !== 'Resuelto') {
            iconType = icons[report.type] || icons.Luminaria;
            if (report.type === 'Palo de Luz') iconType = icons.Luminaria;
          }
          
          return (
            <Marker 
              key={report._id} 
              position={[report.location.lat, report.location.lng]}
              icon={iconType}
            >
              <Popup>
                <div style={{ minWidth: '220px', color: '#1e293b' }}>
                  <img 
                    src={report.imageUrl.startsWith('data:') ? report.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${report.imageUrl}`} 
                    alt="Report" 
                    style={{ width: '100%', borderRadius: '12px', marginBottom: '10px', height: '120px', objectFit: 'cover' }} 
                    onError={(e) => e.target.src = 'https://via.placeholder.com/200x120?text=Evidencia'}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {getCategoryIcon(report.type)}
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{report.type}</span>
                  </div>
                  <div style={{ padding: '3px 8px', borderRadius: '12px', background: report.status === 'Resuelto' ? '#dcfce7' : '#f8fafc', display: 'inline-block', fontSize: '0.65rem', fontWeight: 800, color: report.status === 'Resuelto' ? '#166534' : '#64748b', marginBottom: '10px' }}>
                    {report.status}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '12px', lineHeight: '1.4' }}>{report.description}</p>
                  
                  <button 
                    onClick={() => openStreetView(report.location.lat, report.location.lng)}
                    style={{ 
                      width: '100%', background: 'white', border: '1px solid #e2e8f0',
                      color: '#1e293b', padding: '8px', borderRadius: '10px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600
                    }}
                  >
                    <MapIcon size={16} /> Smart View
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Action Card (Bottom Right Version) */}
      {clickedPos && (
        <div className="animate-fade dashboard-floating-card" style={{
          position: 'absolute', bottom: '20px', left: '20px', zIndex: 1001,
          background: 'white', padding: '1.2rem', borderRadius: '24px',
          border: '1px solid var(--border-ui)', boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', gap: '1rem', width: 'calc(100% - 40px)', maxWidth: '320px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Punto seleccionado</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{clickedPos[0].toFixed(4)}, {clickedPos[1].toFixed(4)}</div>
            </div>
            <button onClick={() => setClickedPos(null)} style={{ background: '#f1f5f9', border: 'none', color: '#94a3b8', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <button 
              onClick={() => { onReportHere({ lat: clickedPos[0], lng: clickedPos[1] }); setClickedPos(null); }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
            >
              <PlusCircle size={20} /> Reportar Problema
            </button>
            <button 
              onClick={() => openStreetView(clickedPos[0], clickedPos[1])} 
              className="btn-primary" 
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b', boxShadow: 'none', width: '100%', justifyContent: 'center', padding: '0.8rem' }}
            >
              <Eye size={20} /> Smart View
            </button>
          </div>
        </div>
      )}

      {/* Legend (Bottom Left) */}
      <div className="map-legend" style={{
        position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000,
        background: 'rgba(255,255,255,0.95)', padding: '12px 18px', borderRadius: '20px',
        border: '1px solid var(--border-ui)', backdropFilter: 'blur(10px)',
        display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', fontWeight: 700,
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6' }}></div> Luminaria</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div> Hoyo / Vial</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8b5cf6' }}></div> Carro Chatarra</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div> Basura</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '5px', borderTop: '1px solid #e2e8f0', paddingTop: '5px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div> Resuelto</div>
      </div>
    </div>
  );
};

export default MapDashboard;
