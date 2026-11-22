import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const CONTENT = {
  '/privacy-policy': {
    title: 'Privacy Policy',
    intro: 'This temporary privacy policy explains how ArtifyHub handles information during this project demonstration.',
    points: [
      'Account details are used to provide sign-in, profile, marketplace, and collection features.',
      'Artwork, wishlist, and purchase data is used only to provide the corresponding application features.',
      'This demonstration does not sell personal information to third parties.',
    ],
  },
  '/terms-of-service': {
    title: 'Terms of Service',
    intro: 'These temporary terms describe the expected use of the ArtifyHub project demonstration.',
    points: [
      'Use the application only for lawful testing and evaluation.',
      'Artwork listings and account information should be accurate and respectful.',
      'Purchases and moderation actions in this demonstration are not real-world commercial transactions.',
    ],
  },
};

export default function LegalPage() {
  const location = useLocation();
  const content = CONTENT[location.pathname] || CONTENT['/privacy-policy'];

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">ArtifyHub guidelines</p>
        <h1 className="mt-3 text-4xl font-bold font-display text-slate-900">{content.title}</h1>
        <p className="mt-5 text-slate-600 leading-relaxed">{content.intro}</p>
        <div className="mt-8 space-y-4">
          {content.points.map((point) => (
            <p key={point} className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-slate-700 leading-relaxed">
              {point}
            </p>
          ))}
        </div>
        <Link to="/" className="inline-flex mt-8 btn btn-primary">Return to home</Link>
      </div>
    </main>
  );
}
