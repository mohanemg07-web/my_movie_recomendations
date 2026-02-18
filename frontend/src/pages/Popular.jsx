import React, { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { Flame } from 'lucide-react';

const Popular = () => {
    const [popular, setPopular] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingsMap, setRatingsMap] = useState({});
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const promises = [api.get('/popular')];
                if (user) {
                    promises.push(api.get(`/ratings/${user.id}`));
                }
                const results = await Promise.all(promises);
                setPopular(results[0].data);

                if (user && results[1] && Array.isArray(results[1].data)) {
                    const rMap = {};
                    results[1].data.forEach(r => { rMap[r.movie_id] = r.rating; });
                    setRatingsMap(rMap);
                }
            } catch (err) {
                console.error("Failed to fetch popular:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-dark text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark font-sans text-gray-100">
            <Navbar />
            <main className="container mx-auto px-4 pt-20 pb-12 relative z-10 space-y-8">
                <div className="text-center mb-4">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 mb-1.5 flex items-center justify-center gap-3">
                        <Flame className="w-8 h-8 text-orange-400" />
                        Popular Movies
                    </h2>
                    <div className="w-20 h-0.5 bg-gradient-to-r from-orange-400 to-amber-500 mx-auto rounded-full"></div>
                    <p className="text-gray-400 text-sm mt-2">The most popular movies across all users</p>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {popular.map(movie => (
                        <MovieCard
                            key={movie.movie_id}
                            movie={{ ...movie, movie_id: movie.movie_id }}
                            userRating={ratingsMap[movie.movie_id]}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Popular;
