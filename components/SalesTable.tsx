
import React from 'react';
import { api } from '../services/api';

interface SalesPerson {
    id: string;
    name: string;
    email: string;
    active: boolean;
    joined_on: string;
    onboarded_count: number;
}

interface SalesTableProps {
    salesPeople: SalesPerson[];
    onRefresh: () => void;
}

const SalesTable: React.FC<SalesTableProps> = ({ salesPeople, onRefresh }) => {
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will soft delete the sales person.')) return;
        try {
            await api.delete(`/sales/${id}`);
            onRefresh();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Sales Team</h3>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700"
                    onClick={() => alert('Add Sales Person form coming soon')} // Placeholder for full crud
                >
                    Add Sales Person
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Onboarded Users</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Joined</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {salesPeople.map(sp => (
                            <tr key={sp.id} className="hover:bg-slate-50/80">
                                <td className="px-6 py-4 font-medium text-slate-900">{sp.name}</td>
                                <td className="px-6 py-4 text-slate-600 text-sm">{sp.email}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded font-mono font-bold text-xs">
                                        {sp.onboarded_count}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${sp.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {sp.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">{new Date(sp.joined_on).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(sp.id)}
                                        className="text-red-500 hover:text-red-700 text-xs font-bold hover:underline"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {salesPeople.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No sales people found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesTable;
