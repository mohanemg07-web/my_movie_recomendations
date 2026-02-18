import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Film, ChevronDown, Search, User, LogOut, LogIn } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const [topActors, setTopActors] = useState([]);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        api.get('/movies/actors').then(res => setTopActors(res.data)).catch(() => { });
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setQuery('');
        }
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled
                ? 'bg-black/95 backdrop-blur-md shadow-lg'
                : 'bg-gradient-to-b from-black/80 to-transparent'
            }`}>
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    <Film className="w-7 h-7 text-primary" />
                    MovieAI
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/" className="text-sm font-semibold text-white/90 hover:text-primary uppercase tracking-wider transition-colors">Movie Picker</Link>
                    <Link to="/popular" className="text-sm font-semibold text-white/90 hover:text-primary uppercase tracking-wider transition-colors">Popular</Link>

                    <div className="relative group">
                        <button className="text-sm font-semibold text-white/90 hover:text-primary uppercase tracking-wider transition-colors flex items-center gap-1">
                            Top Genres <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute top-full left-0 mt-2 w-48 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top p-2">
                            {['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance'].map(genre => (
                                <Link key={genre} to={`/search?q=${genre}`} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors">
                                    {genre}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="relative group">
                        <button className="text-sm font-semibold text-white/90 hover:text-primary uppercase tracking-wider transition-colors flex items-center gap-1">
                            Top Actors <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute top-full left-0 mt-2 w-56 max-h-72 overflow-y-auto no-scrollbar bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top p-2">
                            {topActors.map((actor, idx) => (
                                <Link key={idx} to={`/?actor=${encodeURIComponent(actor.name)}`} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors">
                                    {actor.name} <span className="text-gray-500 text-xs">({actor.count})</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative hidden lg:block">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-56 px-4 py-1.5 pl-9 rounded-full bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-primary text-sm"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                        />
                        <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link to="/my-ratings" className="flex items-center gap-1.5 text-white/80 text-sm hidden sm:flex hover:text-primary transition-colors">
                                <User className="w-4 h-4" />
                                {user.username}
                            </Link>
                            <button onClick={logout} className="flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors uppercase">
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-white transition-colors uppercase">
                            <LogIn className="w-4 h-4" />
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
