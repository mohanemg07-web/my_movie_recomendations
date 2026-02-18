import React, { useEffect } from 'react';
import { useOverlay } from '../context/OverlayContext';
import { X, Clock, Play, PlayCircle } from 'lucide-react';

const MovieOverviewOverlay = () => {
    const { isOpen, movieData, loading, closeOverlay } = useOverlay();

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') closeOverlay(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [closeOverlay]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={closeOverlay} />

            <div className="relative w-full max-w-3xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col" style={{ maxHeight: '90vh' }}>

                {/* Close Button */}
                <button
                    onClick={closeOverlay}
                    className="absolute top-3 right-3 z-50 p-1.5 bg-black/60 hover:bg-white/20 rounded-full text-white transition-all"
                >
                    <X className="w-4 h-4" />
                </button>

                {loading || !movieData ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
                    </div>
                ) : (
                    <>
                        {/* Compact Hero — fixed height banner */}
                        <div className="relative h-44 flex-shrink-0">
                            {movieData.backdrop_url ? (
                                <img
                                    src={movieData.backdrop_url}
                                    alt={movieData.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

                            {/* Title overlay on banner */}
                            <div className="absolute bottom-0 left-0 p-4">
                                <h1 className="text-xl font-extrabold text-white leading-tight drop-shadow-lg">
                                    {movieData.title}
                                </h1>
                                {movieData.tagline && (
                                    <p className="text-xs text-primary italic mt-0.5 line-clamp-1">{movieData.tagline}</p>
                                )}
                            </div>
                        </div>

                        {/* Body — two columns */}
                        <div className="flex gap-4 p-4 overflow-y-auto no-scrollbar">
                            {/* Left: poster */}
                            {movieData.poster_url && (
                                <img
                                    src={movieData.poster_url}
                                    alt={movieData.title}
                                    className="w-24 h-36 object-cover rounded-lg flex-shrink-0 shadow-lg"
                                />
                            )}

                            {/* Right: details */}
                            <div className="flex-1 min-w-0 space-y-3">
                                {/* Meta row */}
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                                    {movieData.runtime && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {Math.floor(movieData.runtime / 60)}h {movieData.runtime % 60}m
                                        </span>
                                    )}
                                    {movieData.release_year && <span>• {movieData.release_year}</span>}
                                    {movieData.certification && (
                                        <span className="px-1.5 py-0.5 border border-gray-600 rounded text-gray-300 text-[10px]">
                                            {movieData.certification}
                                        </span>
                                    )}
                                </div>

                                {/* Genres */}
                                {movieData.genres && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {movieData.genres.split('|').map(g => (
                                            <span key={g} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/15 rounded-full">
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Overview */}
                                <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
                                    {movieData.overview || 'No overview available.'}
                                </p>

                                {/* Actions */}
                                <div className="flex gap-3 pt-1">
                                    {movieData.trailer_url ? (
                                        <a
                                            href={movieData.trailer_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all hover:scale-105 shadow-lg shadow-red-900/30"
                                        >
                                            <Play className="w-4 h-4 fill-white" />
                                            Watch Trailer
                                        </a>
                                    ) : (
                                        <button disabled className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-500 text-sm font-bold rounded-lg cursor-not-allowed">
                                            <PlayCircle className="w-4 h-4" />
                                            No Trailer
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MovieOverviewOverlay;
