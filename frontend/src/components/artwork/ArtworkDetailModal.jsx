import React, { useEffect, useState } from 'react';
import {
  HeartIcon,
  BookmarkIcon,
  ShieldCheckIcon,
  CloseIcon,
  EyeIcon,
  ImagePlaceholderIcon,
} from '../common/Icons';

export default function ArtworkDetailModal({
  artwork,
  role,
  onLike,
  onBuy,
  onWishlist,
  isLiked: liked = false,
  isWishlisted: wishlisted = false,
  onFollow,
  onViewPortfolio,
  isFollowing = false,
  canFollow = true,
  onClose,
  onEdit,
  onDelete,
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);

  useEffect(() => {
    setIsWishlisted(Boolean(wishlisted));
  }, [wishlisted, artwork?.id]);

  useEffect(() => {
    setIsLiked(Boolean(liked));
  }, [liked, artwork?.id]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (imageExpanded) setImageExpanded(false);
        else if (onClose) onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, imageExpanded]);

  if (!artwork) return null;

  const isAvailable = artwork.availabilityStatus === 'AVAILABLE';
  const isSold = artwork.availabilityStatus === 'SOLD';
  const isCollector = role === 'ART_COLLECTOR';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md transition-all animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="artwork-modal-title"
    >
      <div
        className="bg-white rounded-3xl overflow-hidden max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/90 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white flex items-center justify-center shadow-md transition-all"
          aria-label="Close dialog"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
          {/* Left Column: Artwork Image */}
          <div className="lg:col-span-7 bg-slate-950 flex flex-col items-center justify-center relative min-h-[360px] sm:min-h-[460px] p-4 sm:p-8">
            {artwork.mediaUrl ? (
              <img
                src={artwork.mediaUrl}
                alt={artwork.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-2xl transition-transform hover:scale-[1.01]"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 py-20">
                <ImagePlaceholderIcon className="w-16 h-16 text-slate-700 mb-3" />
                <span className="text-sm font-medium">Digital Art Showcase</span>
              </div>
            )}

            {/* Verification Badge */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-emerald-400 text-xs font-semibold border border-white/10">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
              <span>Verified Original</span>
            </div>
          </div>

          {/* Right Column: Metadata & Actions */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
            <div>
              {/* Category & Status Badges */}
              <div className="flex items-center gap-2 mb-4">
                {artwork.category && (
                  <span className="badge badge-category">
                    {artwork.category}
                  </span>
                )}
                <span className={`badge ${isAvailable ? 'badge-available' : 'badge-sold'}`}>
                  {isAvailable ? 'Available' : 'Sold Out'}
                </span>
              </div>

              {/* Title */}
              <h2
                id="artwork-modal-title"
                className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight mb-3"
              >
                {artwork.title}
              </h2>

              {/* Artist Profile Lockup */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3 min-w-0">
                  {artwork.artistAvatar ? (
                    <img
                      src={artwork.artistAvatar}
                      alt={artwork.artistName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                      {(artwork.artistName || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Creator
                    </span>
                    <span className="text-sm font-bold text-slate-900 truncate block font-display">
                      {artwork.artistName || 'Elena Rostova'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {artwork.artistPortfolioId && onViewPortfolio && (
                    <button
                      type="button"
                      onClick={() => onViewPortfolio(artwork.artistPortfolioId)}
                      className="btn btn-secondary text-xs py-1.5 px-3"
                    >
                      View Portfolio
                    </button>
                  )}
                  {artwork.artistPortfolioId && canFollow && onFollow && (
                    <button
                      type="button"
                      onClick={() => onFollow(artwork.artistPortfolioId)}
                      className={`btn text-xs py-1.5 px-3.5 ${
                        isFollowing
                          ? 'btn-secondary text-slate-700'
                          : 'btn-primary shadow-none'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-display">
                  About this Piece
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {artwork.description ||
                    'An exclusive digital artwork rendered with high fidelity. Recorded with immutable timestamp and provenance on ArtifyHub.'}
                </p>

                {artwork.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {artwork.tags.split(',').map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Metric Counters */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <EyeIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Views</span>
                    <span className="text-sm font-bold text-slate-900">{artwork.viewCount ?? 1}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                    <HeartIcon className="w-4 h-4" filled />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Likes</span>
                    <span className="text-sm font-bold text-slate-900">{artwork.likeCount ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Primary Purchase Card */}
            <div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4">
                <span className="text-xs font-medium text-slate-500 block mb-1">Current Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                    ${Number(artwork.price || 0).toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">USD</span>
                </div>
              </div>

              {/* Actions Row */}
              {isCollector && <div className="flex gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsLiked(!isLiked);
                    if (onLike) onLike(artwork.id);
                  }}
                  className={`flex-1 btn ${
                    isLiked
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'btn-secondary text-slate-700'
                  }`}
                >
                  <HeartIcon className="w-4 h-4" filled={isLiked} />
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextValue = !isWishlisted;
                    setIsWishlisted(nextValue);
                    if (onWishlist) onWishlist(artwork.id, nextValue);
                  }}
                  className={`flex-1 btn ${
                    isWishlisted
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                      : 'btn-secondary text-slate-700'
                  }`}
                >
                  <BookmarkIcon className="w-4 h-4" filled={isWishlisted} />
                  <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
                </button>
              </div>}

              {/* Purchase CTA for Collector */}
              {isCollector && isAvailable && (
                <button
                  type="button"
                  onClick={() => {
                    if (onBuy) onBuy(artwork.id);
                  }}
                  className="w-full btn btn-primary py-3.5 text-base font-bold shadow-lg shadow-indigo-600/30"
                >
                  Purchase Artwork
                </button>
              )}

              {isCollector && isSold && (
                <div className="w-full text-center py-3 px-4 rounded-xl bg-slate-100 text-slate-500 font-bold text-sm">
                  Artwork Already Acquired
                </div>
              )}

              {/* Owner Edit/Delete Actions */}
               {onEdit && role === 'DIGITAL_ARTIST' && (
                 <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                   <button
                     type="button"
                     onClick={() => onEdit(artwork)}
                     className="flex-1 btn btn-secondary text-xs py-2 text-indigo-600"
                   >
                     Edit Listing Details
                   </button>
                   {onDelete && (
                     <button
                       type="button"
                       onClick={() => onDelete(artwork)}
                       className="btn btn-danger text-xs py-2 px-3"
                     >
                       Delete
                     </button>
                   )}
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
