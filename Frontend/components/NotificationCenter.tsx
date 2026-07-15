import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Clock, AlertCircle, Sparkles, MessageSquare } from 'lucide-react';
import { Notification } from '../types';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div id="notification-center-container" className="relative">
      <button
        id="notification-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            id="notification-badge"
            className="absolute top-1 right-1 w-4.5 h-4.5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white animate-pulse"
          >
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop click closer */}
            <div
              id="notification-backdrop"
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Dropdown Panel */}
            <motion.div
              id="notification-panel"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200/80 shadow-xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    id="mark-all-read-btn"
                    onClick={() => {
                      onMarkAllRead();
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div id="notification-list" className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-medium">You are all caught up!</p>
                    <p className="text-[10px] text-slate-400 mt-1">Updates on tasks & chat will appear here.</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const id = n._id || n.id;
                    const isChat = n.text.toLowerCase().includes('chat') || n.text.toLowerCase().includes('message');
                    const isTask = n.text.toLowerCase().includes('task');

                    return (
                      <div
                        id={`notification-item-${id}`}
                        key={id}
                        className={`p-3.5 flex gap-3 transition-colors ${
                          n.read ? 'bg-white' : 'bg-indigo-50/20 hover:bg-indigo-50/45'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {isChat ? (
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                              <MessageSquare className="w-3.5 h-3.5" />
                            </div>
                          ) : isTask ? (
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                              <AlertCircle className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <p className="text-xs text-slate-700 leading-normal">{n.text}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                            {!n.read && (
                              <button
                                id={`mark-read-btn-${id}`}
                                onClick={() => onMarkRead(id)}
                                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                Clear
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
