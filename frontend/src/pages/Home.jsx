import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import { useAuth } from '../context/AuthContext';

const GENRES = ['Action', 'Comedy', 'Drama', 'Thriller', 'Sci-Fi', 'Romance', 'Animation', 'Crime'];

const Home = () => {
    const [popular, setPopular] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [recType, setRecType] = useState('popular');
    const [heroMovie, setHeroMovie] = useState(null);
    const [actorMovies, setActorMovies] = useState([]);
    const [genreRows, setGenreRows] = useState({});
    const [ratingsMap, setRatingsMap] = useState({});
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const selectedActor = searchParams.get('actor');

    // Main data fetch
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const promises = [api.get('/popular')];
                if (user) {
                    promises.push(api.get(`/recommend/${user.id}`));
                    promises.push(api.get(`/ratings/${user.id}`));
                }
                const results = await Promise.all(promises);
                const popularMovies = results[0].data || [];
                setPopular(popularMovies);

                if (user) {
                    if (results[1]?.data) {
                        const recData = results[1].data;
                        setRecommended(recData.recommendations || []);
                        setRecType(recData.type || 'popular');
                    }
                    if (results[2] && Array.isArray(results[2].data)) {
                        const rMap = {};
                        results[2].data.forEach(r => { rMap[r.movie_id] = r.rating; });
                        setRatingsMap(rMap);
                    }
                }

                // Set hero: top recommended for logged-in, random popular for guest
                if (user && results[1]?.data?.recommendations?.length > 0) {
                    setHeroMovie(results[1].data.recommendations[0]);
                } else if (popularMovies.length > 0) {
                    const randomIdx = Math.floor(Math.random() * Math.min(5, popularMovies.length));
                    setHeroMovie(popularMovies[randomIdx]);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Fetch genre rows after main data loads
    useEffect(() => {
        if (loading) return;
        GENRES.forEach(genre => {
            api.get(`/movies/genre/${encodeURIComponent(genre)}`)
                .then(res => {
                    if (res.data?.length > 0) {
                        setGenreRows(prev => ({ ...prev, [genre]: res.data }));
                    }
                })
                .catch(() => { });
        });
    }, [loading]);

    // Fetch actor movies when actor param changes
    useEffect(() => {
        if (selectedActor) {
            api.get(`/movies/actor/${encodeURIComponent(selectedActor)}`)
                .then(res => setActorMovies(res.data))
                .catch(() => setActorMovies([]));
        } else {
            setActorMovies([]);
        }
    }, [selectedActor]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-black text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
        </div>
    );

    // Determine rec row label
    const recLabel = recType === 'similar'
        ? `Top Picks for ${user?.username} — Based on Your Ratings`
        : recType === 'personalized'
            ? `Top Picks for ${user?.username}`
            : `Top Picks for ${user?.username}`;

    return (
        <div className="min-h-screen bg-black text-gray-100 font-sans">
            <Navbar />

            {/* Fullscreen Hero */}
            <HeroSection movie={heroMovie} />

            {/* Rows — overlap the hero with negative margin */}
            <div className="relative z-10 pb-16 space-y-2">

                {/* Actor row (when selected from navbar) */}
                {selectedActor && actorMovies.length > 0 && (
                    <MovieRow
                        title={`Starring ${selectedActor}`}
                        movies={actorMovies}
                        ratingsMap={ratingsMap}
                    />
                )}

                {/* Personalized recommendations */}
                {user && recommended.length > 0 && (
                    <MovieRow
                        title={recLabel}
                        movies={recommended}
                        ratingsMap={ratingsMap}
                    />
                )}

                {/* Trending Now */}
                <MovieRow
                    title="Trending Now"
                    movies={popular}
                    ratingsMap={ratingsMap}
                />

                {/* Genre rows */}
                {GENRES.map(genre => (
                    genreRows[genre]?.length > 0 && (
                        <MovieRow
                            key={genre}
                            title={genre}
                            movies={genreRows[genre]}
                            ratingsMap={ratingsMap}
                        />
                    )
                ))}
            </div>
        </div>
    );
};

export default Home;
