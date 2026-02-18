import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { useOverlay } from '../context/OverlayContext';

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const { openOverlay } = useOverlay();

    const doSearch = useCallback(async (q) => {
        if (!q || q.length < 2) { setMovies([]); setLoading(false); return; }
        setLoading(true);
        try {
            const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
            const data = res.data;
            setMovies(data);
            setLoading(false);

            // After showing results instantly, fetch missing posters from TMDB client-side
            const missing = data.filter(m => !m.poster_url && m.tmdb_id);
            if (!missing.length || !TMDB_KEY) return;

            const enriched = await Promise.all(
                missing.map(async (m) => {
                    try {
                        const r = await fetch(
                            `https://api.themoviedb.org/3/movie/${m.tmdb_id}?api_key=${TMDB_KEY}&fields=poster_path`
                        );
                        const d = await r.json();
                        return { movie_id: m.movie_id, poster_url: d.poster_path ? `https://image.tmdb.org/t/p/w342${d.poster_path}` : null };
                    } catch { return { movie_id: m.movie_id, poster_url: null }; }
                })
            );

            // Merge fetched posters back into state
            const posterMap = {};
            enriched.forEach(e => { if (e.poster_url) posterMap[e.movie_id] = e.poster_url; });
            setMovies(prev => prev.map(m => posterMap[m.movie_id] ? { ...m, poster_url: posterMap[m.movie_id] } : m));
        } catch {
            setMovies([]);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        doSearch(query);
    }, [query, doSearch]);

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <Navbar />
            <div className="container mx-auto px-6 pt-28 pb-12">

                {loading && (
                    <div className="flex justify-center mb-6">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!loading && query && (
                    <p className="text-sm text-gray-500 mb-6">
                        {movies.length > 0
                            ? `${movies.length} result${movies.length !== 1 ? 's' : ''} for "${query}"`
                            : `No results for "${query}"`}
                    </p>
                )}

                {movies.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {movies.map(movie => (
                            <div
                                key={movie.movie_id}
                                onClick={() => openOverlay(movie.movie_id)}
                                className="cursor-pointer group"
                            >
                                <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-gray-800 shadow-md group-hover:scale-105 transition-transform duration-200">
                                    {movie.poster_url ? (
                                        <img
                                            src={movie.poster_url}
                                            alt={movie.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center p-3">
                                            <span className="text-gray-500 text-xs text-center leading-tight">{movie.title}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                        <p className="text-white text-xs font-semibold line-clamp-2">{movie.title}</p>
                                    </div>
                                </div>
                                <p className="mt-1.5 text-xs text-gray-400 line-clamp-1">{movie.title}</p>
                                {movie.release_year && <p className="text-[10px] text-gray-600">{movie.release_year}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !query && (
                    <p className="text-gray-600 text-center mt-20">Start typing to search…</p>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
