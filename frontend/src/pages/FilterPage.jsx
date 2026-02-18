import React, { useState, useCallback } from 'react';
import { SlidersHorizontal, Search, Star, Film, Frown } from 'lucide-react';
import api from '../api';
import Navbar from '../components/Navbar';
import { useOverlay } from '../context/OverlayContext';

const GENRES = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
    'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'
];

const MIN_YEAR = 1980;
const MAX_YEAR = 2024;

const FilterPage = () => {
    const { openOverlay } = useOverlay();

    // Filter state
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [yearMin, setYearMin] = useState(MIN_YEAR);
    const [yearMax, setYearMax] = useState(MAX_YEAR);
    const [minRating, setMinRating] = useState(0);
    const [actorInput, setActorInput] = useState('');
    const [hoverRating, setHoverRating] = useState(0);

    // Results state
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const toggleGenre = (genre) => {
        setSelectedGenres(prev =>
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    const clearAll = () => {
        setSelectedGenres([]);
        setYearMin(MIN_YEAR);
        setYearMax(MAX_YEAR);
        setMinRating(0);
        setActorInput('');
        setResults([]);
        setSearched(false);
    };

    const applyFilters = useCallback(async () => {
        setLoading(true);
        setSearched(true);
        try {
            const params = new URLSearchParams();
            if (selectedGenres.length > 0) params.set('genres', selectedGenres.join(','));
            if (yearMin !== MIN_YEAR) params.set('year_min', yearMin);
            if (yearMax !== MAX_YEAR) params.set('year_max', yearMax);
            if (minRating > 0) params.set('min_rating', minRating);
            if (actorInput.trim()) params.set('actor', actorInput.trim());

            const res = await api.get(`/movies/filter?${params.toString()}`);
            setResults(res.data || []);
        } catch (err) {
            console.error('Filter error:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [selectedGenres, yearMin, yearMax, minRating, actorInput]);

    const handleYearMin = (val) => setYearMin(Math.min(Number(val), yearMax));
    const handleYearMax = (val) => setYearMax(Math.max(Number(val), yearMin));

    return (
        <div className="min-h-screen bg-black text-gray-100 font-sans">
            <Navbar />

            {/* Page content — offset for fixed navbar */}
            <div className="pt-20 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-10">
                    <SlidersHorizontal className="w-7 h-7 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Movie Picker</h1>
                        <p className="text-sm text-white/40 mt-0.5">Set your filters and find your perfect film</p>
                    </div>
                </div>

                {/* Filters Card */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8 space-y-8 mb-10">

                    {/* Genre */}
                    <section>
                        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Genre</h3>
                        <div className="flex flex-wrap gap-2">
                            {GENRES.map(genre => (
                                <button
                                    key={genre}
                                    onClick={() => toggleGenre(genre)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${selectedGenres.includes(genre)
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                                        : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white'
                                        }`}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Release Year */}
                    <section>
                        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
                            Release Year — <span className="text-white/80">{yearMin} – {yearMax}</span>
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-white/40 w-10">{MIN_YEAR}</span>
                                <div className="relative flex-1 h-2">
                                    <div className="absolute inset-0 rounded-full bg-white/10" />
                                    <div
                                        className="absolute h-full rounded-full bg-gradient-to-r from-primary to-accent"
                                        style={{
                                            left: `${((yearMin - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}%`,
                                            right: `${100 - ((yearMax - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}%`
                                        }}
                                    />
                                    <input type="range" min={MIN_YEAR} max={MAX_YEAR} value={yearMin}
                                        onChange={e => handleYearMin(e.target.value)}
                                        className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                                        style={{ zIndex: yearMin > MAX_YEAR - 10 ? 5 : 3 }} />
                                    <input type="range" min={MIN_YEAR} max={MAX_YEAR} value={yearMax}
                                        onChange={e => handleYearMax(e.target.value)}
                                        className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                                        style={{ zIndex: 4 }} />
                                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-white shadow-lg pointer-events-none"
                                        style={{ left: `calc(${((yearMin - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}% - 8px)` }} />
                                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent border-2 border-white shadow-lg pointer-events-none"
                                        style={{ left: `calc(${((yearMax - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}% - 8px)` }} />
                                </div>
                                <span className="text-xs text-white/40 w-10 text-right">{MAX_YEAR}</span>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/40">From</span>
                                    <input type="number" min={MIN_YEAR} max={yearMax} value={yearMin}
                                        onChange={e => handleYearMin(e.target.value)}
                                        className="w-20 px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm text-center focus:outline-none focus:border-primary" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/40">To</span>
                                    <input type="number" min={yearMin} max={MAX_YEAR} value={yearMax}
                                        onChange={e => handleYearMax(e.target.value)}
                                        className="w-20 px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm text-center focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Min Rating */}
                    <section>
                        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
                            Minimum Rating {minRating > 0 && <span className="text-white/80">— {minRating} ★ & above</span>}
                        </h3>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setMinRating(minRating === star ? 0 : star)}
                                    className="p-1 transition-transform hover:scale-110">
                                    <Star className={`w-7 h-7 transition-colors ${(hoverRating || minRating) >= star
                                        ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
                                </button>
                            ))}
                            {minRating > 0 && (
                                <button onClick={() => setMinRating(0)}
                                    className="ml-2 text-xs text-white/40 hover:text-white/70 transition-colors">Clear</button>
                            )}
                        </div>
                    </section>

                    {/* Actor */}
                    <section>
                        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Actor</h3>
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input type="text" placeholder="e.g. Tom Hanks, Leonardo DiCaprio..."
                                value={actorInput} onChange={e => setActorInput(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary transition-colors" />
                        </div>
                    </section>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <button onClick={clearAll}
                            className="text-sm text-white/50 hover:text-white transition-colors">
                            Clear All
                        </button>
                        <button onClick={applyFilters} disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/30">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            Find Movies
                        </button>
                    </div>
                </div>

                {/* Results */}
                {searched && (
                    <div>
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
                            </div>
                        ) : results.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <Frown className="w-16 h-16 text-white/20 mb-4" />
                                <h3 className="text-xl font-semibold text-white/60 mb-2">No movies found</h3>
                                <p className="text-sm text-white/30 max-w-xs">
                                    Try adjusting your filters — maybe broaden the year range or remove a genre.
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-white/40 mb-6">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                                    {results.map(movie => (
                                        <button key={movie.movie_id}
                                            onClick={() => openOverlay(movie.movie_id)}
                                            className="group relative rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20 text-left">
                                            {movie.poster_url ? (
                                                <img src={movie.poster_url} alt={movie.title}
                                                    className="w-full aspect-[2/3] object-cover" loading="lazy" />
                                            ) : (
                                                <div className="w-full aspect-[2/3] bg-white/5 flex items-center justify-center">
                                                    <Film className="w-10 h-10 text-white/20" />
                                                </div>
                                            )}
                                            <div className="p-3">
                                                <p className="text-sm font-semibold text-white line-clamp-2 leading-tight">{movie.title}</p>
                                                <p className="text-xs text-white/40 mt-1">{movie.release_year}</p>
                                            </div>
                                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterPage;
