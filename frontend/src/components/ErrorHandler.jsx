import React from 'react';

export default function ErrorHandler({ error }) {
  if (!error) return null;
  return <div className="error-message">{error}</div>;
}
