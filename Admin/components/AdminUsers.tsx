import React, { useState } from 'react';
import { Search, UserMinus, ShieldAlert, BadgeInfo } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'developer' | 'client' | 'admin';
  createdAt?: string;
}

interface AdminUsersProps {
  users: UserItem[];
  currentUserEmail: string;
  onDeleteUser: (id: string) => Promise<boolean>;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ users, currentUserEmail, onDeleteUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDeleteClick = async (user: UserItem) => {
    if (user.email === currentUserEmail) {
      alert('You cannot delete your own administrative account!');
      return;
    }

    if (confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.email})? This action cannot be undone.`)) {
      setDeletingId(user.id);
      await onDeleteUser(user.id);
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">User Account Management</h3>
          <p className="text-xs text-gray-500 mt-1">
            Search, moderate, and manage all client, developer, and administrator accounts.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 w-52"
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="developer">Developers</option>
            <option value="client">Clients</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase bg-gray-50/50">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-sm text-gray-400 font-medium">
                  No accounts found matching your filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30 text-xs">
                  <td className="py-4 px-4 font-bold text-gray-900">{u.name}</td>
                  <td className="py-4 px-4 font-semibold text-gray-500">{u.email}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        u.role === 'admin'
                          ? 'bg-rose-50 border-rose-100 text-rose-600'
                          : u.role === 'developer'
                          ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                          : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      disabled={deletingId === u.id}
                      onClick={() => handleDeleteClick(u)}
                      className={`p-2 rounded-lg border text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-colors ${
                        u.email === currentUserEmail
                          ? 'opacity-30 cursor-not-allowed border-transparent'
                          : 'border-gray-100'
                      }`}
                      title={u.email === currentUserEmail ? 'Cannot delete yourself' : 'Delete user account'}
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
