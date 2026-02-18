import { createContext, useContext } from 'react';

export const FilterContext = createContext({ filterOpen: false, setFilterOpen: () => { } });
export const useFilter = () => useContext(FilterContext);
