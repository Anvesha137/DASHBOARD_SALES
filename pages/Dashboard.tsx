
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
import { getMockUsers, getMockPromoCodes, getMockSalesPeople, getMockExpenses, getMockAnalytics, getMockNotifications } from '../services/mockData';

const Dashboard: React.FC = () => {
    const [activeView, setActiveView] = useState<DashboardView>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [salesPeople, setSalesPeople] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
            console.warn('API Fetch Failed, falling back to mock data.', err);
            // Fallback to Mock Data (Safe Mode)
            setUsers(getMockUsers());
            setPromoCodes(getMockPromoCodes());
            setSalesPeople(getMockSalesPeople());
            setExpenses(getMockExpenses());
            setAnalytics(getMockAnalytics());
            setNotifications(getMockNotifications());

            // Do NOT redirect to login to allow "No Login" mode
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
        } catch (e) {
            alert('Failed to create promo');
        }
    };

    const handleAddUser = async (newUser: Omit<User, 'id' | 'promoCodeUsed' | 'automationsUsed' | 'createdAt' | 'timeSpentMinutes' | 'referralCount'>) => {
        try {
            const created = await api.post('/users', newUser);
            setUsers([created, ...users]);
        } catch (e) {
            alert('Failed to create user');
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
