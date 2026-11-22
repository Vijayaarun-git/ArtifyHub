import React from 'react';

export default function RecentActivity({ activities = [] }) {
  return (
    <div className="recent-activity">
      <h3>Recent Activity</h3>
      <ul>
        {activities.map((activity, idx) => (
          <li key={idx}>{activity}</li>
        ))}
      </ul>
    </div>
  );
}
