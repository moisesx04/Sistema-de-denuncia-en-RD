import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Loader, CheckCircle, AlertTriangle, Lightbulb, Truck, Trash2, X } from 'lucide-react';
import axios from 'axios';

const ReportForm = ({ onClose, initialLocation }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Palo de Luz',
    description: '',
    location: {
      lat: initialLocation?.lat ?? 0,
      lng: initialLocation?.lng ?? 0,
      address: ''
    },
    image: null
  });

  useEffect(() => {
    if (initialLocation && typeof initialLocation.lat === 'number') {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, lat: initialLocation.lat, lng: initialLocation.lng }
      }));
    }
  }, [initialLocation]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      
      if (file.type === 'application/pdf') {
        // For PDF, show a generic PDF icon preview
        setPreview('pdf-placeholder');
      } else {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    data.append('type', formData.type);
    data.append('description', formData.description);
    data.append('location', JSON.stringify(formData.location));
    if (formData.image) data.append('image', formData.image);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/reportes`, data);
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error('Error submitting report:', err);
      alert('Error al enviar. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'Palo de Luz', icon: <Lightbulb size={24} />, label: 'Luz Dañada' },
    { id: 'Hoyo', icon: <AlertTriangle size={24} />, label: 'Hoyo Vial' },
    { id: 'Carro Chatarra', icon: <Truck size={24} />, label: 'Carro Chatarra' },
    { id: 'Basura', icon: <Trash2 size={24} />, label: 'Basura' }
  ];

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <CheckCircle size={32} />
        </div>
        <h3 style={{ fontWeight: 800 }}>¡Reporte Enviado!</h3>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>Nuevo Reporte</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', margin: '1.5rem 0' }}>
        {categories.map(cat => (
          <div 
            key={cat.id}
            onClick={() => setFormData({ ...formData, type: cat.id })}
            style={{
              padding: '0.8rem', borderRadius: '12px', border: `2px solid ${formData.type === cat.id ? 'var(--primary)' : 'var(--border-ui)'}`,
              background: formData.type === cat.id ? 'rgba(6, 182, 212, 0.05)' : 'white', cursor: 'pointer', textAlign: 'center'
            }}
          >
            <div style={{ color: formData.type === cat.id ? 'var(--primary)' : '#64748b', marginBottom: '0.2rem', display: 'flex', justifyContent: 'center' }}>{cat.icon}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800 }}>{cat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.9rem' }}>Evidencia (Foto)</label>
        {preview ? (
          <div style={{ position: 'relative', width: '100%', height: '150px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-ui)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {preview === 'pdf-placeholder' ? (
              <div style={{ textAlign: 'center', color: 'var(--primary)' }}>
                <div style={{ fontSize: '2rem' }}>📄</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>Documento PDF</div>
              </div>
            ) : (
              <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <button onClick={() => { setPreview(null); setFormData({...formData, image: null}); }} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <label htmlFor="report-image-input" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer', color: '#64748b' }}>
            <Camera size={24} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '5px' }}>Haga clic para subir foto</span>
            <input 
              id="report-image-input" 
              type="file" 
              accept="image/*,.pdf,.heic,.heif" 
              style={{ display: 'none' }} 
              onChange={handleImageChange} 
            />
          </label>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.9rem' }}>Descripción</label>
        <textarea 
          placeholder="Escribe los detalles aquí..."
          rows="2" required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.6rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
        <MapPin size={16} color="var(--primary)" />
        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}</span>
      </div>

      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
        {loading ? <Loader className="animate-spin" size={20} /> : 'Enviar Reporte'}
      </button>
    </form>
  );
};

export default ReportForm;
