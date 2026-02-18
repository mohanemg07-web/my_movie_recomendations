import React from 'react';
import { useOverlay } from '../context/OverlayContext';
import StarRating from './StarRating';
import { Film } from 'lucide-react';

const MovieCard = ({ movie, userRating }) => {
    const { openOverlay } = useOverlay();
    const poster = movie.poster_url;

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
            <div className={`relative h-[320px] rounded-xl overflow-hidden glass card-hover bg-gradient-to-br ${colorClass} flex flex-col justify-end group`}>
                {poster ? (
                    <img
                        src={poster}
                        alt={movie.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Film className="w-10 h-10 text-white/30" />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90"></div>

                <div className="relative z-10 p-3">
                    <h3 className="text-sm font-bold text-white drop-shadow-md line-clamp-2 leading-tight mb-1">{movie.title}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mb-1.5">
                        <span>{movie.release_year || 'N/A'}</span>
                        <span>•</span>
                        <span className="truncate max-w-[100px]">{movie.genres ? movie.genres.split('|')[0] : 'Genre'}</span>
                    </div>

                    {movie.actors && movie.actors.length > 0 && (
                        <div className="text-[10px] text-gray-400 line-clamp-1 mb-1.5">
                            {movie.actors.slice(0, 2).join(', ')}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <StarRating movieId={movie.movie_id} initialRating={userRating || 0} />
                        {movie.predicted_rating && (
                            <div className="bg-primary/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md shadow-lg shadow-primary/20">
                                {(movie.predicted_rating / 5 * 100).toFixed(0)}%
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
