import React, { useState } from 'react';
import { Megaphone, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminNotificationsProps {
  onBroadcast: (text: string) => Promise<boolean>;
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({ onBroadcast }) => {
  const [broadcastText, setBroadcastText] = useState('');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!broadcastText.trim()) {
      setErrorMsg('Announcement message is required');
      return;
    }

    setSending(true);
    const success = await onBroadcast(broadcastText.trim());
    setSending(false);

    if (success) {
      setSuccessMsg('Announcement successfully broadcasted to all platform accounts.');
      setBroadcastText('');
    } else {
      setErrorMsg('Failed to broadcast announcement. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm max-w-2xl">
      <div className="flex items-start gap-4 mb-6 border-b border-gray-50 pb-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
          <Megaphone className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Broadcast Sitewide Announcements</h3>
          <p className="text-xs text-gray-500 mt-1">
            Dispatch real-time platform system updates, server alerts, or announcement bulletins directly to all registered developer and client notification centers.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="announcement-msg" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Announcement Message
          </label>
          <textarea
            id="announcement-msg"
            rows={4}
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            placeholder="Type platform announcement here... E.g., 'Maintenance Notice: DevFlw will undergo scheduled database upgrades tonight at 02:00 UTC.'"
            className="w-full border border-gray-200 rounded-lg p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50"
            required
          />
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-lg text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-xs font-semibold">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={sending || !broadcastText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {sending ? 'Broadcasting...' : 'Broadcast Announce'}
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
