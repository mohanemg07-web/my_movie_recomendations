import { useParams } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/similar/${id}`);
                setMovie(res.data);
                setSimilar(res.data.similar);
            } catch (err) {
                console.error("Error fetching detail:", err);
            }
        };
        fetchDetails();
    }, [id]);

    const handleRate = async (value) => {
        if (!user) {
            alert("Please login to rate movies");
            return;
        }
        setRating(value);
        try {
            await api.post('/rate', {
                user_id: user.id,
                movie_id: id,
                rating: value
            });
            alert(`Rated ${value} stars!`);
        } catch (err) {
            console.error("Error rating:", err);
        }
    }

    if (!movie) return <div className="text-white text-center mt-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-dark">
            <Navbar />
            <div className="container mx-auto px-6 pt-24">
                <div className="glass rounded-xl p-8 mb-12 flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/3 h-96 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-2xl flex items-center justify-center text-white text-4xl font-bold">
                        {movie.title[0]}
                    </div>
                    <div className="md:w-2/3 text-white">
                        <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
                        <div className="mb-6">
                            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold border border-primary/30">
                                Rec Sys Powered
                            </span>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-2">Rate this movie</h3>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        className={`text-3xl transition-transform hover:scale-110 ${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                                        onClick={() => handleRate(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(rating)}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-accent pl-4">Similar Movies</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {similar.map(m => (
                            <MovieCard key={m.movie_id} movie={m} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetail;
