import React from 'react';
import { Link } from 'react-router-dom';
import { useOverlay } from '../context/OverlayContext';

const MovieCard = ({ movie }) => {
    const { openOverlay } = useOverlay();
    const poster = movie.poster_url;

    // Generate a deterministic color gradient based on movie ID
    const colors = [
        'from-pink-500 to-rose-500',
        'from-purple-500 to-indigo-500',
        'from-cyan-500 to-blue-500',
        'from-emerald-500 to-teal-500',
        'from-orange-500 to-amber-500'
    ];
    const colorClass = colors[movie.movie_id % colors.length];

    return (
        <div
            onClick={() => openOverlay(movie.movie_id)}
            className="block h-full cursor-pointer transition-transform duration-300 hover:scale-105"
        >
            <div className={`relative h-[450px] rounded-xl overflow-hidden glass card-hover bg-gradient-to-br ${colorClass} flex flex-col justify-end group`}>
                {poster ? (
                    <img
                        src={poster}
                        alt={movie.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="text-white/50 text-4xl">🎬</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90"></div>

                <div className="relative z-10 p-4">
                    <h3 className="text-xl font-bold text-white drop-shadow-md line-clamp-2 leading-tight mb-1">{movie.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                        <span>{movie.release_year || 'N/A'}</span>
                        <span>•</span>
                        <span className="truncate max-w-[150px]">{movie.genres ? movie.genres.split('|')[0] : 'Genre'}</span>
                    </div>

                    {movie.actors && movie.actors.length > 0 && (
                        <div className="text-xs text-gray-400 line-clamp-1 mb-2">
                            {movie.actors.slice(0, 2).join(', ')}
                        </div>
                    )}

                    {movie.predicted_rating && (
                        <div className="inline-block bg-primary/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md shadow-lg shadow-primary/20">
                            Match: {(movie.predicted_rating / 5 * 100).toFixed(0)}%
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
