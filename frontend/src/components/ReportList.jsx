import React from 'react';
import { Calendar, MapPin, Clock, CheckCircle2, AlertCircle, RefreshCcw, Navigation, Lightbulb, AlertTriangle, Truck, Trash2 } from 'lucide-react';
import axios from 'axios';

const ReportList = ({ reports, onUpdate, showNotification }) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${apiUrl}/api/reportes/${id}/estado`, { status: newStatus });
      if (newStatus === 'En proceso') {
        showNotification('Reporte marcado como en proceso de atención.');
      } else if (newStatus === 'Resuelto') {
        showNotification('¡El reporte ha sido marcado como Resuelto!', 'success');
      }
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Error al actualizar el estado.', 'error');
    }
  };

  const openLocation = (lat, lng) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      '_blank'
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pendiente':  return { bg: '#fee2e2', color: '#991b1b', icon: <AlertCircle size={14} /> };
      case 'En proceso': return { bg: '#fef9c3', color: '#854d0e', icon: <RefreshCcw size={14} /> };
      case 'Resuelto':   return { bg: '#dcfce7', color: '#166534', icon: <CheckCircle2 size={14} /> };
      default:           return { bg: '#f1f5f9', color: '#475569', icon: null };
    }
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'Palo de Luz':    return <Lightbulb  size={16} color="#1d4ed8" />;
      case 'Hoyo':           return <AlertTriangle size={16} color="#d97706" />;
      case 'Carro Chatarra': return <Truck size={16} color="#7c3aed" />;
      case 'Basura':         return <Trash2 size={16} color="#dc2626" />;
      default:               return <AlertTriangle size={16} color="#64748b" />;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
      {reports.length === 0 && (
        <div style={{
          gridColumn: '1 / -1', textAlign: 'center', padding: '4rem',
          color: 'var(--text-dim)', fontSize: '1rem', fontWeight: 600,
        }}>
          No hay reportes registrados aún.
        </div>
      )}

      {reports.map((report) => {
        const status = getStatusStyle(report.status);
        const imgSrc = report.imageUrl?.startsWith('data:')
          ? report.imageUrl
          : report.imageUrl ? `${apiUrl}${report.imageUrl}` : null;
        const hasLocation = report.location?.lat && report.location?.lng;

        return (
          <div key={report._id} className="glass-card animate-fade" style={{ padding: 0, overflow: 'hidden' }}>

            {/* Image */}
            {imgSrc ? (
              <img
                src={imgSrc}
                alt="Reporte"
                style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100px',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {getCategoryIcon(report.type)}
              </div>
            )}

            <div style={{ padding: '1.2rem 1.4rem' }}>

              {/* Header: type + status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  {getCategoryIcon(report.type)}
                  {report.type}
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  background: status.bg, color: status.color,
                  borderRadius: '20px', padding: '3px 10px',
                  fontSize: '0.72rem', fontWeight: 700,
                }}>
                  {status.icon} {report.status}
                </span>
              </div>

              {/* Description */}
              <p style={{
                fontSize: '0.85rem', color: 'var(--text-dim)',
                lineHeight: 1.6, marginBottom: '1rem',
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {report.description}
              </p>

              {/* Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.9rem' }}>
                <Clock size={13} />
                {new Date(report.createdAt).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>

              {/* Location — clickable button to open Google Maps */}
              {hasLocation && (
                <button
                  onClick={() => openLocation(report.location.lat, report.location.lng)}
                  title="Abrir ubicación en Google Maps"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', marginBottom: '1rem',
                    padding: '0.55rem 0.9rem', borderRadius: '10px',
                    background: 'var(--bg-main)', border: '1.5px solid var(--border-ui)',
                    cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e0e9ff';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-main)';
                    e.currentTarget.style.borderColor = 'var(--border-ui)';
                  }}
                >
                  <MapPin size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', flex: 1 }}>
                    {report.location.lat.toFixed(5)}, {report.location.lng.toFixed(5)}
                  </span>
                  <Navigation size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
                </button>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {report.status !== 'En proceso' && report.status !== 'Resuelto' && (
                  <button
                    onClick={() => updateStatus(report._id, 'En proceso')}
                    style={{
                      flex: 1, padding: '0.55rem 0.5rem', borderRadius: '10px',
                      border: '1.5px solid #d97706', color: '#d97706',
                      background: '#fffbeb', cursor: 'pointer',
                      fontSize: '0.78rem', fontWeight: 700, transition: '0.2s',
                    }}
                  >
                    Atender
                  </button>
                )}
                {report.status !== 'Resuelto' && (
                  <button
                    onClick={() => updateStatus(report._id, 'Resuelto')}
                    style={{
                      flex: 1, padding: '0.55rem 0.5rem', borderRadius: '10px',
                      border: '1.5px solid #16a34a', color: '#16a34a',
                      background: '#f0fdf4', cursor: 'pointer',
                      fontSize: '0.78rem', fontWeight: 700, transition: '0.2s',
                    }}
                  >
                    Resolver
                  </button>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportList;
