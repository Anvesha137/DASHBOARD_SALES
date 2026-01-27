
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

export const getMockUsers = () => USERS;
export const getMockPromoCodes = () => PROMO_CODES;
