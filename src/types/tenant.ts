export interface Tenant {
  id?: string;
  _id?: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  archived?: boolean;
  active?: boolean;
  integrations?: string[];
  settings?: Record<string, any>;
}

export interface TenantCreate {
  name: string;
}

export interface TenantUpdate {
  name?: string;
  archived?: boolean;
}