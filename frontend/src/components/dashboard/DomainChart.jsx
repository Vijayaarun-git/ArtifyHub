import React from 'react';

export default function DomainChart({ data = [] }) {
  return (
    <div className="domain-chart">
      {data.map((entry) => (
        <div key={entry.label} className="domain-chart-bar">
          <span>{entry.label}</span>
          <div className="bar" style={{ width: `${entry.value}%` }} />
        </div>
      ))}
    </div>
  );
}
