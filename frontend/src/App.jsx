import React, { useState, useEffect } from 'react';
import { MapPin, Plus, List, Bell, Map as MapIcon, ShieldCheck, LayoutDashboard, CheckCircle2, AlertCircle, Clock, X } from 'lucide-react';
import ReportForm from './components/ReportForm';
import MapDashboard from './components/MapDashboard';
import ReportList from './components/ReportList';

function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [prefilledLocation, setPrefilledLocation] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchReports = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/reportes`);
      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'Pendiente').length,
    process: reports.filter(r => r.status === 'En proceso').length,
    resolved: reports.filter(r => r.status === 'Resuelto').length,
    luminarias: reports.filter(r => r.type === 'Palo de Luz').length,
    hoyos: reports.filter(r => r.type === 'Hoyo').length,
    chatarras: reports.filter(r => r.type === 'Carro Chatarra').length,
    basura: reports.filter(r => r.type === 'Basura').length
  };

  return (
    <div className="min-h-screen">
      {/* Notifications */}
      {notification && (
        <div 
          className="animate-fade"
          style={{
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 3000, background: notification.type === 'success' ? 'var(--accent)' : 'var(--primary)',
            color: 'white', padding: '1rem 2rem', borderRadius: '15px', fontWeight: 800,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '10px'
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <Bell size={20} />}
          {notification.message}
        </div>
      )}

      {/* Modern Sidebar / Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.8rem 2.5rem', background: '#ffffff',
        borderBottom: '1px solid var(--border-ui)',
        position: 'sticky', top: 0, zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
          }}>
            <ShieldCheck size={26} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', lineHeight: 1 }}>
              PROBLEMAS RD
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>MONITOREO CIUDADANO</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '14px' }}>
          {[
            { id: 'map', icon: <MapIcon size={18} />, label: 'Mapa' },
            { id: 'list', icon: <List size={18} />, label: 'Reportes' },
            { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Panel' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                background: activeTab === tab.id ? 'white' : 'transparent', 
                border: 'none', 
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-dim)',
                padding: '0.5rem 1rem', borderRadius: '10px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', 
                fontWeight: 700, fontSize: '0.85rem',
                boxShadow: activeTab === tab.id ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                transition: '0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <button className="btn-primary" onClick={() => { setPrefilledLocation(null); setShowForm(true); }}>
          <Plus size={20} /> Nuevo Reporte
        </button>
      </nav>

      <main style={{ padding: '2rem 3rem', maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade">
            <header style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Panel de Control</h2>
              <p style={{ color: 'var(--text-dim)' }}>Estadísticas generales del estado de la infraestructura en RD.</p>
            </header>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="stat-card">
                <div className="stat-label">Total Reportes</div>
                <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.total}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Pendientes</div>
                <div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.pending}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">En Proceso</div>
                <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.process}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Resueltos</div>
                <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.resolved}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Distribución por Tipo</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {[
                    { label: 'Luminarias / Postes', val: stats.luminarias, color: 'var(--primary)' },
                    { label: 'Hoyos / Averías viales', val: stats.hoyos, color: 'var(--warning)' },
                    { label: 'Carros Chatarra / Abandonados', val: stats.chatarras, color: '#8b5cf6' },
                    { label: 'Basura / Vertederos', val: stats.basura, color: '#ef4444' }
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
                        <span>{item.label}</span>
                        <span>{item.val} ({stats.total > 0 ? Math.round((item.val/stats.total)*100) : 0}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${stats.total > 0 ? (item.val/stats.total)*100 : 0}%`, height: '100%', background: item.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Actividad Reciente</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reports.slice(0, 4).map(report => (
                    <div key={report._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: report.status === 'Resuelto' ? 'var(--accent)' : 'var(--danger)' }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{report.type}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(report.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Tab */}
        <div style={{ display: activeTab === 'map' ? 'block' : 'none' }} className="animate-fade">
           <header style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Mapa Operativo</h2>
              <p style={{ color: 'var(--text-dim)' }}>Visualización geolocalizada de incidencias en tiempo real.</p>
            </header>
          <MapDashboard reports={reports} onReportHere={(loc) => { setPrefilledLocation(loc); setShowForm(true); }} />
        </div>

        {/* List Tab */}
        <div style={{ display: activeTab === 'list' ? 'block' : 'none' }} className="animate-fade">
           <header style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Listado de Incidencias</h2>
              <p style={{ color: 'var(--text-dim)' }}>Gestión detallada y actualización de estados.</p>
            </header>
          <ReportList reports={reports} onUpdate={fetchReports} showNotification={showNotification} />
        </div>
      </main>

      {/* Footer Premium */}
      <footer style={{ 
        marginTop: '2rem', 
        padding: '3rem 1.5rem', 
        textAlign: 'center', 
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ 
            fontSize: '0.9rem', 
            fontWeight: 800, 
            color: '#1e293b',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
          }}>
            Desarrollado con Excelencia por Moises Cuevas
          </p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Innovación y Monitoreo Ciudadano para la República Dominicana
          </p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #cbd5e1',
            fontSize: '0.7rem',
            color: '#94a3b8',
            fontWeight: 600
          }}>
            <span>&copy; {new Date().getFullYear()} RD REPORTES</span>
            <span>•</span>
            <span>SISTEMA DE DENUNCIA URBANA</span>
          </div>
        </div>
      </footer>

      {/* Modal Form */}
      {showForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.6)', zIndex: 2000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-card animate-fade" style={{ maxWidth: '500px', width: '95%', position: 'relative', padding: '2.5rem', background: 'white' }}>
            <button 
              onClick={() => setShowForm(false)}
              style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
