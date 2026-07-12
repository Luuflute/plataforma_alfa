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

  // CONTROL DE FLYER EXPANDIDO (ZOOM)
  const [imagenExpandida, setImagenExpandida] = useState(null);

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
    <div className="w-full max-w-full min-h-screen m-0 p-4 md:p-6 font-sans bg-gray-50 box-border overflow-x-hidden">
      
      {/* 🎯 BARRA DE NAVEGACIÓN PARTIMUSIC RESPONSIVA CON TAILWIND */}
      <nav className="flex flex-col lg:flex-row justify-between items-center bg-[#2c3e50] p-4 px-6 md:px-8 rounded-xl text-white mb-6 gap-4 shadow-sm">
        
        {/* LOGO */}
        <div onClick={() => setPantallaActual('partituras')} className="flex items-center gap-2.5 cursor-pointer">
          <span className="text-2xl">🎼</span>
          <h2 className="m-0 text-xl tracking-wide font-bold">PARTIMUSIC</h2>
        </div>

        {/* MENÚ CENTRAL */}
        <div className="flex flex-wrap items-center justify-center gap-5 md:gap-9">
          {['partituras', 'cursos', 'noticias'].map((seccion) => (
            <span 
              key={seccion}
              onClick={() => setPantallaActual(seccion)}
              className={`cursor-pointer text-[15px] capitalize transition-colors duration-200 ${
                pantallaActual === seccion ? 'text-[#2ecc71] font-bold' : 'text-[#ecf0f1] hover:text-[#2ecc71]'
              }`}
            >
              {seccion}
            </span>
          ))}
        </div>
        
        {/* ACCIONES DE USUARIO */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {rolUsuario === 'profesor' && (
            <button 
              onClick={() => setPantallaActual('subir')}
              className={`text-white border-none padding px-4 py-2 rounded-lg cursor-pointer font-bold text-xs transition-colors duration-200 ${
                pantallaActual === 'subir' ? 'bg-[#27ae60]' : 'bg-[#2ecc71] hover:bg-[#27ae60]'
              }`}
            >
              ➕ Subir Material / Anuncio
            </button>
          )}
          <span className="bg-[#34495e] px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
            👤 {rolUsuario}
          </span>
          <button onClick={cerrarSesion} className="bg-[#e74c3c] hover:bg-[#c0392b] text-white border-none px-3.5 py-2 rounded-lg cursor-pointer font-bold text-xs transition-colors">
            Salir
          </button>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL FLUIDO */}
      <main className="w-full">
        
        {/* SECCIÓN 1: PARTITURAS */}
        {pantallaActual === 'partituras' && <Library />}

        {/* SECCIÓN 2: CURSOS */}
        {pantallaActual === 'cursos' && (
          <div className="text-left w-full">
            <h2 className="text-[#2c3e50] border-b-2 border-[#2ecc71] pb-2 mt-0 text-xl font-bold">Academia de Cursos y Talleres</h2>
            {cargandoSecciones ? <p className="mt-4 text-gray-500">Cargando cartelera de cursos...</p> : listaCursos.length === 0 ? (
              <p className="text-gray-500 mt-5">No hay cursos publicados activos en este momento.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 w-full">
                {listaCursos.map(curso => (
                  <div key={curso.id} className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
                    {curso.flyer_url ? (
                      <img 
                        src={curso.flyer_url} 
                        alt="Flyer Curso" 
                        onClick={() => setImagenExpandida(curso.flyer_url)} 
                        className="w-full h-[180px] object-cover cursor-zoom-in hover:opacity-95 transition-opacity" 
                      />
                    ) : (
                      <div className="h-[180px] bg-sky-50 flex items-center justify-center text-[#2980b9] text-5xl">🎓</div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="m-0 mb-2 text-[#2c3e50] text-lg font-bold">{curso.titulo}</h3>
                      <p className="text-gray-600 text-sm lineHeight-[1.5] m-0 whitespace-pre-line">{curso.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN 3: NOTICIAS */}
        {pantallaActual === 'noticias' && (
          <div className="text-left w-full">
            <h2 className="text-[#2c3e50] border-b-2 border-[#2ecc71] pb-2 mt-0 text-xl font-bold">Cartelera Informativa Escolar</h2>
            {cargandoSecciones ? <p className="mt-4 text-gray-500">Cargando cartelera informativa...</p> : listaNoticias.length === 0 ? (
              <p className="text-gray-500 mt-5">No hay comunicados oficiales recientes.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 w-full">
                {listaNoticias.map(noticia => (
                  <div key={noticia.id} className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
                    {noticia.flyer_url ? (
                      <img 
                        src={noticia.flyer_url} 
                        alt="Flyer Noticia" 
                        onClick={() => setImagenExpandida(noticia.flyer_url)} 
                        className="w-full h-[180px] object-cover cursor-zoom-in hover:opacity-95 transition-opacity" 
                      />
                    ) : (
                      <div className="h-[180px] bg-amber-50 flex items-center justify-center text-[#f39c12] text-5xl">📰</div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="m-0 mb-2 text-[#2c3e50] text-lg font-bold">{noticia.titulo}</h3>
                      <p className="text-gray-600 text-sm lineHeight-[1.5] m-0 whitespace-pre-line">{noticia.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN 4: SUBIDA MULTIFUNCIONAL */}
        {pantallaActual === 'subir' && rolUsuario === 'profesor' && (
          <div className="w-full">
            <button 
              onClick={() => setPantallaActual('partituras')} 
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg cursor-pointer font-bold mb-5 flex items-center gap-1.5 text-xs transition-colors"
            >
              ⬅️ Volver a Explorar
            </button>
            <UploadForm />
          </div>
        )}

      </main>

      {/* MODAL FLOTANTE DEL ZOOM DEL FLYER */}
      {imagenExpandida && (
        <div 
          className="modal-overlay" 
          onClick={() => setImagenExpandida(null)} 
        >
          <div className="modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-button" 
              onClick={() => setImagenExpandida(null)}
            >
              ✕
            </button>
            <img 
              src={imagenExpandida} 
              alt="Flyer Expandido" 
              className="modal-full-image" 
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default App;