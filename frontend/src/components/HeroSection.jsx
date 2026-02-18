import React, { useEffect, useState } from 'react';
import { Play, Info } from 'lucide-react';
import { useOverlay } from '../context/OverlayContext';
import api from '../api';

const HeroSection = ({ movie }) => {
    const { openOverlay } = useOverlay();
    const [backdrop, setBackdrop] = useState(null);
    const [overview, setOverview] = useState('');
    const [tagline, setTagline] = useState('');
    const [trailerUrl, setTrailerUrl] = useState(null);

    useEffect(() => {
        if (!movie?.movie_id && !movie?.id) return;
        const id = movie.movie_id || movie.id;
        api.get(`/movies/details/${id}`).then(res => {
            const d = res.data;
            if (d.backdrop_url) setBackdrop(d.backdrop_url);
            if (d.overview) setOverview(d.overview);
            if (d.tagline) setTagline(d.tagline);
            if (d.trailer_url) setTrailerUrl(d.trailer_url);
        }).catch(() => { });
    }, [movie?.movie_id, movie?.id]);

    if (!movie) return null;

    const title = movie.title || '';
    const genres = movie.genres ? movie.genres.split('|').slice(0, 3) : [];
    const movieId = movie.movie_id || movie.id;

    return (
        <div className="relative w-full h-screen min-h-[600px] flex items-end overflow-hidden">
            {/* Backdrop */}
            {backdrop ? (
                <img
                    src={backdrop}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
            ) : movie.poster_url ? (
                <img
                    src={movie.poster_url}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

            {/* Content */}
            <div className="relative z-10 px-6 md:px-16 pb-32 max-w-2xl">
                {/* Title */}
                <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-2xl mb-6">
                    {title}
                </h1>

                {/* Buttons */}
                <div className="flex gap-3">
                    {trailerUrl ? (
                        <a
                            href={trailerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-md hover:bg-white/80 transition-all text-sm shadow-lg"
                        >
                            <Play className="w-5 h-5 fill-black" />
                            Play Trailer
                        </a>
                    ) : (
                        <button
                            disabled
                            className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white/50 font-bold rounded-md text-sm cursor-not-allowed"
                        >
                            <Play className="w-5 h-5" />
                            No Trailer
                        </button>
                    )}
                    <button
                        onClick={() => openOverlay(movieId)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-500/50 hover:bg-gray-500/70 text-white font-bold rounded-md transition-all text-sm backdrop-blur-sm border border-white/10"
                    >
                        <Info className="w-5 h-5" />
                        More Info
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
