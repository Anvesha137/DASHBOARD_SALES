
import React, { useState, useMemo } from 'react';
import { User, PackageName } from '../types';
import { PACKAGES } from '../constants';

interface UserTableProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'promoCodeUsed' | 'automationsUsed' | 'createdAt' | 'timeSpentMinutes' | 'referralCount'>) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onAddUser }) => {
  const [search, setSearch] = useState('');
  const [packageFilter, setPackageFilter] = useState<string>('All');
  const [affiliateFilter, setAffiliateFilter] = useState<string>('All');
  const [followerFilter, setFollowerFilter] = useState<string>('All');
  const [promoFilter, setPromoFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<keyof User>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    packageName: 'Free', // Default string
    followerCount: 0,
    followersAtJoin: 0,
    emailIntegrated: false,
    isAffiliate: false
  });

  const itemsPerPage = 10;

  // Derive unique promo codes for filter
  const uniquePromos = useMemo(() => {
    const promos = users.map(u => u.promoCodeUsed).filter(Boolean) as string[];
    return Array.from(new Set(promos));
  }, [users]);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesPackage = packageFilter === 'All' || user.packageName === packageFilter;
      const matchesAffiliate = affiliateFilter === 'All' ||
        (affiliateFilter === 'Yes' ? user.isAffiliate : !user.isAffiliate);
      const matchesPromo = promoFilter === 'All' || user.promoCodeUsed === promoFilter;

      let matchesFollowers = true;
      if (followerFilter === '< 5k') matchesFollowers = user.followerCount < 5000;
      else if (followerFilter === '5k - 100k') matchesFollowers = user.followerCount >= 5000 && user.followerCount < 100000;
      else if (followerFilter === '100k+') matchesFollowers = user.followerCount >= 100000;

      return matchesSearch && matchesPackage && matchesAffiliate && matchesPromo && matchesFollowers;
    }).sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (valA! < valB!) return sortOrder === 'asc' ? -1 : 1;
      if (valA! > valB!) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, search, packageFilter, affiliateFilter, promoFilter, followerFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: keyof User) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser(newUser);
    setShowAddForm(false);
    setNewUser({
      username: '',
      email: '',
      packageName: PackageName.FREE,
      followerCount: 0,
      followersAtJoin: 0,
      emailIntegrated: false,
      isAffiliate: false
    });
  };

  const exportToCSV = () => {
    const headers = ["Username", "Email", "Package", "Followers (Join)", "Followers (Now)", "Promo", "Automations", "Email Integrated", "Affiliate", "Referrals", "Created At"];
    const rows = filteredUsers.map(u => [
      u.username,
      u.email,
      u.packageName,
      u.followersAtJoin,
      u.followerCount,
      u.promoCodeUsed || 'N/A',
      u.automationsUsed,
      u.emailIntegrated ? 'Yes' : 'No',
      u.isAffiliate ? 'Yes' : 'No',
      u.referralCount,
      u.createdAt
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="relative col-span-1 md:col-span-1">
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Search Users</label>
          <input
            type="text"
            placeholder="Name or email..."
            className="w-full pl-3 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Package</label>
          <select
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={packageFilter}
            onChange={(e) => setPackageFilter(e.target.value)}
          >
            <option>All</option>
            {PACKAGES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Affiliate Status</label>
          <select
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={affiliateFilter}
            onChange={(e) => setAffiliateFilter(e.target.value)}
          >
            <option>All</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Follower Range</label>
          <select
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={followerFilter}
            onChange={(e) => setFollowerFilter(e.target.value)}
          >
            <option>All</option>
            <option value="< 5k">Less than 5k</option>
            <option value="5k - 100k">5k to 100k</option>
            <option value="100k+">Greater than 100k</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Promo Used</label>
          <select
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={promoFilter}
            onChange={(e) => setPromoFilter(e.target.value)}
          >
            <option>All</option>
            {uniquePromos.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">Showing <span className="font-bold text-slate-800">{filteredUsers.length}</span> total users</p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${showAddForm ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {showAddForm ? (
              <>Cancel</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Create User
              </>
            )}
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="text-sm font-bold text-slate-800 uppercase mb-4">Create New Internal User</h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Username</label>
              <input
                required
                type="text"
                placeholder="johndoe"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={newUser.username}
                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email Address</label>
              <input
                required
                type="email"
                placeholder="john@example.com"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Package Level</label>
              <select
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={newUser.packageName}
                onChange={e => setNewUser({ ...newUser, packageName: e.target.value as PackageName })}
              >
                {Object.values(PackageName).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Initial Followers</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={newUser.followersAtJoin}
                onChange={e => setNewUser({ ...newUser, followersAtJoin: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Current Followers</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={newUser.followerCount}
                onChange={e => setNewUser({ ...newUser, followerCount: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  checked={newUser.emailIntegrated}
                  onChange={e => setNewUser({ ...newUser, emailIntegrated: e.target.checked })}
                />
                <span className="text-sm font-medium text-slate-700">Email Integrated</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  checked={newUser.isAffiliate}
                  onChange={e => setNewUser({ ...newUser, isAffiliate: e.target.checked })}
                />
                <span className="text-sm font-medium text-slate-700">Affiliate User</span>
              </label>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md"
              >
                Confirm User Creation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('username')}>Username</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('packageName')}>Package</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('followersAtJoin')}>Followers (Join)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('followerCount')}>Followers (Now)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('automationsUsed')}>Automations</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('referralCount')}>Referrals</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('isAffiliate')}>Affiliate</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('createdAt')}>Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                        {user.username ? user.username[0].toUpperCase() : 'U'}
                      </div>
                      <span className="font-medium text-slate-900 text-xs">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${user.packageName === PackageName.ENTERPRISE ? 'bg-purple-100 text-purple-700' :
                      user.packageName === PackageName.PRO ? 'bg-blue-100 text-blue-700' :
                        user.packageName === PackageName.STARTER ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                      }`}>
                      {user.packageName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-right text-slate-500 font-mono">{user.followersAtJoin?.toLocaleString() || '-'}</td>
                  <td className="px-6 py-4 text-xs text-right text-slate-900 font-mono font-bold">{user.followerCount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs text-right text-slate-600 font-mono">{user.automationsUsed.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold">
                      {user.referralCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.isAffiliate ? (
                      <span className="text-green-500">
                        <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page <span className="font-bold text-slate-800">{currentPage}</span> of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
