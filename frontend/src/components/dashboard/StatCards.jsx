import React from 'react';

export default function StatCards({ stats = [] }) {
  return (
    <div className="stat-cards">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card">
          <h4>{stat.label}</h4>
          <p>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
