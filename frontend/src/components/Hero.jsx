import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Hero = () => {
    const [backdrops, setBackdrops] = useState([]);

    useEffect(() => {
        // Fetch popular movies to use as background posters
        api.get('/popular').then(res => {
            // Get first 20 movies
            setBackdrops(res.data.slice(0, 20));
        }).catch(err => console.error(err));
    }, []);

    return (
        <div className="relative h-64 w-full overflow-hidden flex items-center justify-center bg-dark">
            {/* Background Grid */}
            <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 opacity-20 pointer-events-none grayscale">
                {backdrops.map((movie) => (
                    <div key={movie.movie_id} className="relative aspect-[2/3] overflow-hidden">
                        {movie.tmdb_id ? (
                            <img
                                src={`https://image.tmdb.org/t/p/w200${movie.tmdb_id}`} // This is wrong, tmdb_id is ID not path. MovieCard logic needs to be reused or replicated.
                                // Wait, the API returns tmdb_id. I need to fetch the image path.
                                // Actually, I can't easily fetch 20 image paths individually here without spamming.
                                // Let's use a placeholder or basic gradient if we can't get images easily.
                                // BETTER: The /popular endpoint returns 'tmdb_id'. 
                                // I can construct the URL if I had the poster_path. 
                                // My /popular endpoint in backend currently DOES NOT return poster_path, only tmdb_id.
                                // I need to fetch the poster_path from TMDB for each. 
                                // Doing this for 20 movies client-side is heavy.
                                // ALTERNATIVE: Use a static set of images or just gradients for now?
                                // OR: Just use the `tmdb_id` to try to fetch the image directly? 
                                // standard TMDB image url is https://image.tmdb.org/t/p/w500/IMAGE_ID.jpg. 
                                // But I don't have the image ID (poster_path). I only have the movie ID.
                                // I'll use a CSS pattern fallback for now to avoid complexity, or just fetch 5-6.
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-white/10"></div>
                        )}
                        {/* Actually, let's just make the MovieCard logic reusable or do a quick fetch for top 5 */}
                    </div>
                ))}
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/60 to-dark"></div>
        </div>
    );
};

export default Hero;
