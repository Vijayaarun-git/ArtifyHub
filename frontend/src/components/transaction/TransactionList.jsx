import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import * as transactionService from '../../services/transactionService';
import {
  WalletIcon,
  ShieldCheckIcon,
  CloseIcon,
} from '../common/Icons';
import { SEED_ARTWORKS } from '../../data/seedArtworks';

export default function TransactionList() {
  const accountId = useSelector((state) => state.auth?.accountid || state.auth?.accountId);
  const auth = useSelector((state) => state.auth);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inspectingTx, setInspectingTx] = useState(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    const purchasedIds = JSON.parse(localStorage.getItem('artify_demo_purchases') || '[]')
      .map(Number);
    const demoItems = SEED_ARTWORKS
      .filter((artwork) => purchasedIds.includes(Number(artwork.id)))
      .map((artwork) => ({
        id: `demo-${artwork.id}`,
        artworkId: artwork.id,
        artworkTitle: artwork.title,
        artworkMediaUrl: artwork.mediaUrl,
        transactionAmount: artwork.price,
        status: 'COMPLETED',
        purchaseDate: new Date().toISOString(),
      }));
    try {
      const response = accountId
        ? await transactionService.getMyTransactions()
        : { data: [] };
      setItems([...(response.data || []), ...demoItems]);
    } catch (err) {
      setItems(demoItems);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const totalCollected = items.length;
  const totalValuation = items.reduce(
    (sum, tx) => sum + Number(tx.transactionAmount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Vault Header */}
      <div className="bg-white border-b border-slate-200/80 pt-10 pb-8 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-2 font-display">
              <WalletIcon className="w-4 h-4" />
              <span>Personal Collection & Provenance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              My Digital Art Vault
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1.5 max-w-xl">
              Your authenticated collection of original digital art, recorded with permanent ownership certificates.
            </p>
          </div>

          <Link
            to="/marketplace"
            className="btn btn-primary py-2.5 px-5 text-xs font-semibold shadow-md shadow-indigo-600/20"
          >
            Explore More Artworks
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Vault Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Collected Artworks
            </span>
            <span className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              {totalCollected}
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Vault Valuation
            </span>
            <span className="text-3xl font-extrabold text-indigo-600 font-display tracking-tight">
              ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Security Guarantee
            </span>
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold mt-1">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>100% Provenance Verified</span>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-slate-400 font-medium">Opening your vault...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 shadow-sm text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-5">
              <WalletIcon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-display mb-2">
              Your Vault is Empty
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-8">
              You haven't acquired any digital art pieces yet. Browse our curated marketplace and start building your private collection.
            </p>
            <Link to="/marketplace" className="btn btn-primary py-3 px-7 text-sm font-bold shadow-md shadow-indigo-600/25">
              Explore Available Artworks →
            </Link>
          </div>
        )}

        {/* Collection Grid */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((tx) => (
              <div
                key={tx.id}
                className="art-card group bg-white border border-slate-200 shadow-sm flex flex-col"
              >
                <div className="aspect-[4/3] bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  {tx.artworkMediaUrl ? (
                    <img
                      src={tx.artworkMediaUrl}
                      alt={tx.artworkTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-slate-500 text-xs">Digital Masterpiece</div>
                  )}
                  <span className="absolute top-3 left-3 badge badge-available backdrop-blur-md bg-white/90">
                    Owned & Verified
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display truncate mb-1">
                      {tx.artworkTitle || `Artwork #${tx.artworkId}`}
                    </h3>
                    <span className="text-xs text-slate-400 block mb-4">
                      Acquired on {new Date(tx.purchaseDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Acquired Price</span>
                      <span className="text-lg font-bold text-slate-900 font-display">
                        ${Number(tx.transactionAmount).toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setInspectingTx(tx)}
                      className="btn btn-secondary text-xs py-1.5 px-3 border-slate-200"
                    >
                      Certificate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {inspectingTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
          onClick={() => setInspectingTx(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setInspectingTx(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700"
            >
              <CloseIcon className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Certificate of Authenticity
              </h3>
              <p className="text-xs text-slate-400 mt-1">ArtifyHub Provenance Registry</p>
            </div>

            <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Artwork:</span>
                <span className="font-bold text-slate-800">{inspectingTx.artworkTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Collector:</span>
                <span className="font-bold text-slate-800">{auth?.username || 'Verified Collector'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Acquisition Amount:</span>
                <span className="font-bold text-slate-800">${Number(inspectingTx.transactionAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono text-indigo-600 font-bold">#TX-{inspectingTx.id || 98234}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-600 font-bold uppercase">Immutable Settled</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setInspectingTx(null)}
                className="btn btn-secondary w-full py-2.5 text-xs font-semibold"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
