
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import UserTable from '../components/UserTable';
import PromoCodeManager from '../components/PromoCodeManager';
import SalesTable from '../components/SalesTable';
import ExpensesTable from '../components/ExpensesTable';
import AnalyticsOverview from '../components/AnalyticsOverview';
import NotificationsView from '../components/NotificationsView';
import { User, PromoCode, DashboardView } from '../types';
import { api } from '../services/api';

const Dashboard: React.FC = () => {
    const [activeView, setActiveView] = useState<DashboardView>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [salesPeople, setSalesPeople] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, promosData, salesData, expensesData, analyticsData, notifData] = await Promise.all([
                api.get('/users'),
                api.get('/promos'),
                api.get('/sales'),
                api.get('/expenses'),
                api.get('/analytics'),
                api.get('/notifications')
            ]);
            setUsers(usersData.map((u: any) => ({
                id: u.id,
                username: u.username,
                email: u.email,
                packageName: u.package, // DB column 'package' -> Frontend 'packageName'
                followerCount: u.followers_now, // DB 'followers_now' -> Frontend 'followerCount'
                followersAtJoin: u.followers_joined,
                promoCodeUsed: u.promo_code_name,
                automationsUsed: u.automations_count,
                emailIntegrated: false, // Default
                isAffiliate: u.is_affiliate,
                referralCount: 0, // Default for now
                createdAt: u.joined_date,
                timeSpentMinutes: 0, // Default
                salesPersonName: u.sales_person_name
            })));
            setPromoCodes(promosData);
            setSalesPeople(salesData);
            setExpenses(expensesData);
            setAnalytics(analyticsData);
            setNotifications(notifData);
        } catch (err: any) {
            console.error('API Fetch Failed', err);
            setError(err.message || 'Failed to connect to the server. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddPromoCode = async (newPromo: Omit<PromoCode, 'id' | 'usageCount'>) => {
        try {
            const created = await api.post('/promos', newPromo);
            setPromoCodes([created, ...promoCodes]);
        } catch (e: any) {
            console.error('API Create Failed', e);
            alert(`Failed to create promo code: ${e.message}`);
        }
    };

    const handleAddUser = async (newUser: Omit<User, 'id' | 'promoCodeUsed' | 'automationsUsed' | 'createdAt' | 'timeSpentMinutes' | 'referralCount'>) => {
        try {
            const created = await api.post('/users', newUser);
            // The created user from DB might need mapping to match frontend User interface completely if names differ
            // But simpler to just re-fetch to get consistent state or map manually here similar to fetchData
            // Let's re-fetch for simplicity and consistency
            fetchData();
        } catch (e: any) {
            console.error('API Create Failed', e);
            alert(`Failed to create user: ${e.message}`);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Synchronizing Dashboard Data...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Connection Error</h3>
                        <p className="text-slate-500 max-w-md mx-auto mt-1">{error}</p>
                    </div>
                    <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
                        Retry Connection
                    </button>
                </div>
            );
        }

        switch (activeView) {
            case 'users':
                return <UserTable users={users} onAddUser={handleAddUser} />;
            case 'sales':
                return <SalesTable salesPeople={salesPeople} onRefresh={fetchData} />;
            case 'promo-codes':
                return <PromoCodeManager promoCodes={promoCodes} onAddPromoCode={handleAddPromoCode} />;
            case 'expenses':
                return <ExpensesTable expenses={expenses} onRefresh={fetchData} />;
            case 'analytics':
                return <AnalyticsOverview data={analytics} />;
            case 'notifications':
                return <NotificationsView notifications={notifications} />;
            default:
                return <div>View not found</div>;
        }
    };

    return (
        <Layout activeView={activeView} setActiveView={setActiveView}>
            {renderContent()}
        </Layout>
    );
};

export default Dashboard;
