import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as notificationService from '../services/notificationService';

export default function NotificationStack() {
  const token = useSelector((state) => state.auth.token);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      return undefined;
    }
    let active = true;
    notificationService.getNotifications()
      .then(({ data }) => active && setNotifications(data || []))
      .catch(() => {});
    return () => { active = false; };
  }, [token]);

  async function markRead(notification) {
    if (notification.isRead) return;
    try {
      await notificationService.markNotificationRead(notification.id);
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, isRead: true } : item
      )));
    } catch (_) {
      // Notifications are non-critical and can be retried on the next refresh.
    }
  }

  if (!token || notifications.length === 0) return null;
  return (
    <aside className="notification-stack" aria-label="Notifications">
      {notifications.slice(0, 5).map((notification) => (
        <button
          type="button"
          className={`notification ${notification.isRead ? 'read' : 'unread'}`}
          key={notification.id}
          onClick={() => markRead(notification)}
        >
          <strong>{notification.type?.replaceAll('_', ' ')}</strong>
          <span>{notification.message}</span>
        </button>
      ))}
    </aside>
  );
}
