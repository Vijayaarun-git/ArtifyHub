import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  SparklesIcon,
  SearchIcon,
  BookmarkIcon,
  WalletIcon,
  UserIcon,
  LogoutIcon,
  PlusIcon,
  MenuIcon,
  CloseIcon,
  ChevronDownIcon
} from '../common/Icons';

export default function Navbar({ onOpenUpload }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useSelector((state) => state.auth);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const dropdownRef = useRef(null);

  const isAuthenticated = Boolean(auth?.token);
  const isLoginPage = location.pathname === '/login';
  const isArtist = auth?.role === 'DIGITAL_ARTIST';
  const isCollector = auth?.role === 'ART_COLLECTOR';
  const isCurator = auth?.role === 'PLATFORM_CURATOR';
  const displayName = auth?.username || (auth?.email ? auth.email.split('@')[0] : 'Collector');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    dispatch(logout());
    setDropdownOpen(false);
    navigate('/login');
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate('/marketplace');
    }
  }

  function handleSearchChange(e) {
    const value = e.target.value;
    setNavSearch(value);
    if (!value.trim() && location.pathname === '/marketplace') {
      navigate('/marketplace');
    }
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/home';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link
              to={isArtist ? '/dashboard' : '/'}
              className="flex items-center gap-2.5 text-slate-900 font-bold text-xl sm:text-2xl font-display tracking-tight group"
            >
              <span className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <span>
                Artify<span className="text-indigo-600">Hub</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              {!isLoginPage && !isArtist && !isCurator && <Link
                to="/"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive('/')
                    ? 'text-indigo-600 bg-indigo-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>}
              {isCollector && <Link
                to="/marketplace"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive('/marketplace')
                    ? 'text-indigo-600 bg-indigo-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Explore
              </Link>}

              {isArtist && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive('/dashboard')
                        ? 'text-indigo-600 bg-indigo-50/70'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Artworks
                  </Link>
                  <Link
                    to="/portfolio"
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive('/portfolio')
                        ? 'text-indigo-600 bg-indigo-50/70'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Portfolio
                  </Link>
                </>
              )}
              {isCurator && (
                <Link to="/curator" className={`px-3.5 py-2 rounded-lg text-sm font-semibold ${isActive('/curator') ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:bg-slate-50'}`}>
                  Curator Center
                </Link>
              )}

              {isCollector && (
                <>
                  <Link
                    to="/wishlist"
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive('/wishlist')
                        ? 'text-indigo-600 bg-indigo-50/70'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Wishlist
                  </Link>
                  <Link
                    to="/my-vault"
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive('/my-vault')
                        ? 'text-indigo-600 bg-indigo-50/70'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Vault
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Desktop Search */}
          {isCollector && !isLoginPage && <div className="hidden lg:block flex-1 max-w-xs">
            <form onSubmit={handleSearchSubmit} className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <SearchIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search artworks or artists..."
                value={navSearch}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-full text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
              />
            </form>
          </div>}

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && !isLoginPage ? (
              <>
                {/* Collector Quick Links */}
                {isCollector && (
                  <div className="hidden sm:flex items-center gap-1">
                    <Link
                      to="/wishlist"
                      className="p-2.5 rounded-full text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                      title="Wishlist"
                      aria-label="Wishlist"
                    >
                      <BookmarkIcon className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/my-vault"
                      className="p-2.5 rounded-full text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                      title="My Vault"
                      aria-label="My Vault"
                    >
                      <WalletIcon className="w-5 h-5" />
                    </Link>
                  </div>
                )}

                {/* Artist Upload CTA */}
                {isArtist && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenUpload) onOpenUpload();
                      else navigate('/dashboard?upload=true');
                    }}
                    className="hidden sm:inline-flex btn btn-primary text-xs py-2 px-3.5 shadow-sm"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>Upload Art</span>
                  </button>
                )}

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-50 transition-all border border-slate-200/80 focus:outline-none"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 hidden sm:block mr-1" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate font-display">{displayName}</p>
                        <p className="text-xs text-slate-400 truncate">{auth?.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700">
                          {isArtist ? 'Digital Artist' : 'Art Collector'}
                        </span>
                      </div>

                      <div className="py-1">
                        {isArtist ? (
                          <>
                            <Link
                              to="/dashboard"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                            >
                              <UserIcon className="w-4 h-4" />
                              Artist Studio & Artworks
                            </Link>
                            <Link
                              to="/portfolio"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                            >
                              <SparklesIcon className="w-4 h-4" />
                              Public Portfolio
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/my-vault"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                            >
                              <WalletIcon className="w-4 h-4" />
                              My Digital Vault
                            </Link>
                            <Link
                              to="/wishlist"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                            >
                              <BookmarkIcon className="w-4 h-4" />
                              Saved Wishlist
                            </Link>
                            <Link
                              to="/profile"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                            >
                              <UserIcon className="w-4 h-4" />
                              Edit My Profile
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1 mt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogoutIcon className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : !isLoginPage ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="btn btn-primary text-xs py-2 px-4 shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            ) : null}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-fade-in shadow-xl">
          {!isLoginPage && <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <SearchIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search artworks..."
                value={navSearch}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </form>}

          {!isLoginPage && (
            <Link
              to="/"
              className={`block px-3 py-2.5 rounded-lg text-sm font-semibold ${
                isActive('/') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700'
              }`}
            >
              Home
            </Link>
          )}
          <Link
            to="/marketplace"
            className={`block px-3 py-2.5 rounded-lg text-sm font-semibold ${
              isActive('/marketplace') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700'
            }`}
          >
            Explore Marketplace
          </Link>

          {isArtist && (
            <>
              <Link
                to="/dashboard"
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Artist Studio
              </Link>
              <Link
                to="/portfolio"
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                My Portfolio
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenUpload) onOpenUpload();
                  else navigate('/dashboard?upload=true');
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                + Upload New Artwork
              </button>
            </>
          )}

          {isCollector && (
            <>
              <Link
                to="/wishlist"
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Wishlist
              </Link>
              <Link
                to="/my-vault"
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                My Vault
              </Link>
              <Link
                to="/profile"
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Edit My Profile
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="pt-4 mt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" className="btn btn-secondary w-full text-center">
                Sign In
              </Link>
              <Link to="/login" className="btn btn-primary w-full text-center">
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
