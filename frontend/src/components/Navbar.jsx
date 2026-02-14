import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [query, setQuery] = React.useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setQuery('');
        }
    };

    return (
        <nav className="glass fixed w-full z-50 transition-all duration-300">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                    MovieAI
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/" className="text-sm font-semibold text-white/90 hover:text-primary uppercase tracking-wider transition-colors">Movie Picker</Link>
                    <div className="relative group">
                        <button className="text-sm font-semibold text-white/90 hover:text-primary uppercase tracking-wider transition-colors flex items-center gap-1">
                            Top Genres
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {/* Simple Dropdown content */}
                        <div className="absolute top-full left-0 mt-2 w-48 bg-dark/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top p-2">
                            {['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance'].map(genre => (
                                <Link key={genre} to={`/search?q=${genre}`} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors">
                                    {genre}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <Link to="/popular" className="text-sm font-semibold text-white/90 hover:text-primary uppercase tracking-wider transition-colors">Popular</Link>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search Icon Toggle could go here, keeping the bar for now but cleaner */}
                    <div className="relative hidden lg:block">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-64 px-4 py-1.5 rounded-full bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-primary text-sm"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                        />
                        <svg className="w-4 h-4 text-white/50 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-white/80 text-sm hidden sm:inline">Hi, {user.username}</span>
                            <button onClick={logout} className="text-sm font-semibold text-white/70 hover:text-white uppercase">Logout</button>
                        </div>
                    ) : (
                        <Link to="/login" className="text-sm font-semibold text-primary hover:text-white transition-colors uppercase">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
