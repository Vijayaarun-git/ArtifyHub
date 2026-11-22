import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { SEED_ARTWORKS } from '../../data/seedArtworks';
import * as artworkService from '../../services/artworkService';
import * as curatorService from '../../services/curatorService';
import { showToast } from '../../store/slices/uiSlice';
import { useDispatch } from 'react-redux';

export default function CuratorDashboard() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const isDemo = String(auth?.token || '').startsWith('demo-jwt-');
  const [artworks, setArtworks] = useState(isDemo ? SEED_ARTWORKS : []);
  const [transactions, setTransactions] = useState([]);

  function applyDemoSales(items) {
    const purchasedIds = new Set(
      JSON.parse(localStorage.getItem('artify_demo_purchases') || '[]').map(Number)
    );
    const hiddenIds = new Set(
      JSON.parse(localStorage.getItem('artify_demo_hidden') || '[]').map(Number)
    );
    return items.map((item) => {
      if (purchasedIds.has(Number(item.id))) {
        return { ...item, availabilityStatus: 'SOLD' };
      }
      if (hiddenIds.has(Number(item.id))) {
        return { ...item, availabilityStatus: 'HIDDEN' };
      }
      return item;
    });
  }

  useEffect(() => {
    const loadArtworks = isDemo
      ? artworkService.fetchMarketplace({})
      : curatorService.getModerationListings();
    loadArtworks
      .then(({ data }) => {
        if (Array.isArray(data) && data.length) {
          setArtworks(applyDemoSales(data));
        } else if (!isDemo) {
          setArtworks(applyDemoSales(SEED_ARTWORKS));
        }
      })
      .catch((error) => {
        if (!isDemo) {
          setArtworks(applyDemoSales(SEED_ARTWORKS));
        } else {
          setArtworks([]);
          dispatch(showToast(error?.response?.data?.message || 'Unable to load artwork moderation data', 'error'));
        }
      });
    if (!isDemo) {
      curatorService.getPlatformTransactions()
        .then(({ data }) => setTransactions(Array.isArray(data) ? data : []))
        .catch((error) => {
          setTransactions([]);
          dispatch(showToast(
            error?.response?.data?.message || 'Unable to load platform transactions',
            'error'
          ));
        });
    }
  }, [auth?.token, isDemo, dispatch]);

  useEffect(() => {
    setArtworks((items) => applyDemoSales(items));
  }, []);

  const handleStatus = async (artwork) => {
    const nextStatus = artwork.availabilityStatus === 'HIDDEN' ? 'AVAILABLE' : 'HIDDEN';
    const isSeedArtwork = SEED_ARTWORKS.some((item) => Number(item.id) === Number(artwork.id));
    if (isDemo || isSeedArtwork) {
      const hiddenIds = new Set(
        JSON.parse(localStorage.getItem('artify_demo_hidden') || '[]').map(Number)
      );
      if (nextStatus === 'HIDDEN') hiddenIds.add(Number(artwork.id));
      else hiddenIds.delete(Number(artwork.id));
      localStorage.setItem('artify_demo_hidden', JSON.stringify([...hiddenIds]));
      setArtworks((items) => items.map((item) => (
        item.id === artwork.id ? { ...item, availabilityStatus: nextStatus } : item
      )));
      return;
    }
    try {
      const { data } = await curatorService.updateArtworkStatus(artwork.id, nextStatus);
      setArtworks((items) => items.map((item) => item.id === artwork.id ? data : item));
      dispatch(showToast(`Artwork ${nextStatus.toLowerCase()}`));
    } catch (error) {
      dispatch(showToast(error?.response?.data?.message || 'Unable to update artwork', 'error'));
    }
  };

  const handlePlatformReset = async () => {
    if (!window.confirm('Reset the website? This will make all artworks available and permanently clear all transaction and Vault history.')) {
      return;
    }
    try {
      if (!isDemo) {
        await curatorService.resetPlatform();
      }
      [
        'artify_demo_purchases',
        'artify_demo_hidden',
        'artify_demo_artist_sales',
      ].forEach((key) => localStorage.removeItem(key));
      setTransactions([]);
      if (isDemo) {
        setArtworks((items) => items.map((item) => ({ ...item, availabilityStatus: 'AVAILABLE' })));
      } else {
        const { data } = await curatorService.getModerationListings();
        setArtworks(Array.isArray(data) && data.length ? data : SEED_ARTWORKS);
      }
      dispatch(showToast('Website reset: all artworks are available again'));
    } catch (error) {
      dispatch(showToast(error?.response?.data?.message || 'Unable to reset the website', 'error'));
    }
  };

  const demoTransactions = JSON.parse(localStorage.getItem('artify_demo_purchases') || '[]')
      .map(Number)
      .map((id) => SEED_ARTWORKS.find((artwork) => Number(artwork.id) === id))
      .filter(Boolean)
      .map((artwork) => ({
        id: `demo-${artwork.id}`,
        artworkId: artwork.id,
        artworkTitle: artwork.title,
        artworkMediaUrl: artwork.mediaUrl,
        transactionAmount: artwork.price,
        status: 'COMPLETED',
        purchaseDate: null,
      }))
    ;
  const displayedTransactions = [...demoTransactions, ...transactions];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <header className="bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Platform administration</p>
          <h1 className="text-4xl font-extrabold font-display mt-2 text-white" style={{ color: '#ffffff' }}>Curator Control Center</h1>
          <p className="text-slate-300 mt-2">Review listings, moderate visibility, and monitor platform sales.</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5"><span className="text-xs text-slate-500">Listings</span><strong className="block text-3xl mt-1">{artworks.length}</strong></div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5"><span className="text-xs text-slate-500">Available</span><strong className="block text-3xl mt-1 text-emerald-600">{artworks.filter((item) => item.availabilityStatus === 'AVAILABLE').length}</strong></div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5"><span className="text-xs text-slate-500">Transactions</span><strong className="block text-3xl mt-1 text-indigo-600">{displayedTransactions.length}</strong></div>
        </div>
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100"><h2 className="text-xl font-bold font-display">Artwork moderation</h2></div>
          <div className="divide-y divide-slate-100">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="p-4 sm:p-5 flex items-center gap-4">
                <img src={artwork.mediaUrl} alt={artwork.title} className="w-16 h-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1"><h3 className="font-bold truncate">{artwork.title}</h3><p className="text-sm text-slate-500">{artwork.artistName} · ${Number(artwork.price || 0).toFixed(2)}</p></div>
                <span className={`badge ${artwork.availabilityStatus === 'AVAILABLE' ? 'badge-available' : 'badge-sold'}`}>{artwork.availabilityStatus}</span>
                {artwork.availabilityStatus !== 'SOLD' ? (
                  <button type="button" onClick={() => handleStatus(artwork)} className="btn btn-secondary text-xs">
                    {artwork.availabilityStatus === 'HIDDEN' ? 'Publish' : 'Hide'}
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">Sold</span>
                )}
              </div>
            ))}
          </div>
        </section>
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold font-display">Platform transactions</h2>
          </div>
          {displayedTransactions.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No completed transactions yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {displayedTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 sm:p-5 flex items-center gap-4">
                  <img
                    src={transaction.artworkMediaUrl}
                    alt={transaction.artworkTitle}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">{transaction.artworkTitle}</p>
                    <p className="text-xs text-slate-500">
                      {transaction.purchaseDate
                        ? new Date(transaction.purchaseDate).toLocaleDateString()
                        : 'Demo purchase'}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">
                    ${Number(transaction.transactionAmount || 0).toFixed(2)}
                  </span>
                  <span className="text-xs font-bold uppercase text-emerald-600">{transaction.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="bg-white rounded-2xl border border-rose-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Reset marketplace</h2>
            <p className="text-sm text-slate-500 mt-1">
              Make every artwork available and clear all purchase and Vault history.
            </p>
          </div>
          <button type="button" onClick={handlePlatformReset} className="btn bg-rose-600 text-white hover:bg-rose-700">
            Reset Website
          </button>
        </section>
      </main>
    </div>
  );
}
