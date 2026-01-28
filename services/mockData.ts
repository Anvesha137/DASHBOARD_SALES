
import { User, PromoCode, PackageName, DiscountType } from '../types';

const USERS: User[] = [
  {
    id: '1',
    username: 'johndoe',
    email: 'john@example.com',
    followerCount: 12500,
    followersAtJoin: 1000,
    packageName: PackageName.PRO,
    promoCodeUsed: 'WELCOME20',
    automationsUsed: 450,
    emailIntegrated: true,
    createdAt: '2023-10-15T08:00:00Z',
    timeSpentMinutes: 1240,
    isAffiliate: true,
    referralCount: 12,
  },
  {
    id: '2',
    username: 'janedoe',
    email: 'jane@acme.org',
    followerCount: 3200,
    followersAtJoin: 500,
    packageName: PackageName.STARTER,
    automationsUsed: 120,
    emailIntegrated: false,
    createdAt: '2023-11-20T14:30:00Z',
    timeSpentMinutes: 560,
    isAffiliate: false,
    referralCount: 3,
  },
  {
    id: '3',
    username: 'tech_guru',
    email: 'guru@tech.io',
    followerCount: 89000,
    followersAtJoin: 50000,
    packageName: PackageName.ENTERPRISE,
    promoCodeUsed: 'VIP_GURU',
    automationsUsed: 3200,
    emailIntegrated: true,
    createdAt: '2023-08-05T09:15:00Z',
    timeSpentMinutes: 8400,
    isAffiliate: true,
    referralCount: 54,
  },
  {
    id: '4',
    username: 'creative_mind',
    email: 'hello@creative.net',
    followerCount: 450,
    followersAtJoin: 100,
    packageName: PackageName.FREE,
    automationsUsed: 10,
    emailIntegrated: false,
    createdAt: '2024-01-10T11:45:00Z',
    timeSpentMinutes: 45,
    isAffiliate: false,
    referralCount: 0,
  }
];

// Generate more users for pagination demo
for (let i = 5; i <= 30; i++) {
  const currentFollowers = Math.floor(Math.random() * 5000);
  USERS.push({
    id: `${i}`,
    username: `user_${i}`,
    email: `user${i}@example.com`,
    followerCount: currentFollowers,
    followersAtJoin: Math.floor(currentFollowers * 0.8), // 80% of current
    packageName: i % 3 === 0 ? PackageName.PRO : PackageName.STARTER,
    automationsUsed: Math.floor(Math.random() * 200),
    emailIntegrated: i % 2 === 0,
    createdAt: new Date(Date.now() - (Math.random() * 10000000000)).toISOString(),
    timeSpentMinutes: Math.floor(Math.random() * 2000),
    isAffiliate: i % 5 === 0,
    referralCount: Math.floor(Math.random() * 10),
  });
}

const PROMO_CODES: PromoCode[] = [
  {
    id: 'pc1',
    code: 'WELCOME20',
    discountType: DiscountType.PERCENTAGE,
    value: 20,
    expiryDate: '2025-12-31',
    usageCount: 154,
    maxUses: 1000,
    createdAt: '2023-01-01T00:00:00Z',
    createdBy: 'System Admin',
    approvedBy: 'CEO',
  },
  {
    id: 'pc2',
    code: 'SAVE50FLAT',
    discountType: DiscountType.FLAT,
    value: 50,
    expiryDate: '2024-06-01',
    usageCount: 45,
    maxUses: 100,
    createdAt: '2023-06-01T00:00:00Z',
    createdBy: 'Marketing Lead',
    approvedBy: 'VP Sales',
  }
];


// -- Mock Data for Sales, Expenses, Analytics, Notifications --

export const SALES_PEOPLE = [
  { id: 'sp1', name: 'Alex Johnson', email: 'alex@company.com', active: true, joined_on: '2023-01-15T00:00:00Z', onboarded_count: 45 },
  { id: 'sp2', name: 'Maria Garcia', email: 'maria@company.com', active: true, joined_on: '2023-03-10T00:00:00Z', onboarded_count: 82 },
  { id: 'sp3', name: 'James Smith', email: 'james@company.com', active: false, joined_on: '2022-11-05T00:00:00Z', onboarded_count: 12 }
];

export const EXPENSES = [
  {
    id: 'ex1',
    type: 'tools',
    merchant: 'AWS',
    expense_date: '2024-01-20',
    amount: '145.50',
    description: 'Cloud hosting fees',
    status: 'approved',
    raised_by_name: 'Dev Team',
    approved_by_name: 'CTO'
  },
  {
    id: 'ex2',
    type: 'marketing',
    merchant: 'Google Ads',
    expense_date: '2024-01-22',
    amount: '500.00',
    description: 'Q1 Ad Campaign',
    status: 'awaiting_approval',
    raised_by_name: 'Marketing Lead'
  }
];

export const ANALYTICS = {
  totalUsers: 1543,
  totalAutomations: 8900,
  affiliateCount: 45,
  topSales: [
    { name: 'Maria G.', count: 82 },
    { name: 'Alex J.', count: 45 },
    { name: 'Sam W.', count: 28 },
  ],
  packageData: [
    { name: 'Free', value: 600 },
    { name: 'Starter', value: 500 },
    { name: 'Pro', value: 300 },
    { name: 'Enterprise', value: 143 },
  ]
};

export const NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'AWS Credits Expiring',
    message: 'Your $1000 AWS credits are expiring soon.',
    type: 'expiry',
    severity: 'critical',
    date: '2024-02-15T00:00:00Z',
    daysLeft: 18
  },
  {
    id: 'n2',
    title: 'License Renewal',
    message: 'Adobe Creative Cloud renewal due.',
    type: 'info',
    severity: 'warning',
    date: '2024-03-01T00:00:00Z',
    daysLeft: 32
  }
];


export const getMockUsers = () => USERS;
export const addMockUser = (user: User) => {
  USERS.unshift(user);
  return user;
};

export const getMockPromoCodes = () => PROMO_CODES;
export const addMockPromoCode = (promo: PromoCode) => {
  PROMO_CODES.unshift(promo);
  return promo;
};

export const getMockSalesPeople = () => SALES_PEOPLE;
export const deleteMockSalesPerson = (id: string) => {
  const index = SALES_PEOPLE.findIndex(sp => sp.id === id);
  if (index > -1) {
    SALES_PEOPLE.splice(index, 1);
  }
};

export const getMockExpenses = () => EXPENSES;
export const addMockExpense = (expense: any) => {
  EXPENSES.unshift(expense);
  return expense;
};
export const updateMockExpenseStatus = (id: string, status: string) => {
  const expense = EXPENSES.find(e => e.id === id);
  if (expense) {
    expense.status = status as any;
  }
};

export const getMockAnalytics = () => ANALYTICS;
export const getMockNotifications = () => NOTIFICATIONS;


