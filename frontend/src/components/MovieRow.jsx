import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useOverlay } from '../context/OverlayContext';

const MovieRow = ({ title, movies, ratingsMap = {} }) => {
    const rowRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);
    const { openOverlay } = useOverlay();

    const scroll = (dir) => {
        const el = rowRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.75;
        el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    const handleScroll = () => {
        const el = rowRef.current;
        if (!el) return;
        setShowLeft(el.scrollLeft > 10);
        setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    if (!movies || movies.length === 0) return null;

    return (
        <div className="mb-8 group/row">
            <h2 className="text-base md:text-lg font-bold text-white mb-3 px-4 md:px-12">{title}</h2>
            <div className="relative">
                {/* Left Arrow */}
                {showLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity hover:from-black"
                    >
                        <ChevronLeft className="w-8 h-8 text-white" />
                    </button>
                )}

                {/* Scrollable Row */}
                <div
                    ref={rowRef}
                    onScroll={handleScroll}
                    className="flex gap-2 overflow-x-auto no-scrollbar px-4 md:px-12 pb-2"
                >
                    {movies.map((movie) => (
                        <NetflixCard
                            key={movie.movie_id}
                            movie={movie}
                            userRating={ratingsMap[movie.movie_id]}
                            onClick={() => openOverlay(movie.movie_id)}
                        />
                    ))}
                </div>

                {/* Right Arrow */}
                {showRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity hover:from-black"
                    >
                        <ChevronRight className="w-8 h-8 text-white" />
                    </button>
                )}
            </div>
        </div>
    );
};

const NetflixCard = ({ movie, onClick }) => {
    const poster = movie.poster_url;

    return (
        <div
            onClick={onClick}
            className="flex-shrink-0 w-36 md:w-44 cursor-pointer group/card transition-all duration-300 hover:scale-110 hover:z-20 relative"
        >
            <div className="relative rounded-md overflow-hidden aspect-[2/3] bg-gray-800 shadow-lg group-hover/card:shadow-2xl group-hover/card:shadow-black/60">
                {poster ? (
                    <img
                        src={poster}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                        <span className="text-gray-500 text-xs text-center px-2">{movie.title}</span>
                    </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{movie.title}</p>
                        {movie.release_year && (
                            <p className="text-gray-400 text-[10px] mt-0.5">{movie.release_year}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieRow;
