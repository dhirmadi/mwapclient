export interface Tenant {
  _id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  archived: boolean;
  integrations: string[];
}

export interface TenantCreate {
  name: string;
}

export interface TenantUpdate {
  name?: string;
  archived?: boolean;
}