import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const updateSearch = (term) => {
    setSearchTerm(term.toLowerCase().trim());
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <SearchContext.Provider value={{ searchTerm, updateSearch, clearSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch debe usarse dentro de SearchProvider');
  }
  return context;
};
