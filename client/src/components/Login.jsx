import React, { useState } from 'react';
import { supabase } from '../supabase/config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('alumno'); 
  const [esRegistro, setEsRegistro] = useState(false); 
  const [cargando, setCargando] = useState(false);

  const manejarAuth = async (e) => {
    e.preventDefault();
    setCargando(true);

    const correoLimpio = email.trim().toLowerCase();

    if (esRegistro && rol === 'profesor') {
      if (!correoLimpio.endsWith('@elsistema.org.ve')) {
        alert('Error: Para registrarse como Profesor debe usar obligatoriamente un correo institucional con el dominio @elsistema.org.ve');
        setCargando(false);
        return;
      }
    }

    try {
      if (esRegistro) {
        const { error } = await supabase.auth.signUp({
          email: correoLimpio,
          password,
          options: {
            data: { rol: rol }
          }
        });
        if (error) throw error;
        alert('¡Registro exitoso! Ya puedes iniciar sesión con tu cuenta institucional.');
        setEsRegistro(false); 
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: correoLimpio,
          password
        });
        if (error) throw error;
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontFamily: 'sans-serif', color: '#333' }}>
      
      {/* PESTAÑAS PARA CAMBIAR ENTRE LOGIN Y REGISTRO */}
      <div style={{ display: 'flex', marginBottom: '25px', borderRadius: '5px', overflow: 'hidden', border: '1px solid #ddd' }}>
        <button 
          onClick={() => { setEsRegistro(false); setEmail(''); setPassword(''); }}
          type="button"
          style={{ flex: 1, padding: '10px', cursor: 'pointer', border: 'none', backgroundColor: !esRegistro ? '#2ecc71' : '#fff', color: !esRegistro ? '#fff' : '#666', fontWeight: 'bold', transition: '0.3s' }}
        >
          Iniciar Sesión
        </button>
        <button 
          onClick={() => { setEsRegistro(true); setEmail(''); setPassword(''); }}
          type="button"
          style={{ flex: 1, padding: '10px', cursor: 'pointer', border: 'none', backgroundColor: esRegistro ? '#2ecc71' : '#fff', color: esRegistro ? '#fff' : '#666', fontWeight: 'bold', transition: '0.3s' }}
        >
          Registrarse
        </button>
      </div>

      <h3 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>
        {esRegistro ? 'Crear Nueva Cuenta' : 'Ingresar al Sistema'}
      </h3>
      
      {/* Agregamos autoComplete="off" a todo el formulario completo */}
      <form onSubmit={manejarAuth} autoComplete="off">
        
        {/* Un campo trampa invisible para engañar al auto-relleno de Chrome */}
        <input type="text" name="prevent_autofill" style={{ display: 'none' }} />
        <input type="password" name="password_prevent_autofill" style={{ display: 'none' }} />

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Correo Electrónico:</label>
          <input 
            type="email" 
            name="alfa_user_email" // Cambiamos el name para despistar al navegador
            autoComplete="new-password" // El truco definitivo para romper el rellenado automático
            placeholder={esRegistro && rol === 'profesor' ? "usuario@elsistema.org.ve" : "ejemplo@correo.com"} 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '94%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Contraseña:</label>
          <input 
            type="password" 
            name="alfa_user_password" // Cambiamos el name aquí también
            autoComplete="new-password" // Evita que ofrezca la contraseña guardada
            placeholder="Mínimo 6 caracteres" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '94%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        {/* SELECTOR DE ROL */}
        {esRegistro && (
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #eee' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>¿Quién eres? </label>
            <select value={rol} onChange={(e) => setRol(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}>
              <option value="alumno">Alumno (Solo ver material)</option>
              <option value="profesor">Profesor (Administrar y cargar material)</option>
            </select>
          </div>
        )}

        <button 
          type="submit" 
          disabled={cargando}
          style={{ width: '100%', padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
        >
          {cargando ? 'Procesando...' : esRegistro ? 'CREAR MI CUENTA' : 'ENTRAR'}
        </button>
      </form>
    </div>
  );
};

export default Login;