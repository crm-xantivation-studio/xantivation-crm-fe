export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  UNQUALIFIED = 'UNQUALIFIED',
}

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  LINKEDIN = 'LINKEDIN',
  X = 'X',
  YOUTUBE = 'YOUTUBE',
  TIKTOK = 'TIKTOK',
  ZALO = 'ZALO',
  GMAIL = 'GMAIL',
  REFERRAL = 'REFERRAL',
  EVENT = 'EVENT',
  PORTFOLIO = 'PORTFOLIO',
  MANUAL = 'MANUAL',
  CHATWOOT = 'CHATWOOT',
  TELEGRAM = 'TELEGRAM',
  XANT = 'XANT',
  XZ = 'XZ',
}

export enum ServiceInterest {
  WEBSITE = 'WEBSITE',
  APP_MVP = 'APP_MVP',
  BRANDING = 'BRANDING',
  UI_UX = 'UI_UX',
  SOCIAL_KIT = 'SOCIAL_KIT',
  MAINTENANCE = 'MAINTENANCE',
  CUSTOM = 'CUSTOM',
}

export interface Lead {
  id: string;
  leadCode: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  companyName?: string;
  company?: string; // fallback
  email?: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  budget?: number;
  serviceInterest?: string;
  need?: string;
  timeline?: string;
  bantScore?: number;
  budgetApproved?: boolean;
  authorityMarker?: boolean;
  description?: string;
  aiScore?: number;
  aiScoreData?: any;
  aiScoredAt?: string;
  ownerId?: string;
  owner?: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE';
  notes: string;
  performedBy: string;
  createdAt: string;
}

export interface CreateLeadDto {
  firstName?: string;
  lastName?: string;
  name?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  status?: LeadStatus;
  source?: LeadSource;
  bantScore?: number;
  budgetApproved?: boolean;
  authorityMarker?: boolean;
  need?: string;
  timeline?: string;
  description?: string;
  assignedToId?: string;
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {}
