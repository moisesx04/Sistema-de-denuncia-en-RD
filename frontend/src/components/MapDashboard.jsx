import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Lightbulb, AlertTriangle, Eye, PlusCircle, Truck, Trash2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

/* ─── Fly-to helper used by the external search bar ─────────────────────── */
export function FlyToController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 17, { duration: 1.2 });
  }, [target, map]);
  return null;
}

/* ─── Click-on-map handler ───────────────────────────────────────────────── */
function MapEventsHandler({ onMapClick }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const handler = (e) => onMapClick([e.latlng.lat, e.latlng.lng]);
    setTimeout(() => map.invalidateSize(), 400);
    map.on('click', handler);
    return () => map.off('click', handler);
  }, [map, onMapClick]);
  return null;
}

/* ─── Main map component ─────────────────────────────────────────────────── */
const MapDashboard = ({ reports = [], onReportHere, flyTarget }) => {
  const [clickedPos, setClickedPos] = useState(null);
  const center = [18.4861, -69.9312];

  const icons = useMemo(() => {
    const makeSvgIcon = (svgContent, color, size = 44) => L.divIcon({
      className: '',
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
      html: `
        <div style="
          width:${size}px; height:${size}px;
          display:flex; align-items:center; justify-content:center;
          background:${color}; border-radius:50% 50% 50% 4px;
          border:3px solid rgba(255,255,255,0.9);
          box-shadow:0 4px 12px rgba(0,0,0,0.30);
          transform:rotate(0deg);
          cursor:pointer;
        ">
          ${svgContent}
        </div>`,
    });

    // 🔵 Palo de Luz — blue street lamp
    const lampSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="22" x2="12" y2="10"/>
      <path d="M12 10 C12 10 12 4 18 4"/>
      <line x1="18" y1="4" x2="18" y2="8"/>
      <line x1="15" y1="8" x2="21" y2="8"/>
      <circle cx="12" cy="22" r="1" fill="white"/>
    </svg>`;

    // 🟡 Hoyo — yellow pothole
    const holeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
      <ellipse cx="13" cy="16" rx="9" ry="4.5" fill="rgba(0,0,0,0.55)"/>
      <ellipse cx="13" cy="15" rx="7.5" ry="3.5" fill="#111"/>
      <path d="M5 11 Q7 6 10 9 Q11 5 14 7.5 Q16 4 20 8 Q23 10 21 14" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`;

    // 🔴 Basura — red trash container
    const trashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>`;

    // 🟣 Carro Chatarra — purple wrecked car
    const carSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1l2-4h10l2 4h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/>
      <circle cx="7" cy="17" r="2" fill="white" stroke="white"/>
      <circle cx="17" cy="17" r="2" fill="white" stroke="white"/>
      <line x1="10" y1="9" x2="14" y2="13" stroke-width="2.5"/>
      <line x1="14" y1="9" x2="10" y2="13" stroke-width="2.5"/>
    </svg>`;

    // 🟢 Resuelto — green check
    const checkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`;

    return {
      'Palo de Luz':    makeSvgIcon(lampSvg,  '#1d4ed8', 44),
      Hoyo:             makeSvgIcon(holeSvg,  '#d97706', 44),
      Basura:           makeSvgIcon(trashSvg, '#dc2626', 44),
      'Carro Chatarra': makeSvgIcon(carSvg,   '#7c3aed', 44),
      Resolved:         makeSvgIcon(checkSvg, '#16a34a', 40),
    };
  }, []);

  const openMaps = useCallback((lat, lng) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  }, []);

  const catIcon = (type) => {
    switch (type) {
      case 'Palo de Luz':    return <Lightbulb  size={16} color="#3b82f6" />;
      case 'Hoyo':           return <AlertTriangle size={16} color="#f59e0b" />;
      case 'Carro Chatarra': return <Truck size={16} color="#8b5cf6" />;
      case 'Basura':         return <Trash2 size={16} color="#ef4444" />;
      default:               return <AlertTriangle size={16} />;
    }
  };

  return (
    <div style={{
      height: '68vh', minHeight: '420px', width: '100%',
      borderRadius: '20px', overflow: 'hidden',
      border: '2px solid var(--border-ui)',
      boxShadow: 'var(--shadow-lg)',
      position: 'relative',
    }}>
      <MapContainer
        key="rd-map-v3"
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* external search bar drives this */}
        <FlyToController target={flyTarget} />
        <MapEventsHandler onMapClick={setClickedPos} />

        {/* report markers */}
        {Array.isArray(reports) && reports.map((r) => {
          if (!r?.location?.lat || !r?.location?.lng) return null;
          const icon = r.status === 'Resuelto'
            ? icons.Resolved
            : (icons[r.type] || icons['Palo de Luz']);
          const imgSrc = r.imageUrl?.startsWith('data:image')
            ? r.imageUrl
            : r.imageUrl ? `/uploads/${r.imageUrl}` : null;
          return (
            <Marker key={r._id} position={[r.location.lat, r.location.lng]} icon={icon}>
              <Popup>
                <div style={{ minWidth: '200px', fontFamily: 'Inter,sans-serif' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px', fontWeight:800 }}>
                    {catIcon(r.type)} {r.type}
                  </div>
                  {imgSrc && (
                    <img src={imgSrc} alt="reporte"
                      style={{ width:'100%', borderRadius:'10px', marginBottom:'8px', maxHeight:'130px', objectFit:'cover' }} />
                  )}
                  <p style={{ fontSize:'0.78rem', color:'#555', marginBottom:'8px' }}>{r.description}</p>
                  <div style={{
                    background: r.status === 'Resuelto' ? '#dcfce7' : r.status === 'En proceso' ? '#fef9c3' : '#fee2e2',
                    color:      r.status === 'Resuelto' ? '#166534' : r.status === 'En proceso' ? '#854d0e' : '#991b1b',
                    borderRadius:'8px', padding:'3px 10px', fontSize:'0.72rem', fontWeight:700,
                    display:'inline-block', marginBottom:'8px',
                  }}>{r.status}</div>
                  <button
                    onClick={() => openMaps(r.location.lat, r.location.lng)}
                    style={{
                      display:'flex', alignItems:'center', gap:'4px',
                      background:'var(--primary)', color:'white', border:'none',
                      borderRadius:'8px', padding:'5px 10px', cursor:'pointer',
                      fontSize:'0.75rem', fontWeight:700, width:'100%', justifyContent:'center',
                    }}
                  >
                    <Eye size={13} /> Ver en Google Maps
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* clicked position action */}
        {clickedPos && (
          <Marker position={clickedPos} icon={icons.Hoyo}>
            <Popup>
              <div style={{ textAlign:'center', fontFamily:'Inter,sans-serif' }}>
                <p style={{ fontWeight:700, marginBottom:'10px', fontSize:'0.9rem' }}>📍 Ubicación seleccionada</p>
                <button
                  className="btn-primary"
                  onClick={() => { onReportHere && onReportHere(clickedPos); setClickedPos(null); }}
                  style={{ width:'100%', justifyContent:'center', padding:'0.6rem' }}
                >
                  <PlusCircle size={16} /> Reportar aquí
                </button>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Legend */}
      <div className="map-legend" style={{
        position:'absolute', bottom:'16px', right:'16px', zIndex:1000,
        background:'rgba(255,255,255,0.95)', padding:'10px 16px',
        borderRadius:'14px', border:'1px solid var(--border-ui)',
        backdropFilter:'blur(8px)', fontSize:'0.72rem', fontWeight:700,
        display:'flex', flexDirection:'column', gap:'6px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      }}>
        {[
          { color:'#3b82f6', label:'Luminaria' },
          { color:'#f59e0b', label:'Hoyo / Vial' },
          { color:'#8b5cf6', label:'Carro Chatarra' },
          { color:'#ef4444', label:'Basura' },
          { color:'#16a34a', label:'Resuelto' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:color, flexShrink:0 }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapDashboard;
