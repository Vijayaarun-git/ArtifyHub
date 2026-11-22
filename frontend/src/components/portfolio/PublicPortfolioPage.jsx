import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SEED_ARTWORKS, FEATURED_ARTISTS } from '../../data/seedArtworks';
import ArtworkCard from '../artwork/ArtworkCard';
import ArtworkDetailModal from '../artwork/ArtworkDetailModal';
import * as transactionService from '../../services/transactionService';
import { showToast } from '../../store/slices/uiSlice';
import { ArrowLeftIcon, ShieldCheckIcon } from '../common/Icons';

export default function PublicPortfolioPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { artistId } = useParams();
  const auth = useSelector((state) => state.auth);
  const canCollect = auth?.role === 'ART_COLLECTOR';
  const artistArtworks = SEED_ARTWORKS.filter(
    (item) => String(item.artistPortfolioId) === String(artistId)
  );
  const featuredArtist = FEATURED_ARTISTS.find((item) => String(item.id) === String(artistId));
  const artistSource = artistArtworks[0];
  const artist = featuredArtist || (artistSource && {
    id: Number(artistId),
    name: artistSource.artistName,
    handle: `@${String(artistSource.artistName || 'artist').toLowerCase().replace(/\s+/g, '')}`,
    avatar: artistSource.artistAvatar,
    bio: artistSource.artistBio || 'Digital artist creating original works for the ArtifyHub community.',
    specialization: artistSource.category || 'Digital Art',
    followerCount: 0,
    totalSales: '$0',
  });
  const [purchasedIds, setPurchasedIds] = useState(() => new Set(
    JSON.parse(localStorage.getItem('artify_demo_purchases') || '[]').map(Number)
  ));
  const [salesTotal, setSalesTotal] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('artify_demo_artist_sales') || '{}');
    const base = 0;
    return Number(stored[artistId] ?? base);
  });
  const [isFollowing, setIsFollowing] = useState(() => {
    const followed = JSON.parse(localStorage.getItem('artify_demo_following') || '[]').map(String);
    return followed.includes(String(artistId));
  });
  const [followerCount, setFollowerCount] = useState(artist?.followerCount || 0);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(() => new Set(
    JSON.parse(localStorage.getItem('artify_demo_wishlist') || '[]').map(Number)
  ));
  const [likedIds, setLikedIds] = useState(() => new Set(
    JSON.parse(localStorage.getItem('artify_demo_likes') || '[]').map(Number)
  ));
  const [likeCounts, setLikeCounts] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('artify_demo_like_counts') || '{}');
    return Object.fromEntries(artistArtworks.map((item) => [
      item.id,
      Number(stored[item.id] ?? item.likeCount ?? 0),
    ]));
  });
  const artworks = artistArtworks.map((artwork) =>
    purchasedIds.has(Number(artwork.id))
      ? { ...artwork, availabilityStatus: 'SOLD' }
      : artwork
  );

  function handleFollow() {
    if (!auth?.token) {
      navigate('/login');
      return;
    }

    const nextFollowing = !isFollowing;
    const followed = JSON.parse(localStorage.getItem('artify_demo_following') || '[]').map(String);
    const nextFollowed = nextFollowing
      ? [...new Set([...followed, String(artistId)])]
      : followed.filter((id) => id !== String(artistId));

    localStorage.setItem('artify_demo_following', JSON.stringify(nextFollowed));
    setIsFollowing(nextFollowing);
    setFollowerCount((count) => Math.max(0, count + (nextFollowing ? 1 : -1)));
    dispatch(showToast(nextFollowing ? 'Following artist' : 'Unfollowed artist'));

    // Persist to the API when this portfolio also exists in the backend.
    if (artist?.id) {
      transactionService.toggleFollow(artist.id).catch(() => {});
    }
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Artist not found</h1>
          <Link to="/marketplace" className="btn btn-primary mt-4">Back to marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="h-64 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div className="flex items-center gap-5 min-w-0">
              <img
                src={artist.avatar}
                alt={artist.name}
                className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl shrink-0"
              />
              <div className="min-w-0 pb-1 pt-5 sm:pt-8">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg font-display truncate">{artist.name}</h1>
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-base font-semibold text-indigo-600">{artist.handle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFollow}
              className={`btn text-base py-3 px-6 ${
                isFollowing ? 'btn-secondary text-slate-700' : 'btn-primary'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow Artist'}
            </button>
          </div>

          <div className="mt-7 max-w-3xl">
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed">{artist.bio}</p>
            <p className="text-base font-semibold text-slate-500 mt-3">{artist.specialization}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl mt-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <span className="text-sm text-slate-400 block">Artworks</span>
              <strong className="text-3xl text-slate-900">{artworks.length}</strong>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <span className="text-sm text-slate-400 block">Followers</span>
              <strong className="text-3xl text-slate-900">{followerCount.toLocaleString()}</strong>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <span className="text-sm text-slate-400 block">Total sales</span>
              <strong className="text-3xl text-indigo-600">
                ${salesTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-12 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 font-display">Published artworks</h2>
          <Link to="/marketplace" className="text-sm font-semibold text-indigo-600 inline-flex items-center gap-2">
            <ArrowLeftIcon className="w-4 h-4" /> Marketplace
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {artworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              onClick={setSelectedArtwork}
              isLiked={likedIds.has(Number(artwork.id))}
              artwork={{ ...artwork, likeCount: likeCounts[artwork.id] }}
              onLike={canCollect ? (artworkId) => {
                const nextLiked = !likedIds.has(Number(artworkId));
                const nextIds = new Set(likedIds);
                nextLiked ? nextIds.add(Number(artworkId)) : nextIds.delete(Number(artworkId));
                const nextCount = Math.max(0, (likeCounts[artworkId] || 0) + (nextLiked ? 1 : -1));
                const stored = JSON.parse(localStorage.getItem('artify_demo_like_counts') || '{}');
                stored[artworkId] = nextCount;
                localStorage.setItem('artify_demo_like_counts', JSON.stringify(stored));
                localStorage.setItem('artify_demo_likes', JSON.stringify([...nextIds]));
                setLikedIds(nextIds);
                setLikeCounts((current) => ({ ...current, [artworkId]: nextCount }));
              } : undefined}
              isWishlisted={wishlistIds.has(Number(artwork.id))}
              onWishlist={canCollect ? (artworkId) => {
                if (!auth?.token) {
                  navigate('/login');
                  return;
                }
                const saved = JSON.parse(localStorage.getItem('artify_demo_wishlist') || '[]').map(Number);
                const next = saved.includes(Number(artworkId))
                  ? saved.filter((id) => id !== Number(artworkId))
                  : [...saved, Number(artworkId)];
                localStorage.setItem('artify_demo_wishlist', JSON.stringify(next));
                setWishlistIds(new Set(next));
              } : undefined}
            />
          ))}
        </div>
      </main>
      {selectedArtwork && (
        <ArtworkDetailModal
          artwork={selectedArtwork}
          role={auth?.role}
          isLiked={likedIds.has(Number(selectedArtwork.id))}
          onLike={canCollect ? (artworkId) => {
            const nextLiked = !likedIds.has(Number(artworkId));
            const nextIds = new Set(likedIds);
            nextLiked ? nextIds.add(Number(artworkId)) : nextIds.delete(Number(artworkId));
            const nextCount = Math.max(0, (likeCounts[artworkId] || 0) + (nextLiked ? 1 : -1));
            const stored = JSON.parse(localStorage.getItem('artify_demo_like_counts') || '{}');
            stored[artworkId] = nextCount;
            localStorage.setItem('artify_demo_like_counts', JSON.stringify(stored));
            localStorage.setItem('artify_demo_likes', JSON.stringify([...nextIds]));
            setLikedIds(nextIds);
            setLikeCounts((current) => ({ ...current, [artworkId]: nextCount }));
            setSelectedArtwork((current) => ({ ...current, likeCount: nextCount }));
          } : undefined}
          isWishlisted={wishlistIds.has(Number(selectedArtwork.id))}
          onWishlist={canCollect ? (artworkId) => {
            if (!auth?.token) {
              navigate('/login');
              return;
            }
            const saved = JSON.parse(localStorage.getItem('artify_demo_wishlist') || '[]').map(Number);
            const next = saved.includes(Number(artworkId))
              ? saved.filter((id) => id !== Number(artworkId))
              : [...saved, Number(artworkId)];
            localStorage.setItem('artify_demo_wishlist', JSON.stringify(next));
            setWishlistIds(new Set(next));
          } : undefined}
          onBuy={canCollect ? (artworkId) => {
            if (!auth?.token) {
              navigate('/login');
              return;
            }
            const purchased = JSON.parse(localStorage.getItem('artify_demo_purchases') || '[]').map(Number);
            if (!purchased.includes(Number(artworkId))) {
              const nextPurchased = [...purchased, Number(artworkId)];
              localStorage.setItem(
                'artify_demo_purchases',
                JSON.stringify(nextPurchased)
              );
              setPurchasedIds(new Set(nextPurchased));
              const artwork = artistArtworks.find((item) => Number(item.id) === Number(artworkId));
              const nextSales = salesTotal + Number(artwork?.price || 0);
              const storedSales = JSON.parse(localStorage.getItem('artify_demo_artist_sales') || '{}');
              storedSales[artistId] = nextSales;
              localStorage.setItem('artify_demo_artist_sales', JSON.stringify(storedSales));
              setSalesTotal(nextSales);
            }
            const saved = JSON.parse(localStorage.getItem('artify_demo_wishlist') || '[]')
              .map(Number)
              .filter((id) => id !== Number(artworkId));
            localStorage.setItem('artify_demo_wishlist', JSON.stringify(saved));
            dispatch(showToast('Artwork added to your Vault'));
            setSelectedArtwork(null);
          } : undefined}
          onViewPortfolio={() => setSelectedArtwork(null)}
          onClose={() => setSelectedArtwork(null)}
        />
      )}
    </div>
  );
}
