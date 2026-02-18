import React, { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Star, Film } from 'lucide-react';

const MyRatings = () => {
    const { user } = useAuth();
    const [ratedMovies, setRatedMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRatings = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get(`/ratings/${user.id}`);
                setRatedMovies(res.data);
            } catch (err) {
                console.error('Failed to fetch ratings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRatings();
    }, [user]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-dark text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!user) return (
        <div className="min-h-screen bg-dark font-sans text-gray-100">
            <Navbar />
            <main className="container mx-auto px-4 pt-20 pb-12 text-center">
                <p className="text-gray-400 text-lg mt-20">Please <Link to="/login" className="text-primary hover:underline">log in</Link> to view your ratings.</p>
            </main>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark font-sans text-gray-100">
            <Navbar />
            <main className="container mx-auto px-4 pt-20 pb-12 relative z-10 space-y-8">
                <div className="text-center mb-4">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-1.5 flex items-center justify-center gap-3">
                        <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                        My Ratings
                    </h2>
                    <div className="w-20 h-0.5 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
                    <p className="text-gray-400 text-sm mt-2">
                        {ratedMovies.length} movie{ratedMovies.length !== 1 ? 's' : ''} rated
                    </p>
                </div>

                {ratedMovies.length === 0 ? (
                    <div className="text-center py-16">
                        <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">You haven't rated any movies yet.</p>
                        <p className="text-gray-500 text-sm mt-1">Rate movies on the <Link to="/" className="text-primary hover:underline">home page</Link> to see them here!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {ratedMovies.map(movie => (
                            <MovieCard
                                key={movie.movie_id}
                                movie={movie}
                                userRating={movie.rating}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyRatings;
