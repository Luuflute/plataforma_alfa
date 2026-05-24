import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/config'; 

const Library = () => {
  const [todosLosMateriales, setTodosLosMateriales] = useState([]); 
  const [materialesFiltrados, setMaterialesFiltrados] = useState([]); 
  const [cargando, setCargando] = useState(true);

  const [listaCatedrasFiltro, setListaCatedrasFiltro] = useState(['Todos']);
  const [filtroCatedra, setFiltroCatedra] = useState('Todos');
  const [filtroTipo, setFiltroTipo] = useState('Todos');

  useEffect(() => {
    const cargarTodoElContenido = async () => {
      try {
        const { data: partiturasData, error: errPartituras } = await supabase
          .from('partituras')
          .select('*');
        
        if (!errPartituras && partiturasData) {
          setTodosLosMateriales(partiturasData);
          setMaterialesFiltrados(partiturasData);
        }

        const { data: catedrasData, error: errCatedras } = await supabase
          .from('catedras')
          .select('nombre')
          .order('nombre', { ascending: true });
        
        if (!errCatedras && catedrasData) {
          const nombresCatedras = catedrasData.map(c => c.nombre);
          setListaCatedrasFiltro(['Todos', ...nombresCatedras]);
        }
      } catch (error) {
        console.error("Error al conectar con Supabase:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarTodoElContenido();
  }, []);

  useEffect(() => {
    let resultado = todosLosMateriales;

    if (filtroCatedra !== 'Todos') {
      resultado = resultado.filter(item => item.catedra === filtroCatedra);
    }

    if (filtroTipo !== 'Todos') {
      resultado = resultado.filter(item => item.tipo_documento === filtroTipo);
    }

    setMaterialesFiltrados(resultado);
  }, [filtroCatedra, filtroTipo, todosLosMateriales]);

  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '1.2em', color: '#666' }}>Cargando biblioteca musical interactiva...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '25px', marginTop: '10px', alignItems: 'flex-start', fontFamily: 'sans-serif', width: '100%', boxSizing: 'border-box' }}>
      
      {/* COLUMNA IZQUIERDA: FILTROS */}
      <aside style={{ width: '260px', minWidth: '260px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef', textAlign: 'left', boxSizing: 'border-box' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '1.1em', borderBottom: '2px solid #2ecc71', paddingBottom: '10px' }}>
          🔍 Filtros
        </h3>

        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85em', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Instrumento / Cátedra
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {listaCatedrasFiltro.map((inst) => (
              <label key={inst} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                <input 
                  type="radio" 
                  name="catedra_filtro" 
                  checked={filtroCatedra === inst}
                  onChange={() => setFiltroCatedra(inst)}
                  style={{ cursor: 'pointer', accentColor: '#2ecc71' }}
                />
                {inst}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85em', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tipo de Material
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Todos', 'Partituras Individuales', 'Partes Orquestales', 'Libros de Estudio'].map((tipo) => (
              <label key={tipo} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                <input 
                  type="radio" 
                  name="tipo_filtro" 
                  checked={filtroTipo === tipo}
                  onChange={() => setFiltroTipo(tipo)}
                  style={{ cursor: 'pointer', accentColor: '#2ecc71' }}
                />
                {tipo}
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* SECCIÓN CENTRAL: CRECE DINÁMICAMENTE */}
      <section style={{ flex: 1, textAlign: 'left', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.4em' }}>Lo mejor de PartiMusic</h2>
          <span style={{ fontSize: '13px', backgroundColor: '#e8f5e9', color: '#2ecc71', padding: '4px 12px', borderRadius: '15px', fontWeight: 'bold' }}>
            {materialesFiltrados.length} materiales encontrados
          </span>
        </div>

        {materialesFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fdfdfd', borderRadius: '10px', border: '1px dashed #ccc', marginTop: '20px' }}>
            <p style={{ color: '#95a5a6', fontSize: '1.1em', margin: 0 }}>No hay materiales pedagógicos que coincidan con los filtros.</p>
          </div>
        ) : (
          /* REJILLA MEJORADA: Ajustada a minmax(230px) para exprimir todo el ancho horizontal */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '20px', width: '100%' }}>
            {materialesFiltrados.map((item) => (
              <div 
                key={item.id} 
                style={{ 
                  border: '1px solid #e1e8ed', 
                  padding: '15px', 
                  borderRadius: '12px', 
                  background: '#fff', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
              >
                <div style={{ height: '120px', backgroundColor: '#fcfcfc', borderRadius: '6px', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '3em' }}>🎼</span>
                </div>

                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05em', color: '#2c3e50', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.titulo}
                </h4>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span style={{ backgroundColor: '#e8f5e9', color: '#2ecc71', padding: '3px 8px', borderRadius: '15px', fontSize: '10px', fontWeight: 'bold' }}>
                    {item.catedra}
                  </span>
                  {item.tipo_documento && (
                    <span style={{ backgroundColor: '#e3f2fd', color: '#2196f3', padding: '3px 8px', borderRadius: '15px', fontSize: '10px', fontWeight: 'bold' }}>
                      {item.tipo_documento}
                    </span>
                  )}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f5f5f5' }}>
                  <a href={item.archivo_url} target="_blank" rel="noreferrer" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: item.audio_url ? '10px' : '0' }}>
                    📖 Ver Partitura (PDF)
                  </a>
                </div>

                {item.audio_url && (
                  <div style={{ marginTop: '5px' }}>
                    <audio controls src={item.audio_url} style={{ width: '100%', height: '28px' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      
    </div>
  );
};

export default Library;