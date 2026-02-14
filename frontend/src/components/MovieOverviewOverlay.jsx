import React, { useEffect } from 'react';
import { useOverlay } from '../context/OverlayContext';

const MovieOverviewOverlay = () => {
    const { isOpen, movieData, loading, closeOverlay } = useOverlay();

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') closeOverlay();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [closeOverlay]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center fade-in">
            {/* Backdrop Blur */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={closeOverlay}
            ></div>

            <div className="relative w-full max-w-5xl h-[90vh] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-slide-up border border-white/10">

                {/* Close Button */}
                <button
                    onClick={closeOverlay}
                    className="absolute top-4 right-6 z-50 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {loading || !movieData ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* Hero Banner */}
                        <div className="relative h-[60%] flex-shrink-0">
                            {movieData.backdrop_url ? (
                                <img
                                    src={movieData.backdrop_url}
                                    alt={movieData.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black"></div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>

                            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col md:flex-row justify-between items-end gap-6">
                                <div className="max-w-2xl space-y-2">
                                    <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-2xl leading-tight">
                                        {movieData.title}
                                    </h1>
                                    {movieData.tagline && (
                                        <p className="text-xl text-primary font-medium italic drop-shadow-md">
                                            {movieData.tagline}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {movieData.genres && movieData.genres.split('|').map(g => (
                                            <span key={g} className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full">
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-right text-gray-300 font-medium space-y-1 bg-black/30 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                                    {movieData.runtime && (
                                        <div className="flex items-center justify-end gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span>{Math.floor(movieData.runtime / 60)}h {movieData.runtime % 60}min</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-end gap-3 text-sm">
                                        {movieData.certification && (
                                            <span className="px-2 py-0.5 border border-gray-500 rounded text-gray-300">
                                                {movieData.certification}
                                            </span>
                                        )}
                                        <span>{movieData.release_year}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 bg-gray-900">

                            {/* Overview */}
                            <div className="max-w-4xl mx-auto text-center">
                                <span className="block text-4xl text-primary/40 mb-[-20px]">“</span>
                                <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-light relative z-10 px-8">
                                    {movieData.overview || "No overview available."}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-center gap-6 pt-4">
                                {movieData.trailer_url ? (
                                    <a
                                        href={movieData.trailer_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-900/30 transition-transform transform hover:scale-105"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                        Trailer
                                    </a>
                                ) : (
                                    <button disabled className="flex items-center gap-2 px-8 py-4 bg-gray-700 text-gray-400 font-bold rounded-lg cursor-not-allowed">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                        Trailer Unavailable
                                    </button>
                                )}


                            </div>
                        </div>

                    </>
                )}
            </div>
        </div>
    );
};

export default MovieOverviewOverlay;
