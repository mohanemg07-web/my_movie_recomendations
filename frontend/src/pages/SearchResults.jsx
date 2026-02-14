import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const searchMovies = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
                setMovies(res.data);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            searchMovies();
        }
    }, [query]);

    return (
        <div className="min-h-screen bg-dark text-white font-sans">
            <Navbar />
            <div className="container mx-auto px-6 pt-32 pb-12">
                <h2 className="text-3xl font-bold mb-8">Search Results for "{query}"</h2>

                {loading ? (
                    <div>Loading...</div>
                ) : movies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                        {movies.map(movie => (
                            <MovieCard key={movie.movie_id} movie={movie} />
                        ))}
                    </div>
                ) : (
                    <p className="text-white/50">No movies found.</p>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
