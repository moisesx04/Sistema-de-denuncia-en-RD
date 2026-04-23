import React from 'react';
import { Calendar, MapPin, Clock, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';
import axios from 'axios';

const ReportList = ({ reports, onUpdate, showNotification }) => {
  const updateStatus = async (id, newStatus) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.put(`${apiUrl}/api/reportes/${id}/estado`, { status: newStatus });
      if (newStatus === 'En proceso') {
        showNotification('Reporte marcado como Visto y en proceso de atención.');
      } else if (newStatus === 'Resuelto') {
        showNotification('¡Excelente! El reporte ha sido marcado como Resuelto.', 'success');
      }
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Error al actualizar el estado.', 'error');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pendiente': return <AlertCircle size={18} color="#ff4757" />;
      case 'En proceso': return <RefreshCcw size={18} color="#eccc68" />;
      case 'Resuelto': return <CheckCircle2 size={18} color="#2ed573" />;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
      {reports.length === 0 && (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          No hay reportes registrados.
        </div>
      )}
      {reports.map((report) => (
        <div key={report._id} className="glass-card animate-fade" style={{ padding: '0', overflow: 'hidden' }}>
          <img 
            src={report.imageUrl.startsWith('data:') ? report.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${report.imageUrl}`} 
            alt="Report" 
            style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
          />
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                {getStatusIcon(report.status)}
                {report.status}
              </div>
              <div style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', fontSize: '0.7rem', fontWeight: 600 }}>
                {report.type}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Clock size={14} />
                {new Date(report.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <p style={{ marginBottom: '1rem', lineHeight: '1.5' }}>{report.description}</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <MapPin size={14} />
              RD: {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {report.status !== 'En proceso' && report.status !== 'Resuelto' && (
                <button 
                  onClick={() => updateStatus(report._id, 'En proceso')}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #eccc68', color: '#eccc68', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Atender
                </button>
              )}
              {report.status !== 'Resuelto' && (
                <button 
                  onClick={() => updateStatus(report._id, 'Resuelto')}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #2ed573', color: '#2ed573', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Resolver
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportList;
