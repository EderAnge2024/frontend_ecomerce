import React, { createContext, useContext, useState } from 'react';

// Contexto para compartir el término de búsqueda entre componentes
const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  // Término de búsqueda actual
  const [searchTerm, setSearchTerm] = useState('');

  // Actualizar término de búsqueda (normalizado a minúsculas)
  const updateSearch = (term) => {
    setSearchTerm(term.toLowerCase().trim());
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <SearchContext.Provider value={{ searchTerm, updateSearch, clearSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

// Hook para usar el contexto de búsqueda
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch debe usarse dentro de SearchProvider');
  }
  return context;
};
