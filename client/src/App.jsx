import React, { useEffect, useState } from 'react';
import { supabase } from './supabase/config';
import UploadForm from './components/UploadForm';
import Library from './pages/Library';
import Login from './components/Login';

function App() {
  const [sesion, setSesion] = useState(null);
  const [rolUsuario, setRolUsuario] = useState('');
  const [cargando, setCargando] = useState(true);
  const [pantallaActual, setPantallaActual] = useState('partituras');

  // ESTADOS DE DATOS COMPLEMENTARIOS
  const [listaCursos, setListaCursos] = useState([]);
  const [listaNoticias, setListaNoticias] = useState([]);
  const [cargandoSecciones, setCargandoSecciones] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      if (session) {
        setRolUsuario(session.user.user_metadata?.rol || 'alumno');
      }
      setCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
      if (session) {
        setRolUsuario(session.user.user_metadata?.rol || 'alumno');
      } else {
        setRolUsuario('');
        setPantallaActual('partituras');
      }
      setCargando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // CARGAR CURSOS O NOTICIAS CUANDO EL USUARIO CAMBIE DE PESTAÑA
  useEffect(() => {
    if (!sesion) return;

    const cargarSeccionEspecifica = async () => {
      setCargandoSecciones(true);
      if (pantallaActual === 'cursos') {
        const { data } = await supabase.from('cursos').select('*').order('created_at', { ascending: false });
        if (data) setListaCursos(data);
      } else if (pantallaActual === 'noticias') {
        const { data } = await supabase.from('noticias').select('*').order('created_at', { ascending: false });
        if (data) setListaNoticias(data);
      }
      setCargandoSecciones(false);
    };

    cargarSeccionEspecifica();
  }, [pantallaActual, sesion]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    alert('Sesión cerrada correctamente');
  };

  if (cargando) {
    return <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}><h3>Cargando acceso a PartiMusic...</h3></div>;
  }

  if (!sesion) {
    return <Login />;
  }

  return (
    <div style={{ width: '100vw', maxWidth: '100%', minHeight: '100vh', margin: '0', padding: '20px', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* BARRA DE NAVEGACIÓN PARTIMUSIC */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c3e50', padding: '12px 30px', borderRadius: '12px', color: 'white', marginBottom: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        
        <div onClick={() => setPantallaActual('partituras')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <span style={{ fontSize: '1.6em' }}>🎼</span>
          <h2 style={{ margin: 0, fontSize: '1.3em', letterSpacing: '0.8px', fontWeight: 'bold' }}>PARTIMUSIC</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '35px' }}>
          {['partituras', 'cursos', 'noticias'].map((seccion) => (
            <span 
              key={seccion}
              onClick={() => setPantallaActual(seccion)}
              style={{ cursor: 'pointer', fontSize: '15px', fontWeight: pantallaActual === seccion ? 'bold' : 'normal', color: pantallaActual === seccion ? '#2ecc71' : '#ecf0f1', textTransform: 'capitalize' }}
            >
              {seccion}
            </span>
          ))}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {rolUsuario === 'profesor' && (
            <button 
              onClick={() => setPantallaActual('subir')}
              style={{ backgroundColor: pantallaActual === 'subir' ? '#27ae60' : '#2ecc71', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
            >
              ➕ Subir Material / Anuncio
            </button>
          )}
          <span style={{ backgroundColor: '#34495e', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            👤 {rolUsuario}
          </span>
          <button onClick={cerrarSesion} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
            Salir
          </button>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL FLUIDO */}
      <main style={{ width: '100%' }}>
        
        {/* SECCIÓN 1: PARTITURAS */}
        {pantallaActual === 'partituras' && <Library />}

        {/* SECCIÓN 2: CURSOS (Dinamizado con Tarjetas y Flyers) */}
        {pantallaActual === 'cursos' && (
          <div style={{ textAlign: 'left', width: '100%' }}>
            <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #2ecc71', paddingBottom: '10px', marginTop: 0, fontSize: '1.5em' }}>Academia de Cursos y Talleres</h2>
            {cargandoSecciones ? <p>Cargando cartelera de cursos...</p> : listaCursos.length === 0 ? (
              <p style={{ color: '#7f8c8d', marginTop: '20px' }}>No hay cursos publicados activos en este momento.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px', marginTop: '25px' }}>
                {listaCursos.map(curso => (
                  <div key={curso.id} style={{ border: '1px solid #e1e8ed', borderRadius: '12px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {curso.flyer_url ? (
                      <img src={curso.flyer_url} alt="Flyer Curso" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ height: '180px', backgroundColor: '#e8f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2980b9', fontSize: '3em' }}>🎓</div>
                    )}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '1.25em' }}>{curso.titulo}</h3>
                      <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' }}>{curso.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN 3: NOTICIAS (Dinamizado con Tarjetas y Flyers) */}
        {pantallaActual === 'noticias' && (
          <div style={{ textAlign: 'left', width: '100%' }}>
            <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #2ecc71', paddingBottom: '10px', marginTop: 0, fontSize: '1.5em' }}>Cartelera Informativa Escolar</h2>
            {cargandoSecciones ? <p>Cargando cartelera informativa...</p> : listaNoticias.length === 0 ? (
              <p style={{ color: '#7f8c8d', marginTop: '20px' }}>No hay comunicados oficiales recientes.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px', marginTop: '25px' }}>
                {listaNoticias.map(noticia => (
                  <div key={noticia.id} style={{ border: '1px solid #e1e8ed', borderRadius: '12px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {noticia.flyer_url ? (
                      <img src={noticia.flyer_url} alt="Flyer Noticia" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ height: '180px', backgroundColor: '#fcf3cf', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f39c12', fontSize: '3em' }}>📰</div>
                    )}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '1.25em' }}>{noticia.titulo}</h3>
                      <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' }}>{noticia.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN 4: SUBIDA MULTIFUNCIONAL */}
        {pantallaActual === 'subir' && rolUsuario === 'profesor' && (
          <div style={{ width: '100%' }}>
            <button onClick={() => setPantallaActual('partituras')} style={{ backgroundColor: '#f8f9fa', color: '#2c3e50', border: '1px solid #ccd1d1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
              ⬅️ Volver a Explorar
            </button>
            <UploadForm />
          </div>
        )}

      </main>
    </div>
  );
}

export default App;