
import React, { useState } from 'react';
import { api } from '../services/api';

interface Expense {
    id: string;
    type: string;
    merchant: string;
    expense_date: string;
    amount: string;
    description: string;
    status: 'awaiting_approval' | 'approved' | 'reimbursed';
    product_link?: string;
    invoice_url?: string;
    expiry_date?: string;
    raised_by_name?: string;
    approved_by_name?: string;
}

interface ExpensesTableProps {
    expenses: Expense[];
    onRefresh: () => void;
}

const ExpensesTable: React.FC<ExpensesTableProps> = ({ expenses, onRefresh }) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        merchant: '',
        type: 'tools',
        amount: 0,
        expense_date: new Date().toISOString().split('T')[0],
        description: '',
        product_link: '',
        invoice_url: '',
        expiry_date: ''
    });

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await api.put(`/expenses/${id}/status`, { status: newStatus });
            onRefresh();
        } catch (err) {
            alert('Failed to update status. Are you Admin?');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/expenses', formData);
            onRefresh();
            setShowForm(false);
            setFormData({
                merchant: '',
                type: 'tools',
                amount: 0,
                expense_date: new Date().toISOString().split('T')[0],
                description: '',
                product_link: '',
                invoice_url: '',
                expiry_date: ''
            });
        } catch (err) {
            alert('Failed to create expense');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-700 text-lg">Expense Manager</h3>
                    <p className="text-xs text-slate-500">Track and approve team expenses</p>
                </div>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 flex items-center gap-2"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Submit Expense
                        </>
                    )}
                </button>
            </div>

            {/* Add Expense Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-lg animate-in fade-in slide-in-from-top-4">
                    <h4 className="text-sm font-bold text-slate-800 uppercase mb-4">New Expense Request</h4>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Merchant / Vendor</label>
                            <input required type="text" placeholder="e.g. AWS, Github" className="w-full px-4 py-2 border rounded-lg text-sm"
                                value={formData.merchant} onChange={e => setFormData({ ...formData, merchant: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Amount ($)</label>
                            <input required type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg text-sm"
                                value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Category</label>
                            <select className="w-full px-4 py-2 border rounded-lg text-sm"
                                value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option value="tools">Software / Tools</option>
                                <option value="marketing">Marketing</option>
                                <option value="travel">Travel</option>
                                <option value="misc">Miscellaneous</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Date Incurred</label>
                            <input required type="date" className="w-full px-4 py-2 border rounded-lg text-sm"
                                value={formData.expense_date} onChange={e => setFormData({ ...formData, expense_date: e.target.value })} />
                        </div>

                        {/* Row 2 */}
                        <div className="lg:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Description / Items Bought</label>
                            <input type="text" placeholder="Detail what was purchased..." className="w-full px-4 py-2 border rounded-lg text-sm"
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Product Link (Optional)</label>
                            <input type="url" placeholder="https://..." className="w-full px-4 py-2 border rounded-lg text-sm"
                                value={formData.product_link} onChange={e => setFormData({ ...formData, product_link: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Invoice URL (Optional)</label>
                            <input type="url" placeholder="https://drive..." className="w-full px-4 py-2 border rounded-lg text-sm"
                                value={formData.invoice_url} onChange={e => setFormData({ ...formData, invoice_url: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Expiry Date (If Subscription)</label>
                            <input type="date" className="w-full px-4 py-2 border rounded-lg text-sm"
                                value={formData.expiry_date} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} />
                        </div>

                        <div className="lg:col-span-4 flex justify-end">
                            <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Expense Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">People</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {expenses.map(ex => (
                                <tr key={ex.id} className="hover:bg-slate-50/80 align-top">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{ex.merchant}</div>
                                        <div className="text-xs text-slate-500 mt-1">{ex.description}</div>
                                        <div className="flex gap-2 mt-2">
                                            {ex.product_link && (
                                                <a href={ex.product_link} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 hover:bg-blue-100 flex items-center gap-1">
                                                    Link <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </a>
                                            )}
                                            {ex.invoice_url && (
                                                <a href={ex.invoice_url} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-200 flex items-center gap-1">
                                                    Invoice <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs capitalize">{ex.type}</span>
                                        {ex.expiry_date && (
                                            <div className="text-[10px] text-red-500 mt-1 font-medium">
                                                Exp: {new Date(ex.expiry_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                                        ${Number(ex.amount).toFixed(2)}
                                        <div className="text-[10px] text-slate-400 mt-1 font-sans font-normal">
                                            {new Date(ex.expense_date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${ex.status === 'reimbursed' ? 'bg-emerald-100 text-emerald-700' :
                                            ex.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {ex.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-slate-400 w-12">Raised:</span>
                                            <span className="font-medium text-slate-700">{ex.raised_by_name || 'Unknown'}</span>
                                        </div>
                                        {ex.approved_by_name && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400 w-12">Appr:</span>
                                                <span className="font-medium text-emerald-600">{ex.approved_by_name}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {ex.status === 'awaiting_approval' && (
                                            <button
                                                onClick={() => handleStatusUpdate(ex.id, 'approved')}
                                                className="text-blue-600 hover:text-blue-800 text-xs font-bold hover:underline"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {ex.status === 'approved' && (
                                            <button
                                                onClick={() => handleStatusUpdate(ex.id, 'reimbursed')}
                                                className="text-emerald-600 hover:text-emerald-800 text-xs font-bold hover:underline"
                                            >
                                                Reimburse
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {expenses.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No expenses recorded.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExpensesTable;
