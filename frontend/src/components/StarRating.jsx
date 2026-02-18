import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import api from '../api';

const StarRating = ({ movieId, initialRating = 0 }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [hoveredStar, setHoveredStar] = useState(0);
    const [selectedRating, setSelectedRating] = useState(initialRating);
    const [submitting, setSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleClick = async (e, star) => {
        e.stopPropagation();

        if (!user) {
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                navigate('/login');
            }, 1200);
            return;
        }

        setSelectedRating(star);
        setSubmitting(true);
        try {
            await api.post('/rate', {
                user_id: user.id,
                movie_id: movieId,
                rating: star,
            });
        } catch (err) {
            console.error('Failed to submit rating:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoveredStar || selectedRating);
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={submitting}
                        onMouseEnter={(e) => { e.stopPropagation(); setHoveredStar(star); }}
                        onMouseLeave={(e) => { e.stopPropagation(); setHoveredStar(0); }}
                        onClick={(e) => handleClick(e, star)}
                        className={`transition-all duration-150 transform hover:scale-125 ${submitting ? 'opacity-50 cursor-wait' : 'cursor-pointer'
                            }`}
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                        <Star
                            className={`w-3.5 h-3.5 transition-colors duration-150 ${isFilled
                                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]'
                                    : 'text-white/30 hover:text-white/50'
                                }`}
                        />
                    </button>
                );
            })}

            {selectedRating > 0 && !submitting && (
                <span className="text-[10px] text-amber-400/80 ml-1 font-semibold">{selectedRating}.0</span>
            )}

            {showToast && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark/95 border border-primary/50 text-primary text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap shadow-lg shadow-primary/20 animate-bounce z-50">
                    Login to rate!
                </div>
            )}
        </div>
    );
};

export default StarRating;
