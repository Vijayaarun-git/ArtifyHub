import React from 'react';
import { HeartIcon, BookmarkIcon, ImagePlaceholderIcon } from '../common/Icons';

export default function ArtworkCard({
  artwork,
  onClick,
  onLike,
  onWishlist,
  isLiked = false,
  isWishlisted = false,
  role, // role of current user, e.g., 'DIGITAL_ARTIST' or 'ART_COLLECTOR'
  onEdit,
  onDelete,
}) {
  const isAvailable = artwork.availabilityStatus === 'AVAILABLE';
  const isSold = artwork.availabilityStatus === 'SOLD';

  const handleCardClick = (e) => {
    if (onClick) onClick(artwork);
  };

  return (
    <div
      className={`art-card group cursor-pointer flex flex-col relative ${
        isSold ? 'bg-slate-200' : ''
      }`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e);
        }
      }}
      aria-label={`View details for ${artwork.title}`}
    >
      {/* Artwork Image Container */}
      <div className={`relative aspect-[4/3] w-full overflow-hidden bg-slate-100 ${
        isSold ? 'grayscale' : ''
      }`}>
        {artwork.mediaUrl ? (
          <img
            src={artwork.mediaUrl}
            alt={artwork.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextSibling) {
                e.currentTarget.nextSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}

        <div
          className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400"
          style={{ display: artwork.mediaUrl ? 'none' : 'flex' }}
        >
          <ImagePlaceholderIcon className="w-10 h-10 text-slate-300 mb-2" />
          <span className="text-xs font-medium text-slate-400">Artwork Preview</span>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {artwork.category && (
            <span className="badge badge-category backdrop-blur-md bg-white/90 shadow-sm">
              {artwork.category}
            </span>
          )}
          <span
            className={`badge ${
              isAvailable ? 'badge-available' : 'badge-sold'
            } backdrop-blur-md bg-white/90 shadow-sm`}
          >
            {isAvailable ? 'Available' : 'Sold'}
          </span>
        </div>

        {/* Floating Action Buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 transition-opacity duration-200 opacity-90 sm:opacity-0 group-hover:opacity-100">
          {onWishlist && (
            <button
              type="button"
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
                isWishlisted
                  ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                  : 'bg-white/90 text-slate-700 hover:bg-white hover:text-indigo-600'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onWishlist(artwork.id);
              }}
              title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-label="Wishlist artwork"
            >
              <BookmarkIcon className="w-4 h-4" filled={isWishlisted} />
            </button>
          )}

          {onLike && (
            <button
              type="button"
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
                isLiked
                  ? 'bg-rose-500 text-white shadow-rose-500/30'
                  : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-500'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onLike(artwork.id);
              }}
              title={isLiked ? 'Unlike' : 'Like'}
              aria-label="Like artwork"
            >
              <HeartIcon className="w-4 h-4" filled={isLiked} />
            </button>
          )}
        </div>
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <span className="border-4 border-red-600 text-red-600 px-5 py-2 text-2xl font-black uppercase tracking-[0.25em] rotate-[-12deg] bg-white/70 shadow-lg">
              Sold
            </span>
          </div>
        )}
      </div>

      {/* Metadata Section */}
      <div className={`p-5 flex flex-col flex-1 justify-between bg-white ${
        isSold ? 'grayscale' : ''
      }`}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {artwork.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {artwork.artistAvatar ? (
              <img
                src={artwork.artistAvatar}
                alt={artwork.artistName}
                className="w-5 h-5 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                {(artwork.artistName || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-medium text-slate-500 truncate">
              {artwork.artistName || 'Unknown Artist'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Price
            </span>
            <span className="text-lg font-bold text-slate-900 tracking-tight font-display">
              ${Number(artwork.price || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <HeartIcon className="w-3.5 h-3.5 text-rose-400" filled />
            <span>{artwork.likeCount ?? 0}</span>
          </div>
        </div>

        {/* Owner Quick Actions */}
        {role === 'DIGITAL_ARTIST' && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
            {onEdit && (
              <button
                type="button"
                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(artwork);
                }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(artwork);
                }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
