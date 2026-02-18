import React, { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { Flame } from 'lucide-react';

const Popular = () => {
    const [popular, setPopular] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [ratingsMap, setRatingsMap] = useState({});
    const { user } = useAuth();

    const fetchPopular = async (retries = 3) => {
        setLoading(true);
        setError(false);
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {

                const res = await api.get('/popular');
                setPopular(res.data || []);
                setLoading(false);
                return; // success
            } catch (err) {

                if (err.code === 'ERR_CANCELED') {
                    // Request was cancelled (e.g. by StrictMode unmount) — don't retry
                    return;
                }
                if (attempt < retries) {
                    await new Promise(r => setTimeout(r, 1000)); // wait 1s before retry
                }
            }
        }
        // All retries failed
        setLoading(false);
        setError(true);
    };

    useEffect(() => {
        fetchPopular();
    }, []);

    // Fetch user ratings separately so it never blocks movie display
    useEffect(() => {
        if (!user) return;
        api.get(`/ratings/${user.id}`)
            .then(res => {
                if (Array.isArray(res.data)) {
                    const rMap = {};
                    res.data.forEach(r => { rMap[r.movie_id] = r.rating; });
                    setRatingsMap(rMap);
                }
            })
            .catch(() => { });
    }, [user]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-dark text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (error) return (
        <div className="h-screen flex flex-col items-center justify-center bg-dark text-white gap-4">
            <p className="text-white/60">Failed to load popular movies.</p>
            <button onClick={() => fetchPopular()} className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-80 transition-opacity">
                Try Again
            </button>
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
