
import React, { useState } from 'react';
import { PromoCode, DiscountType } from '../types';

interface PromoCodeManagerProps {
  promoCodes: PromoCode[];
  onAddPromoCode: (promo: Omit<PromoCode, 'id' | 'usageCount'>) => void;
}

const PromoCodeManager: React.FC<PromoCodeManagerProps> = ({ promoCodes, onAddPromoCode }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: DiscountType.PERCENTAGE,
    value: 0,
    expiryDate: '',
    assignedUserId: '',
    maxUses: 1,
    approvedBy: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPromoCode({
      ...formData,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin', // Hardcoded for now as per plan
    });
    setShowForm(false);
    setFormData({
      code: '',
      discountType: DiscountType.PERCENTAGE,
      value: 0,
      expiryDate: '',
      assignedUserId: '',
      maxUses: 1,
      approvedBy: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Admin Promo Codes</h3>
          <p className="text-xs text-slate-500">Manage and audit promotional codes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm text-xs"
        >
          {showForm ? 'Cancel' : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Create New Code
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Promo Code</label>
              <input
                required
                type="text"
                placeholder="e.g. SUMMER24"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-xs"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Discount Type</label>
              <select
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-xs"
                value={formData.discountType}
                onChange={e => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
              >
                <option value={DiscountType.PERCENTAGE}>Percentage (%)</option>
                <option value={DiscountType.FLAT}>Flat Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Value</label>
              <input
                required
                type="number"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-xs"
                value={formData.value}
                onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Expiry Date</label>
              <input
                required
                type="date"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-xs"
                value={formData.expiryDate}
                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Max Uses</label>
              <input
                required
                type="number"
                placeholder="1 for single use"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-xs"
                value={formData.maxUses}
                onChange={e => setFormData({ ...formData, maxUses: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Approved By</label>
              <input
                required
                type="text"
                placeholder="Approver Name"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-xs"
                value={formData.approvedBy}
                onChange={e => setFormData({ ...formData, approvedBy: e.target.value })}
              />
            </div>
            <div className="lg:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assign to User (Optional)</label>
              <input
                type="text"
                placeholder="User ID or Email"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-xs"
                value={formData.assignedUserId}
                onChange={e => setFormData({ ...formData, assignedUserId: e.target.value })}
              />
            </div>
            <div className="flex items-end lg:col-span-4">
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-md text-xs"
              >
                Save Promo Code
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table View */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Promo Code</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Usage / Max</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {promoCodes.map(pc => {
                const isExpired = new Date(pc.expiryDate) < new Date();
                const isExhausted = pc.usageCount >= pc.maxUses;
                const isActive = !isExpired && !isExhausted;

                return (
                  <tr key={pc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 font-mono text-sm">{pc.code}</div>
                      <div className="text-[10px] text-slate-400">ID: {pc.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 font-bold text-xs ${pc.discountType === DiscountType.PERCENTAGE ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {pc.discountType === DiscountType.PERCENTAGE ? (
                          <>{pc.value}% OFF</>
                        ) : (
                          <>${pc.value} FLAT</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs font-mono font-medium text-slate-700">
                        {pc.usageCount} / {pc.maxUses}
                      </div>
                      <div className="text-[8px] text-slate-400 uppercase tracking-wider mt-0.5">
                        {pc.maxUses === 1 ? 'One-Time' : 'Multi-Use'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {isActive ? 'Active' : isExpired ? 'Expired' : 'Limit Reached'}
                      </span>
                      {isActive && <div className="text-[8px] text-slate-500 mt-1">Exp: {pc.expiryDate}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {pc.assignedUserId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[8px] font-bold">U</div>
                          <span className="text-xs text-slate-700 font-medium truncate max-w-[120px]">{pc.assignedUserId}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Global</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-700 font-medium">{new Date(pc.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">by {pc.createdBy}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-xs text-slate-700">{pc.approvedBy}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PromoCodeManager;
