'use client';

interface NotificationBadgeProps {
  count: number;
  show: boolean;
}

export default function NotificationBadge({ count, show }: NotificationBadgeProps) {
  if (!show || count === 0) {
    return null;
  }

  const displayCount = count > 9 ? '9+' : count.toString();

  return (
    <div
      className="notification-badge"
      aria-label={`${count} unread notification${count !== 1 ? 's' : ''}`}
      role="status"
    >
      {displayCount}
    </div>
  );
}
