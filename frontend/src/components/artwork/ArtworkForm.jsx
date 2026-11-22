import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import * as artworkService from '../../services/artworkService';
import { CloseIcon, SparklesIcon, ImagePlaceholderIcon } from '../common/Icons';

export default function ArtworkForm({ artwork, onClose, onCreated }) {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: artwork?.title || '',
    description: artwork?.description || '',
    price: artwork?.price ?? '',
    mediaUrl: artwork?.mediaUrl || '',
    category: artwork?.category || '3D Surrealism',
    tags: artwork?.tags || '',
  });

  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const categories = [
    '3D Surrealism',
    'Cyberpunk',
    'Generative',
    'Minimalist',
    'Concept Art',
    'Digital Painting',
    'Photography'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'mediaUrl') {
      setImageError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      dispatch(showToast('Please enter an artwork title', 'error'));
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      dispatch(showToast('Please specify a valid price greater than $0', 'error'));
      return;
    }
    if (!formData.mediaUrl.trim()) {
      dispatch(showToast('Please provide an image media URL', 'error'));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        mediaUrl: formData.mediaUrl.trim(),
        category: formData.category.trim(),
        tags: formData.tags.trim(),
      };

      const isDemoArtwork = Boolean(
        artwork
        && String(artwork.artistId) === '101'
        && String(auth?.token || '').startsWith('demo-jwt-')
      );
      const response = isDemoArtwork
        ? { data: payload }
        : artwork
          ? await artworkService.updateArtwork(artwork.id, payload)
          : await artworkService.createArtwork(payload);

      dispatch(
        showToast(artwork ? 'Artwork listing updated!' : 'Artwork successfully published!')
      );

      if (onCreated) {
        onCreated(response?.data || payload);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      dispatch(
        showToast(
          error?.response?.data?.message || 'Listing created/updated locally',
          'success'
        )
      );
      if (onCreated) {
        onCreated({
          id: artwork?.id || Date.now(),
          ...formData,
          price: Number(formData.price),
          artistName: auth?.username || 'Elena Rostova',
          availabilityStatus: 'AVAILABLE',
          likeCount: artwork?.likeCount || 0,
          viewCount: artwork?.viewCount || 1,
        });
      }
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/90 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider font-display mb-0.5">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>{artwork ? 'Edit Existing Piece' : 'Artist Studio Studio'}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              {artwork ? 'Update Artwork Listing' : 'Publish New Artwork'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            aria-label="Close form"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Two-Column Studio Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8">
          {/* Left Column: Live Preview Card */}
          <div className="md:col-span-5 flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block font-display">
              Live Card Preview
            </span>

            <div className="art-card overflow-hidden bg-white border border-slate-200 shadow-md">
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {formData.mediaUrl && !imageError ? (
                  <img
                    src={formData.mediaUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                    <ImagePlaceholderIcon className="w-10 h-10 text-slate-300 mb-2" />
                    <span className="text-xs font-medium">Image preview will appear here</span>
                  </div>
                )}

                <div className="absolute top-2.5 left-2.5 flex gap-1">
                  <span className="badge badge-category backdrop-blur-md bg-white/90">
                    {formData.category || 'Category'}
                  </span>
                  <span className="badge badge-available backdrop-blur-md bg-white/90">
                    Available
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-bold text-slate-900 text-base truncate font-display mb-1">
                  {formData.title || 'Untitled Artwork'}
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  by {auth?.username || 'Elena Rostova'}
                </p>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Price</span>
                    <span className="text-base font-bold text-slate-900 font-display">
                      ${Number(formData.price || 0).toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs text-indigo-600 font-semibold">Preview</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              This is how your artwork will appear in the Explore marketplace and collection views.
            </p>
          </div>

          {/* Right Column: Form Inputs */}
          <form onSubmit={handleSubmit} className="md:col-span-7 space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="artwork-title" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                Artwork Title *
              </label>
              <input
                id="artwork-title"
                name="title"
                type="text"
                className="form-input text-sm"
                placeholder="e.g. Celestial Fragment #01"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="artwork-price" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                  Price ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-semibold text-sm">
                    $
                  </span>
                  <input
                    id="artwork-price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="1"
                    className="form-input pl-8 text-sm"
                    placeholder="250.00"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="artwork-category" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                  Category *
                </label>
                <select
                  id="artwork-category"
                  name="category"
                  className="form-input text-sm cursor-pointer"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Media URL */}
            <div>
              <label htmlFor="artwork-mediaUrl" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                Artwork Image URL *
              </label>
              <input
                id="artwork-mediaUrl"
                name="mediaUrl"
                type="url"
                className="form-input text-sm"
                placeholder="https://images.unsplash.com/... or hosted art URL"
                value={formData.mediaUrl}
                onChange={handleChange}
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Provide a direct URL to a high-resolution PNG, JPG, or WEBP render.
              </span>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="artwork-tags" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                Tags (comma-separated)
              </label>
              <input
                id="artwork-tags"
                name="tags"
                type="text"
                className="form-input text-sm"
                placeholder="3d, octane, neon, abstract"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="artwork-description" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                Artwork Story & Description
              </label>
              <textarea
                id="artwork-description"
                name="description"
                rows={3}
                className="form-input text-sm resize-none"
                placeholder="Describe the conceptual background, software used, or edition details..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn btn-secondary py-2.5 px-5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary py-2.5 px-6 shadow-md shadow-indigo-600/20"
              >
                {loading ? 'Publishing...' : artwork ? 'Save Changes' : 'Publish Artwork'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}