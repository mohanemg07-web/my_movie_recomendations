import React, { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const [popular, setPopular] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [topActors, setTopActors] = useState([]);
    const [selectedActor, setSelectedActor] = useState(null);
    const [actorMovies, setActorMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const promises = [
                    api.get('/popular'),
                    api.get('/movies/actors')
                ];
                if (user) {
                    promises.push(api.get(`/recommend/${user.id}`));
                }

                const results = await Promise.all(promises);
                setPopular(results[0].data);
                setTopActors(results[1].data);

                if (user) {
                    // Check index based on push
                    const recIndex = results.length - 1;
                    if (results[recIndex] && results[recIndex].data.recommendations) {
                        setRecommended(results[recIndex].data.recommendations);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleActorClick = async (actorName) => {
        if (selectedActor === actorName) {
            setSelectedActor(null);
            setActorMovies([]);
            return;
        }
        setSelectedActor(actorName);
        try {
            const res = await api.get(`/movies/actor/${encodeURIComponent(actorName)}`);
            setActorMovies(res.data);
        } catch (err) {
            console.error("Failed to fetch actor movies:", err);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-dark text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark font-sans text-gray-100">
            <Navbar />

            <main className="container mx-auto px-6 pt-24 pb-16 relative z-10 space-y-16">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2 animate-pulse">
                        Discover Movies
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
                </div>

                {/* Top Actors Section */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                        <span className="bg-purple-500/20 p-2 rounded-lg text-purple-400">🎭</span>
                        Top Actors
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {topActors.map((actor, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleActorClick(actor.name)}
                                className={`flex-shrink-0 px-6 py-3 rounded-full border transition-all duration-300 font-semibold whitespace-nowrap
                                    ${selectedActor === actor.name
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 transform scale-105'
                                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-primary/50 hover:text-white'
                                    }`}
                            >
                                {actor.name}
                                <span className={`ml-2 text-xs opacity-70 ${selectedActor === actor.name ? 'text-white' : 'text-gray-500'}`}>
                                    ({actor.count})
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Actor Movies Section (Collapsible) */}
                {selectedActor && actorMovies.length > 0 && (
                    <section className="animate-fade-in-down">
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                            <span className="bg-primary/20 p-2 rounded-lg text-primary">🎬</span>
                            Starring {selectedActor}
                            <button
                                onClick={() => setSelectedActor(null)}
                                className="ml-auto text-sm font-normal text-gray-400 hover:text-white"
                            >
                                Clear
                            </button>
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {actorMovies.map(movie => (
                                <MovieCard key={movie.movie_id} movie={movie} />
                            ))}
                        </div>
                    </section>
                )}

                {user && recommended.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                            <span className="bg-green-500/20 p-2 rounded-lg text-green-400">✨</span>
                            Top Picks for {user.username}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {recommended.map(movie => (
                                <MovieCard key={movie.movie_id} movie={movie} />
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                        <span className="bg-orange-500/20 p-2 rounded-lg text-orange-400">🔥</span>
                        Trending Now
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {popular.map(movie => (
                            <MovieCard key={movie.movie_id} movie={{ ...movie, movie_id: movie.movie_id }} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
