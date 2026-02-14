import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const OverlayContext = createContext(null);

export const OverlayProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [movieId, setMovieId] = useState(null);
    const [movieData, setMovieData] = useState(null);
    const [loading, setLoading] = useState(false);

    const openOverlay = async (id) => {
        setMovieId(id);
        setIsOpen(true);
        setLoading(true);
        setMovieData(null); // Reset previous data

        try {
            const res = await api.get(`/movies/details/${id}`);
            setMovieData(res.data);
        } catch (err) {
            console.error("Failed to fetch movie details:", err);
        } finally {
            setLoading(false);
        }
    };

    const closeOverlay = () => {
        setIsOpen(false);
        setMovieId(null);
        setMovieData(null);
    };

    return (
        <OverlayContext.Provider value={{ isOpen, movieId, movieData, loading, openOverlay, closeOverlay }}>
            {children}
        </OverlayContext.Provider>
    );
};

export const useOverlay = () => useContext(OverlayContext);
