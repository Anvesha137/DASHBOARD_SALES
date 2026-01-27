
export enum PackageName {
  FREE = 'Free',
  STARTER = 'Starter',
  PRO = 'Pro',
  ENTERPRISE = 'Enterprise'
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FLAT = 'flat'
}

export interface User {
  id: string;
  username: string;
  email: string;
  followerCount: number; // Mapped from followers_now
  followersAtJoin: number; // Mapped from followers_joined
  packageName: string; // DB returns string 'free', 'pro' etc
  promoCodeUsed?: string; // Mapped from promo_code_name
  automationsUsed: number;
  emailIntegrated: boolean; // defaults to false in DB
  createdAt: string; // joined_date
  timeSpentMinutes: number;
  isAffiliate: boolean;
  referralCount: number;
  // New fields from API joins
  promoCodeName?: string;
  salesPersonName?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: DiscountType;
  value: number;
  expiryDate: string;
  assignedUserId?: string; // If unassigned, it's global
  usageCount: number;
  maxUses: number;
  createdAt: string;
  createdBy: string;
  approvedBy: string;
}

export type DashboardView = 'users' | 'sales' | 'promo-codes' | 'expenses' | 'analytics' | 'notifications';
