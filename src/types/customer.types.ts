export enum ClientType {
  BUSINESS = 'BUSINESS',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Customer {
  id: string;
  customerCode?: string;
  code: string;
  name: string; // account_name
  taxCode?: string;
  phone: string;
  email: string;
  website?: string;
  address?: string;
  clientType: ClientType;
  industry?: string;
  status: CustomerStatus;
  notes?: string;
  contactsCount?: number;
  assignedTo?: {
    id: string;
    name: string;
  };
  contacts?: Contact[];
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName: string;
  email: string;
  phone: string;
  role?: string;
  jobTitle?: string;
  accountId?: string;
  account?: Customer;
  customer?: Customer;
  isPrimary: boolean;
  notes?: string;
  status?: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  taxCode?: string;
  phone: string;
  email: string;
  website?: string;
  address?: string;
  clientType: ClientType;
  industry?: string;
  notes?: string;
  status?: CustomerStatus;
  assignedToId?: string;
}

export interface CreateContactDto {
  firstName?: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle?: string;
  accountId?: string;
  isPrimary?: boolean;
  notes?: string;
}
