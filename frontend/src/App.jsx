import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, List, Bell, Map as MapIcon, ShieldCheck,
  LayoutDashboard, CheckCircle2, X, Search, MapPin, Loader2
} from 'lucide-react';
import ReportForm from './components/ReportForm';
import MapDashboard from './components/MapDashboard';
import ReportList from './components/ReportList';

/* ──────────────────────────────────────────────────────────────────────────
   Search bar that lives OUTSIDE the map.
   Uses OpenStreetMap Nominatim (free, no API key needed, finds businesses).
───────────────────────────────────────────────────────────────────────── */
function LocationSearchBar({ onLocationFound }) {
  const [query, setQuery]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [open, setOpen]             = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 3) { setSuggestions([]); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url =
          `https://nominatim.openstreetmap.org/search` +
          `?q=${encodeURIComponent(query + ', República Dominicana')}` +
          `&format=json&limit=6&countrycodes=do&addressdetails=1`;
        const res  = await fetch(url, { headers: { 'Accept-Language': 'es' } });
        const data = await res.json();
        setSuggestions(data);
        setOpen(true);
      } catch (_) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const pick = (item) => {
    setQuery(item.display_name.split(',')[0]);
    setSuggestions([]);
    setOpen(false);
    onLocationFound({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Input row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        background: '#fff', border: '2px solid var(--border-ui)',
        borderRadius: '16px', padding: '0 1rem',
        boxShadow: '0 4px 16px rgba(0,45,98,0.10)',
        transition: 'border-color 0.2s',
      }}
        onFocus={() => suggestions.length && setOpen(true)}
      >
        <Search size={20} color="var(--accent)" style={{ flexShrink: 0, marginRight: '10px' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          placeholder="Busca negocios, calles o plazas en RD..."
          style={{
            border: 'none', background: 'none', outline: 'none',
            padding: '0.85rem 0', fontSize: '0.95rem', width: '100%',
            color: 'var(--text-main)', fontWeight: 500,
          }}
        />
        {loading && <Loader2 size={18} className="animate-spin" color="var(--text-dim)" style={{ flexShrink:0 }} />}
        {!loading && query && (
          <X size={18} color="var(--text-dim)" style={{ cursor: 'pointer', flexShrink:0 }}
            onClick={() => { setQuery(''); setSuggestions([]); setOpen(false); }} />
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="glass-card animate-fade" style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          zIndex: 9999, padding: '6px', overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(0,45,98,0.18)',
        }}>
          {suggestions.map((item, i) => (
            <div
              key={item.place_id}
              onClick={() => pick(item)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                borderBottom: i < suggestions.length - 1 ? '1px solid var(--border-ui)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-main)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <MapPin size={16} color="var(--accent)" style={{ flexShrink:0, marginTop:'2px' }} />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {item.display_name.split(',')[0]}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  {item.display_name.split(',').slice(1, 3).join(',')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Main App
───────────────────────────────────────────────────────────────────────── */
function App() {
  const [activeTab, setActiveTab]           = useState('map');
  const [reports, setReports]               = useState([]);
  const [showForm, setShowForm]             = useState(false);
  const [prefilledLocation, setPrefilledLocation] = useState(null);
  const [notification, setNotification]     = useState(null);
  const [flyTarget, setFlyTarget]           = useState(null);

  const showNotif = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchReports = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res    = await fetch(`${apiUrl}/api/reportes`);
      const data   = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setReports([]);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const stats = {
    total:      reports.length,
    pending:    reports.filter(r => r.status === 'Pendiente').length,
    process:    reports.filter(r => r.status === 'En proceso').length,
    resolved:   reports.filter(r => r.status === 'Resuelto').length,
    luminarias: reports.filter(r => r.type === 'Palo de Luz').length,
    hoyos:      reports.filter(r => r.type === 'Hoyo').length,
    chatarras:  reports.filter(r => r.type === 'Carro Chatarra').length,
    basura:     reports.filter(r => r.type === 'Basura').length,
  };

  /* nav tab config */
  const tabs = [
    { id: 'map',       icon: <MapIcon size={18} />,       label: 'Mapa'     },
    { id: 'list',      icon: <List size={18} />,           label: 'Reportes' },
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Panel'   },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', overflowX: 'hidden' }}>

      {/* ── Toast notification ── */}
      {notification && (
        <div className="animate-fade" style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 4000, background: notification.type === 'success' ? 'var(--success)' : 'var(--primary)',
          color: 'white', padding: '0.9rem 2rem', borderRadius: '14px',
          fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.20)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <Bell size={20} />}
          {notification.message}
        </div>
      )}

      {/* ── Navbar ── */}
      <nav style={{
        background: 'var(--primary)',
        position: 'sticky', top: 0, zIndex: 1000,
        boxShadow: '0 2px 16px rgba(0,45,98,0.25)',
      }}>
        {/* top stripe — DR flag red */}
        <div style={{ height: '4px', background: 'var(--accent)', width: '100%' }} />

        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0 1rem', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          height: '64px', minWidth: 0,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(206,17,38,0.40)',
            }}>
              <ShieldCheck size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.3px' }}>
                PROBLEMAS RD
              </h1>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600, letterSpacing: '0.08em' }}>
                SISTEMA CIUDADANO
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: '4px',
            background: 'rgba(255,255,255,0.10)', padding: '4px',
            borderRadius: '16px',
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '0.5rem 1rem', borderRadius: '12px',
                  border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.83rem',
                  background: activeTab === tab.id ? '#fff' : 'transparent',
                  color:      activeTab === tab.id ? 'var(--primary)' : 'rgba(255,255,255,0.8)',
                  transition: '0.2s',
                  boxShadow:  activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {tab.icon} <span className="hide-mobile">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* CTA */}
          <button className="btn-primary"
            onClick={() => { setPrefilledLocation(null); setShowForm(true); }}
          >
            <Plus size={18} /> <span className="hide-mobile">Nuevo Reporte</span>
          </button>
        </div>
      </nav>

      {/* ── Main ── */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade">
            <header style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>Panel de Control</h2>
              <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>Estadísticas de la infraestructura urbana en RD.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.2rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total', val: stats.total,    color: 'var(--primary)' },
                { label: 'Pendientes', val: stats.pending,  color: 'var(--accent)'  },
                { label: 'En Proceso', val: stats.process,  color: 'var(--warning)' },
                { label: 'Resueltos',  val: stats.resolved, color: 'var(--success)' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '1.8rem' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '1.2rem' }}>Distribución por Tipo</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: 'Luminarias',   val: stats.luminarias, color: '#2563eb' },
                    { label: 'Hoyos / Vial', val: stats.hoyos,      color: '#d97706' },
                    { label: 'Chatarras',    val: stats.chatarras,  color: '#7c3aed' },
                    { label: 'Basura',       val: stats.basura,     color: '#dc2626' },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem', fontWeight:700, marginBottom:'6px' }}>
                        <span>{item.label}</span>
                        <span>{item.val} ({stats.total > 0 ? Math.round((item.val/stats.total)*100) : 0}%)</span>
                      </div>
                      <div style={{ background: 'var(--bg-main)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: item.color, width: `${stats.total > 0 ? (item.val/stats.total)*100 : 0}%`, borderRadius: '6px', transition: 'width 0.6s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.8rem' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '1.2rem' }}>Actividad Reciente</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {reports.slice(0, 5).map(r => (
                    <div key={r._id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '0.7rem 1rem', background: 'var(--bg-main)', borderRadius: '12px',
                    }}>
                      <div style={{
                        width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                        background: r.status === 'Resuelto' ? 'var(--success)' : r.status === 'En proceso' ? 'var(--warning)' : 'var(--accent)',
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.83rem', fontWeight: 700 }}>{r.type}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAP */}
        <div style={{ display: activeTab === 'map' ? 'block' : 'none' }} className="animate-fade">
          <header style={{ marginBottom: '1.4rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Mapa Operativo</h2>
            <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>Visualización en tiempo real. Haz clic en el mapa para reportar.</p>
          </header>

          {/* ── SEARCH BAR — outside the map ── */}
          <div className="search-wrapper" style={{ marginBottom: '1rem', width: '100%', minWidth: 0 }}>
            <LocationSearchBar onLocationFound={(coords) => setFlyTarget(coords)} />
          </div>

          <MapDashboard
            reports={reports}
            flyTarget={flyTarget}
            onReportHere={(loc) => { setPrefilledLocation(loc); setShowForm(true); }}
          />
        </div>

        {/* LIST */}
        <div style={{ display: activeTab === 'list' ? 'block' : 'none' }} className="animate-fade">
          <header style={{ marginBottom: '1.4rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Listado de Incidencias</h2>
            <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>Gestión y actualización de estados.</p>
          </header>
          <ReportList reports={reports} onUpdate={fetchReports} showNotification={showNotif} />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{
        background: 'var(--primary)',
        borderTop: '4px solid var(--accent)',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        marginTop: '3rem',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Desarrollado por Moises Cuevas
        </p>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', marginTop: '6px' }}>
          Innovación y Tecnología para la Gestión Urbana · República Dominicana
        </p>
        <div style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.30)', fontSize: '0.72rem', fontWeight: 600 }}>
          © {new Date().getFullYear()} PROBLEMAS RD · SISTEMA DE DENUNCIA CIUDADANA
        </div>
      </footer>

      {/* ── Modal Form ── */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 3000,
          background: 'rgba(0,45,98,0.55)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="glass-card animate-fade" style={{
            maxWidth: '500px', width: '95%', position: 'relative', padding: '2.5rem',
          }}>
            <button
              onClick={() => setShowForm(false)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'var(--bg-main)', border: 'none',
                borderRadius: '50%', width: '32px', height: '32px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-main)',
              }}
            >
              <X size={18} />
            </button>
            <ReportForm
              initialLocation={prefilledLocation}
              onClose={() => { setShowForm(false); fetchReports(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
