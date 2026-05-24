import React, { createContext, useState, useContext } from 'react';

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [material, setMaterial] = useState([]); // Aquí guardaremos la lista de partituras
  const [loading, setLoading] = useState(false);

  return (
    <MusicContext.Provider value={{ material, setMaterial, loading, setLoading }}>
      {children}
    </MusicContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useMusic = () => useContext(MusicContext);