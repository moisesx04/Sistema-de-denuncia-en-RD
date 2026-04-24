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
    const mk = (color) => new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: markerShadow,
      iconSize: [25, 41], iconAnchor: [12, 41],
      popupAnchor: [1, -34], shadowSize: [41, 41],
    });
    return {
      Luminaria: mk('blue'), Hoyo: mk('orange'),
      'Carro Chatarra': mk('violet'), Basura: mk('red'),
      Resolved: mk('green'),
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
            : (icons[r.type] || icons.Luminaria);
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
