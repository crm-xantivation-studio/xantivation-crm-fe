import { ServiceInterest } from './lead.types';

export enum OpportunityStage {
  PROSPECTING = 'PROSPECTING',
  QUALIFICATION = 'QUALIFICATION',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

export interface Opportunity {
  id: string;
  oppCode: string;
  name: string;
  customer?: {
    id: string;
    customerCode: string;
    name: string;
  };
  contact?: {
    id: string;
    firstName?: string;
    lastName: string;
    email: string;
    phone: string;
  };
  amount: number;
  stage: OpportunityStage;
  probability?: number;
  closeDate: string;
  serviceInterest?: ServiceInterest;
  description?: string;
  lostReason?: string;
  leadId?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOpportunityDto {
  name: string;
  customerId: string;
  contactId?: string;
  amount: number;
  stage?: OpportunityStage;
  probability?: number;
  closeDate: string;
  serviceInterest?: ServiceInterest;
  description?: string;
  leadId?: string;
  assignedToId?: string;
}

export interface UpdateOpportunityDto extends Partial<CreateOpportunityDto> {
  lostReason?: string;
}
