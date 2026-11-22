import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMarketplace, updateItem } from '../../store/slices/artworkSlice';
import * as artworkService from '../../services/artworkService';
import * as portfolioService from '../../services/portfolioService';
import { showToast } from '../../store/slices/uiSlice';
import ArtworkForm from '../artwork/ArtworkForm';
import { SEED_ARTWORKS } from '../../data/seedArtworks';
import {
  SparklesIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  HeartIcon,
} from '../common/Icons';

export default function ArtistDashboard() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { items = [] } = useSelector((state) => state.artwork);

  const [portfolio, setPortfolio] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState(null);
  const [, setDemoCatalogRevision] = useState(0);
  const demoArtistId = '101';
  const isDemoArtwork = (artwork) => String(artwork?.artistId) === demoArtistId;

  useEffect(() => {
    const isDemoArtist = String(auth?.token || '').startsWith('demo-jwt-')
      && String(auth?.accountid || auth?.accountId) === '101';
    if (!isDemoArtist) {
      dispatch(fetchMarketplace({}));
    }
    portfolioService
      .getMyPortfolio()
      .then((res) => setPortfolio(res.data))
      .catch(() => {});
  }, [auth?.accountid, auth?.accountId, auth?.token, dispatch]);

  // Filter artist's artworks (or show sample artist artworks if standalone)
  const artistIdStr = String(auth?.accountid || auth?.accountId || '');
  let artistArtworks = items.filter(
    (item) => String(item.artistId) === artistIdStr || String(item.artistEmail) === String(auth?.email)
  );
  if (artistArtworks.length === 0 && String(auth?.accountid || auth?.accountId) === '101') {
    const overrides = JSON.parse(localStorage.getItem('artify_demo_artist_overrides') || '{}');
    const deleted = new Set(JSON.parse(localStorage.getItem('artify_demo_artist_deleted') || '[]').map(String));
    artistArtworks = SEED_ARTWORKS
      .filter((item) => String(item.artistId) === demoArtistId && !deleted.has(String(item.id)))
      .map((item) => ({ ...item, ...(overrides[item.id] || {}) }));
  }

  const totalArtworks = artistArtworks.length;
  const publishedCount = artistArtworks.filter((a) => a.availabilityStatus === 'AVAILABLE').length;
  const soldCount = artistArtworks.filter((a) => a.availabilityStatus === 'SOLD').length;
  const totalVolume = portfolio?.totalSalesVolume
    ? Number(portfolio.totalSalesVolume)
    : artistArtworks.reduce((sum, a) => sum + Number(a.price || 0), 0);

  const handleDelete = async (artwork) => {
    if (!window.confirm(`Delete "${artwork.title}"? This cannot be undone.`)) return;
    if (isDemoArtwork(artwork)) {
      const deleted = new Set(JSON.parse(localStorage.getItem('artify_demo_artist_deleted') || '[]').map(String));
      deleted.add(String(artwork.id));
      localStorage.setItem('artify_demo_artist_deleted', JSON.stringify([...deleted]));
      dispatch(showToast('Artwork removed from your catalog'));
      setEditingArtwork(null);
      setDemoCatalogRevision((revision) => revision + 1);
      return;
    }
    try {
      await artworkService.deleteArtwork(artwork.id);
      dispatch(showToast('Artwork removed from catalog'));
      dispatch(fetchMarketplace({}));
    } catch (e) {
      dispatch(showToast(e?.response?.data?.message || 'Unable to delete artwork', 'error'));
    }
  };

  const handleStatusToggle = async (artwork) => {
    const nextStatus = artwork.availabilityStatus === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE';
    try {
      await artworkService.updateArtworkStatus(artwork.id, nextStatus);
      dispatch(updateItem({ ...artwork, availabilityStatus: nextStatus }));
      dispatch(showToast(`Status updated to ${nextStatus}`));
    } catch (e) {
      dispatch(showToast(e?.response?.data?.message || 'Unable to update artwork status', 'error'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80 pt-10 pb-8 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-2 font-display">
              <SparklesIcon className="w-4 h-4" />
              <span>Artist Studio & Workspace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              My Artworks & Studio
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1.5 max-w-xl">
              Manage your digital art catalog, monitor market views, and publish new collection pieces.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/portfolio"
              className="btn btn-secondary py-2.5 px-4 text-xs font-semibold"
            >
              View Public Portfolio
            </Link>
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary py-2.5 px-5 text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Upload New Artwork</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Artworks
            </span>
            <span className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              {totalArtworks}
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active Listings
            </span>
            <span className="text-3xl font-extrabold text-emerald-600 font-display tracking-tight">
              {publishedCount}
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Pieces Sold
            </span>
            <span className="text-3xl font-extrabold text-indigo-600 font-display tracking-tight">
              {soldCount}
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Catalog Value
            </span>
            <span className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              ${totalVolume.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Artwork Inventory Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Catalog Management
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {artistArtworks.length} items recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Artwork</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Performance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {artistArtworks.map((artwork) => {
                  const isAvailable = artwork.availabilityStatus === 'AVAILABLE';

                  return (
                    <tr key={artwork.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Thumbnail & Title */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={artwork.mediaUrl}
                            alt={artwork.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate max-w-xs font-display">
                              {artwork.title}
                            </span>
                            <span className="text-xs text-slate-400 block truncate">
                              ID #{artwork.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="badge badge-category text-[10px]">
                          {artwork.category || 'General'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-bold text-slate-900 font-display">
                        ${Number(artwork.price).toFixed(2)}
                      </td>

                      {/* Performance */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <EyeIcon className="w-3.5 h-3.5 text-slate-400" />
                            {artwork.viewCount ?? 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <HeartIcon className="w-3.5 h-3.5 text-rose-400" filled />
                            {artwork.likeCount ?? 0}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(artwork)}
                          className={`badge ${
                            isAvailable ? 'badge-available' : 'badge-sold'
                          } cursor-pointer hover:opacity-80 transition-opacity`}
                          title="Click to toggle status"
                        >
                          {isAvailable ? 'Available' : 'Sold'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingArtwork(artwork)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Listing"
                            aria-label="Edit"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(artwork)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Listing"
                            aria-label="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upload/Edit Modal */}
      {(showUploadModal || editingArtwork) && (
        <ArtworkForm
          artwork={editingArtwork}
          onClose={() => {
            setShowUploadModal(false);
            setEditingArtwork(null);
          }}
          onCreated={(savedArtwork) => {
            setShowUploadModal(false);
            setEditingArtwork(null);
            if (editingArtwork && isDemoArtwork(editingArtwork)) {
              const overrides = JSON.parse(localStorage.getItem('artify_demo_artist_overrides') || '{}');
              overrides[editingArtwork.id] = {
                ...savedArtwork,
                id: editingArtwork.id,
                artistId: editingArtwork.artistId,
                artistPortfolioId: editingArtwork.artistPortfolioId,
                artistName: editingArtwork.artistName,
                artistEmail: editingArtwork.artistEmail,
                artistAvatar: editingArtwork.artistAvatar,
                availabilityStatus: editingArtwork.availabilityStatus,
              };
              localStorage.setItem('artify_demo_artist_overrides', JSON.stringify(overrides));
              setDemoCatalogRevision((revision) => revision + 1);
              return;
            }
            dispatch(fetchMarketplace({}));
          }}
        />
      )}
    </div>
  );
}
