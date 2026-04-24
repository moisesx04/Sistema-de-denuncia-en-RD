import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Loader, CheckCircle, AlertTriangle, Lightbulb, Truck, Trash2, X, Navigation } from 'lucide-react';
import axios from 'axios';

const ReportForm = ({ onClose, initialLocation }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
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

  // Auto-detect GPS if no location was pre-filled
  useEffect(() => {
    if (!initialLocation || (initialLocation.lat === 0 && initialLocation.lng === 0)) {
      detectGPS();
    }
  }, []);

  const detectGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, lat: pos.coords.latitude, lng: pos.coords.longitude }
        }));
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      if (file.type === 'application/pdf') {
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

    // Prevent submitting without a real location
    if (formData.location.lat === 0 && formData.location.lng === 0) {
      alert('Por favor, haz clic en el mapa o activa tu GPS para seleccionar una ubicación antes de enviar.');
      return;
    }

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
    { id: 'Palo de Luz',    icon: <Lightbulb size={22} />,      label: 'Luz Dañada'     },
    { id: 'Hoyo',           icon: <AlertTriangle size={22} />,  label: 'Hoyo Vial'      },
    { id: 'Carro Chatarra', icon: <Truck size={22} />,          label: 'Carro Chatarra' },
    { id: 'Basura',         icon: <Trash2 size={22} />,         label: 'Basura'         },
  ];

  const hasLocation = formData.location.lat !== 0 || formData.location.lng !== 0;

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: '#dcfce7', color: '#166534',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <CheckCircle size={34} />
        </div>
        <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-main)' }}>¡Reporte Enviado!</h3>
        <p style={{ color: 'var(--text-dim)', marginTop: '6px', fontSize: '0.9rem' }}>Tu denuncia ha sido registrada.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.2rem', color: 'var(--text-main)' }}>
        Nuevo Reporte
      </h3>

      {/* Category selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', marginBottom: '1.2rem' }}>
        {categories.map(cat => (
          <div
            key={cat.id}
            onClick={() => setFormData({ ...formData, type: cat.id })}
            style={{
              padding: '0.75rem', borderRadius: '12px',
              border: `2px solid ${formData.type === cat.id ? 'var(--primary)' : 'var(--border-ui)'}`,
              background: formData.type === cat.id ? '#e8f0fe' : 'var(--bg-main)',
              cursor: 'pointer', textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ color: formData.type === cat.id ? 'var(--primary)' : 'var(--text-dim)', marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>
              {cat.icon}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: formData.type === cat.id ? 'var(--primary)' : 'var(--text-dim)' }}>
              {cat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Image upload */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
          Evidencia (Foto)
        </label>
        {preview ? (
          <div style={{ position: 'relative', width: '100%', height: '130px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-ui)' }}>
            {preview === 'pdf-placeholder' ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--primary)', flexDirection: 'column' }}>
                <div style={{ fontSize: '2rem' }}>📄</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>Documento PDF</div>
              </div>
            ) : (
              <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <button
              type="button"
              onClick={() => { setPreview(null); setFormData({ ...formData, image: null }); }}
              style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.55)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', display: 'flex' }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <label htmlFor="report-image-input" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '90px', background: 'var(--bg-main)', border: '2px dashed var(--border-ui)',
            borderRadius: '12px', cursor: 'pointer', color: 'var(--text-dim)', transition: '0.2s',
          }}>
            <Camera size={22} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '5px' }}>Clic para subir foto</span>
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

      {/* Description */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
          Descripción
        </label>
        <textarea
          placeholder="Escribe los detalles aquí..."
          rows="2"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* Location display + GPS button */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: hasLocation ? '#e8f0fe' : '#fff3f4',
        border: `1.5px solid ${hasLocation ? 'var(--primary)' : 'var(--accent)'}`,
        padding: '0.6rem 0.8rem', borderRadius: '10px', marginBottom: '1.4rem',
      }}>
        <MapPin size={16} color={hasLocation ? 'var(--primary)' : 'var(--accent)'} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.78rem', fontWeight: 700, flex: 1, color: hasLocation ? 'var(--primary)' : 'var(--accent)' }}>
          {hasLocation
            ? `${formData.location.lat.toFixed(5)}, ${formData.location.lng.toFixed(5)}`
            : 'Sin ubicación — haz clic en el mapa o usa GPS'}
        </span>
        <button
          type="button"
          onClick={detectGPS}
          title="Usar mi ubicación GPS"
          style={{
            background: 'var(--primary)', color: 'white', border: 'none',
            borderRadius: '8px', padding: '4px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
          }}
        >
          {gpsLoading
            ? <Loader size={14} className="animate-spin" />
            : <><Navigation size={13} /> GPS</>
          }
        </button>
      </div>

      <button
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
        disabled={loading}
      >
        {loading ? <Loader className="animate-spin" size={18} /> : 'Enviar Reporte'}
      </button>
    </form>
  );
};

export default ReportForm;
