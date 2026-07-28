"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  }

  async function markAsRead(id: number) {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-sm">Notifikasi</h3>
            <button onClick={() => setIsOpen(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">Tidak ada notifikasi</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-4 border-b border-gray-50 ${n.is_read ? 'opacity-60' : ''}`}>
                  <h4 className="text-sm font-semibold text-gray-900">{n.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{n.content}</p>
                  {!n.is_read && (
                    <button 
                        onClick={() => markAsRead(n.id)}
                        className="text-[10px] text-primary font-bold mt-2"
                    >
                        Tandai sudah dibaca
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
