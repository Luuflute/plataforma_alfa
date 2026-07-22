import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';

const UploadForm = () => {
  // CONFIGURACIÓN GENERAL DEL TIPO DE PUBLICACIÓN
  const [queSubir, setQueSubir] = useState('partitura'); // 'partitura', 'curso', 'noticia'
  
  // ESTADOS COMPARTIDOS
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState(''); // Exclusivo para cursos y noticias
  const [subiendo, setSubiendo] = useState(false);

  // ESTADOS PARA PARTITURAS
  const [catedraSeleccionada, setCatedraSeleccionada] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('Partituras Individuales'); 
  const [archivoPdf, setArchivoPdf] = useState(null);
  const [archivoMp3, setArchivoMp3] = useState(null);
  const [listaCatedras, setListaCatedras] = useState([]);
  const [nuevaCatedraTxt, setNuevaCatedraTxt] = useState('');
  const [creandoCatedra, setCreandoCatedra] = useState(false);

  // ESTADO PARA IMAGENES / FLYERS (Cursos y Noticias)
  const [archivoFlyer, setArchivoFlyer] = useState(null);

  const cargarCatedras = async () => {
    const { data, error } = await supabase.from('catedras').select('*').order('nombre', { ascending: true });
    if (!error && data.length > 0) {
      setListaCatedras(data);
      setCatedraSeleccionada(data[0].nombre);
    }
  };

  useEffect(() => {
    cargarCatedras();
  }, []);

  const manejarCrearCatedra = async (e) => {
    e.preventDefault();
    if (!nuevaCatedraTxt.trim()) return;
    setCreandoCatedra(true);
    try {
      const nombreFormateado = nuevaCatedraTxt.trim();
      const { error } = await supabase.from('catedras').insert([{ nombre: nombreFormateado }]);
      if (error) throw error;
      alert(`¡Cátedra "${nombreFormateado}" añadida exitosamente!`);
      setNuevaCatedraTxt('');
      await cargarCatedras();
      setCatedraSeleccionada(nombreFormateado);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setCreandoCatedra(false);
    }
  };

  // Función genérica para subir cualquier archivo al Storage de 'media'
  const subirAlStorage = async (archivo, subcarpeta) => {
    const nombreUnico = `${Date.now()}_${archivo.name}`;
    const { data, error } = await supabase.storage
      .from('media')
      .upload(`${subcarpeta}/${nombreUnico}`, archivo);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(`${subcarpeta}/${nombreUnico}`);
      
    return urlData.publicUrl;
  };

  const manejarPublicacionGlobal = async (e) => {
    e.preventDefault();
    setSubiendo(true);

    try {
      // 1. LÓGICA SI ES UNA PARTITURA
      if (queSubir === 'partitura') {
        if (!archivoPdf) throw new Error('Por favor selecciona un archivo PDF.');
        
        const urlPdf = await subirAlStorage(archivoPdf, 'pdfs');
        let urlMp3 = null;
        if (archivoMp3) {
          urlMp3 = await subirAlStorage(archivoMp3, 'audios');
        }

        const { error } = await supabase.from('partituras').insert([
          { titulo, catedra: catedraSeleccionada, tipo_documento: tipoDocumento, archivo_url: urlPdf, audio_url: urlMp3 }
        ]);
        if (error) throw error;
        alert('¡Material musical publicado con éxito!');
      } 
      
      // 2. LÓGICA SI ES UN CURSO O UNA NOTICIA
      else {
        let urlFlyer = null;
        if (archivoFlyer) {
          urlFlyer = await subirAlStorage(archivoFlyer, 'flyers');
        }
        const datosAPublicar = queSubir === 'curso' 
          ? { titulo, descripcion, flyer_url: urlFlyer }
          : { titulo, noticias: descripcion, flyer_url: urlFlyer };

        const { error } = await supabase
          .from(queSubir === 'curso' ? 'cursos' : 'noticias')
          .insert([datosAPublicar]);

        if (error) throw error;
        alert(`¡Anuncio publicado con éxito en la sección de ${queSubir === 'curso' ? 'Cursos' : 'Noticias'}!`);
      }

      // Limpieza general tras publicar
      setTitulo('');
      setDescripcion('');
      setArchivoPdf(null);
      setArchivoMp3(null);
      setArchivoFlyer(null);
      e.target.reset();

    } catch (error) {
      alert('Error en la publicación: ' + error.message);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', gap: '25px', fontFamily: 'sans-serif', alignItems: 'flex-start', boxSizing: 'border-box' }}>
      
      {/* SECCIÓN DEL FORMULARIO PRINCIPAL */}
      <div style={{ flex: 1, padding: '25px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: '#fff', textAlign: 'left', boxSizing: 'border-box' }}>
        
        {/* Selector de Tipo de Publicación */}
        <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#2c3e50' }}>¿Qué deseas publicar hoy en PartiMusic?</label>
          <div style={{ display: 'flex', gap: '15px' }}>
            {[['partitura', '🎼 Material / Partitura'], ['curso', '🎓 Anuncio de Curso'], ['noticia', '📰 Noticia o Comunicado']].map(([tipo, texto]) => (
              <label key={tipo} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: queSubir === tipo ? '#2ecc71' : '#555' }}>
                <input 
                  type="radio" 
                  name="selector_subida" 
                  checked={queSubir === tipo} 
                  onChange={() => setQueSubir(tipo)}
                  style={{ accentColor: '#2ecc71', cursor: 'pointer' }}
                />
                {texto}
              </label>
            ))}
          </div>
        </div>

        <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #2ecc71', paddingBottom: '10px', textTransform: 'uppercase', fontSize: '1.1em', letterSpacing: '0.5px' }}>
          Formulario: {queSubir.toUpperCase()}
        </h3>
        
        <form onSubmit={manejarPublicacionGlobal} style={{ marginTop: '20px' }}>
          {/* Título universal */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Título de la publicación:</label>
            <input 
              type="text" 
              placeholder={queSubir === 'partitura' ? "Ej: Sinfonía Nro 1" : queSubir === 'curso' ? "Ej: Taller Intensivo de Piano Complementario" : "Ej: Cambio de horario para ensayos generales"}
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              required
              style={{ width: '98%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>

          {/* Campos condicionales exclusivos de Cursos y Noticias (Descripción extendida) */}
          {queSubir !== 'partitura' && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Información / Descripción detallada:</label>
              <textarea 
                rows="5"
                placeholder="Escribe aquí toda la información, fechas, horarios o detalles importantes que leerán los usuarios..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                style={{ width: '98%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontFamily: 'sans-serif', resize: 'vertical' }}
              />
            </div>
          )}

          {/* Campos exclusivos para Partituras */}
          {queSubir === 'partitura' && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Seleccionar Cátedra:</label>
                <select value={catedraSeleccionada} onChange={(e) => setCatedraSeleccionada(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                  {listaCatedras.map(cat => <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tipo de Material:</label>
                <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                  <option value="Partituras Individuales">Partituras Individuales</option>
                  <option value="Partes Orquestales">Partes Orquestales</option>
                  <option value="Libros de Estudio">Libros de Estudio</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Archivo de Partitura (PDF):</label>
                <input type="file" accept=".pdf" onChange={(e) => setArchivoPdf(e.target.files[0])} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Audio Play Along (Opcional - MP3):</label>
                <input type="file" accept="audio/*" onChange={(e) => setArchivoMp3(e.target.files[0])} />
              </div>
            </>
          )}

          {/* Campo de Flyer / Imagen de referencia para Cursos y Noticias */}
          {queSubir !== 'partitura' && (
            <div style={{ marginBottom: '25px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Subir Flyer o Imagen publicitaria (Opcional):</label>
              <input type="file" accept="image/*" onChange={(e) => setArchivoFlyer(e.target.files[0])} />
            </div>
          )}

          <button type="submit" disabled={subiendo} style={{ width: '100%', padding: '14px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
            {subiendo ? 'Procesando y subiendo datos a PartiMusic...' : `PUBLICAR ${queSubir.toUpperCase()}`}
          </button>
        </form>
      </div>

      {/* PANEL LATERAL DE EXPANSIÓN DE CÁTEDRAS (Solo visible al subir partituras) */}
      {queSubir === 'partitura' && (
        <div style={{ width: '280px', padding: '20px', border: '2px dashed #2ecc71', borderRadius: '10px', backgroundColor: '#f9fbf9', textAlign: 'left', boxSizing: 'border-box' }}>
          <h4 style={{ marginTop: 0, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '5px' }}><span>✨</span> Administrar Cátedras</h4>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.4' }}>Agrega nuevos instrumentos al sistema PartiMusic al instante.</p>
          <form onSubmit={manejarCrearCatedra} style={{ marginTop: '15px' }}>
            <input 
              type="text" 
              placeholder="Ej: Violonchelo, Oboe..." 
              value={nuevaCatedraTxt} 
              onChange={(e) => setNuevaCatedraTxt(e.target.value)}
              required
              style={{ width: '90%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <button type="submit" disabled={creandoCatedra} style={{ width: '100%', padding: '8px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              {creandoCatedra ? 'Guardando...' : '+ Agregar Cátedra'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default UploadForm;