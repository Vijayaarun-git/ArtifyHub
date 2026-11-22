import React from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon, ShieldCheckIcon } from '../common/Icons';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white text-slate-600 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5 text-slate-900 font-bold text-xl font-display mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                <SparklesIcon className="w-4 h-4" />
              </span>
              <span>
                Artify<span className="text-indigo-600">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              A curated digital art marketplace connecting visionary creators with passionate collectors worldwide.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60 w-fit">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Authenticity & Provenance</span>
            </div>
          </div>

          {/* Marketplace Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-display">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/marketplace" className="hover:text-indigo-600 transition-colors">
                  Explore All Art
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=3D+Surrealism" className="hover:text-indigo-600 transition-colors">
                  3D Surrealism
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=Generative" className="hover:text-indigo-600 transition-colors">
                  Generative Art
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=Cyberpunk" className="hover:text-indigo-600 transition-colors">
                  Cyberpunk & Sci-Fi
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=Minimalist" className="hover:text-indigo-600 transition-colors">
                  Minimalist Concepts
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Creators */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-display">
              For Creators & Collectors
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/portfolio" className="hover:text-indigo-600 transition-colors">
                  Artist Portfolios
                </Link>
              </li>
              <li>
                <Link to="/my-vault" className="hover:text-indigo-600 transition-colors">
                  Collector Vault
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-indigo-600 transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-600 transition-colors">
                  Creator Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-display">
              Platform Standards
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              All digital listings undergo curator verification. Transactions ensure race-condition safe checkout with immediate immutable ownership recording.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-900 block mb-1">
                Zero Gas Fees • Instant Settlement
              </span>
              <span className="text-[11px] text-slate-500 block">
                Pure high-resolution digital art without blockchain friction.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} ArtifyHub Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-slate-600">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-slate-600">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
