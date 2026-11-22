import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as portfolioService from '../../services/portfolioService';
import { fetchMarketplace } from '../../store/slices/artworkSlice';
import { showToast } from '../../store/slices/uiSlice';
import ArtworkCard from '../artwork/ArtworkCard';
import ArtworkDetailModal from '../artwork/ArtworkDetailModal';
import { SEED_ARTWORKS } from '../../data/seedArtworks';
import {
  ShieldCheckIcon,
  EditIcon,
} from '../common/Icons';

export default function PortfolioPage() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { items = [] } = useSelector((state) => state.artwork);

  const [portfolio, setPortfolio] = useState(null);
  const [activeTab, setActiveTab] = useState('artworks'); // 'artworks' | 'about'
  const [form, setForm] = useState({
    biography: '',
    portfolioUrl: '',
    websiteUrl: '',
    skills: '3D Surrealism, Octane Render, Generative Art',
    twitterUrl: '',
    instagramUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  useEffect(() => {
    const isDemoArtist = String(auth?.token || '').startsWith('demo-jwt-')
      && String(auth?.accountid || auth?.accountId) === '101';
    if (!isDemoArtist) {
      dispatch(fetchMarketplace({}));
    }
    portfolioService
      .getMyPortfolio()
      .then(({ data }) => {
        setPortfolio(data);
        setForm({
          biography:
            data?.biography ||
            'Pioneering digital sculptor exploring physical simulations, subsurface light refractions, and computational forms in virtual environments.',
          portfolioUrl: data?.portfolioUrl || 'https://artify.io/@elena',
          websiteUrl: data?.websiteUrl || '',
          skills: data?.skills || '3D Modeling, Blender, Octane, Generative AI',
          twitterUrl: data?.twitterUrl || '',
          instagramUrl: data?.instagramUrl || '',
        });
      })
      .catch(() => {
        // Demo artist profile data; sales remain zero until an artwork is purchased.
        setPortfolio({
          followerCount: 1420,
          totalSalesVolume: 0,
          biography:
            'Digital artist and researcher exploring fluid mechanics, optical caustics, and generative lattices.',
        });
        setForm({
          biography:
            'Digital artist and researcher exploring fluid mechanics, optical caustics, and generative lattices.',
          portfolioUrl: 'https://artify.io/@artist',
          websiteUrl: '',
          skills: '3D Sculpting, Generative Geometry, Volumetric Lighting',
          twitterUrl: '',
          instagramUrl: '',
        });
      });
  }, [auth?.accountid, auth?.accountId, auth?.token, dispatch]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await portfolioService.updateMyPortfolio(form);
      setPortfolio(data);
      dispatch(showToast('Portfolio profile updated successfully!'));
      setActiveTab('artworks');
    } catch (error) {
      const message = error?.response?.data?.message || 'Portfolio changes saved';
      dispatch(showToast(message, 'error'));
      setActiveTab('artworks');
    } finally {
      setSaving(false);
    }
  }

  // Filter artworks created by this artist
  const artistIdStr = String(auth?.accountid || auth?.accountId || '');
  let artistArtworks = items.filter(
    (item) => String(item.artistId) === artistIdStr || String(item.artistEmail) === String(auth?.email)
  );

  if (artistArtworks.length === 0 && artistIdStr === '101') {
    const overrides = JSON.parse(localStorage.getItem('artify_demo_artist_overrides') || '{}');
    const deleted = new Set(
      JSON.parse(localStorage.getItem('artify_demo_artist_deleted') || '[]').map(String)
    );
    artistArtworks = SEED_ARTWORKS
      .filter((item) => String(item.artistId) === '101' && !deleted.has(String(item.id)))
      .map((item) => ({ ...item, ...(overrides[item.id] || {}) }));
  }

  const displayName = auth?.username || 'Elena Rostova';
  const storedDemoSales = JSON.parse(localStorage.getItem('artify_demo_artist_sales') || '{}');
  const salesVolume = portfolio?.totalSalesVolume != null
    ? Number(portfolio.totalSalesVolume)
    : Number(storedDemoSales[1] || storedDemoSales[auth?.accountid] || 0);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* 1. PORTFOLIO COVER BANNER */}
      <div className="h-60 sm:h-72 w-full bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. ARTIST PROFILE HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 sm:-mt-24 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            {/* Avatar & Identifiers */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white p-1.5 shadow-2xl border border-slate-200">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white text-4xl font-extrabold font-display shadow-inner">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-sm" title="Verified Creator">
                  <ShieldCheckIcon className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-2 min-w-0 pb-1 pt-5 sm:pt-8">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg font-display tracking-tight truncate">
                    {displayName}
                  </h1>
                  <span className="badge badge-category text-[10px]">
                    Verified Artist
                  </span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-indigo-600">
                  @{displayName.toLowerCase().replace(/\s+/g, '_')}
                </p>
              </div>
            </div>

            {/* Profile actions */}
            <div className="flex items-center gap-3 sm:pb-1">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'about' ? 'artworks' : 'about')}
                className="btn btn-secondary py-3 px-5 text-sm font-semibold"
              >
                <EditIcon className="w-4 h-4 text-slate-500" />
                <span>{activeTab === 'about' ? 'View Gallery' : 'Edit Profile'}</span>
              </button>

            </div>
          </div>

          {/* Bio & Skills Preview */}
          <div className="mt-7 max-w-3xl space-y-3">
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
              {form.biography}
            </p>

            {form.skills && (
              <div className="flex flex-wrap gap-2 pt-1">
                {form.skills.split(',').map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium shadow-xs"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-6 max-w-md">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Artworks
              </span>
              <span className="text-3xl font-extrabold text-slate-900 font-display">
                {artistArtworks.length}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Followers
              </span>
              <span className="text-3xl font-extrabold text-slate-900 font-display">
                {portfolio?.followerCount || 0}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Sales Volume
              </span>
              <span className="text-3xl font-extrabold text-indigo-600 font-display">
                {salesVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* 3. TAB NAVIGATION */}
        <div className="border-b border-slate-200/80 mb-8 flex gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('artworks')}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'artworks'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Artworks ({artistArtworks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'about'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Edit Profile & Bio
          </button>
        </div>

        {/* 4. TAB CONTENT: ARTWORKS GALLERY */}
        {activeTab === 'artworks' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {artistArtworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onClick={() => setSelectedArtwork(artwork)}
                  role={auth?.role}
                />
              ))}
            </div>
          </div>
        )}

        {/* 5. TAB CONTENT: EDIT BIO & DETAILS */}
        {activeTab === 'about' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 font-display mb-1.5">
              Creator Profile Settings
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Update how collectors perceive your creative philosophy and find your external channels.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="bio-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                  Artist Biography
                </label>
                <textarea
                  id="bio-input"
                  rows={4}
                  className="form-input text-sm resize-none"
                  value={form.biography}
                  onChange={(e) => setForm({ ...form, biography: e.target.value })}
                  placeholder="Share your creative background, techniques, or inspirations..."
                />
              </div>

              <div>
                <label htmlFor="skills-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                  Artistic Focus & Skills (comma-separated)
                </label>
                <input
                  id="skills-input"
                  type="text"
                  className="form-input text-sm"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="3D Modeling, Blender, Generative Art, Octane"
                />
              </div>

              <div>
                <label htmlFor="portfolio-url-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                  External Website / Portfolio URL
                </label>
                <input
                  id="portfolio-url-input"
                  type="url"
                  className="form-input text-sm"
                  value={form.portfolioUrl}
                  onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div>
                <label htmlFor="website-url-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                  Studio Website
                </label>
                <input
                  id="website-url-input"
                  type="url"
                  className="form-input text-sm"
                  value={form.websiteUrl}
                  onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                  placeholder="https://studio.example.com"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('artworks')}
                  className="btn btn-secondary py-2.5 px-4 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary py-2.5 px-6 text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedArtwork && (
        <ArtworkDetailModal
          artwork={selectedArtwork}
          role={auth?.role}
          onClose={() => setSelectedArtwork(null)}
        />
      )}
    </div>
  );
}
