
import React from 'react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'expiry' | 'info';
    severity: 'critical' | 'warning' | 'info';
    date: string;
    daysLeft: number;
}

interface NotificationsViewProps {
    notifications: Notification[];
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications }) => {
    if (!notifications || notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <p className="text-lg font-medium">No new notifications</p>
                <p className="text-sm">You're all caught up!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                Notifications
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-extrabold">{notifications.length}</span>
            </h3>

            <div className="grid gap-4">
                {notifications.map(notif => (
                    <div key={notif.id} className={`p-4 rounded-xl border-l-4 shadow-sm bg-white ${notif.severity === 'critical' ? 'border-l-red-500' : 'border-l-amber-500'
                        }`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className={`font-bold ${notif.severity === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>
                                        {notif.title}
                                    </h4>
                                    {notif.severity === 'critical' && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded">Urgent</span>
                                    )}
                                </div>
                                <p className="text-slate-600 text-sm">{notif.message}</p>
                            </div>
                            <div className="text-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <div className={`text-xl font-black ${notif.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>
                                    {notif.daysLeft}
                                </div>
                                <div className="text-[10px] uppercase font-bold text-slate-400">Days Left</div>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-2">
                            <span>Expiry: {new Date(notif.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationsView;
