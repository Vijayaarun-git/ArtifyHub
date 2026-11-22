import api from './api';

export function getNotifications() {
  return api.get('/notifications');
}

export function markNotificationRead(id) {
  return api.patch(`/notifications/${id}/read`);
}

export function markAllNotificationsRead() {
  return api.post('/notifications/read-all');
}
