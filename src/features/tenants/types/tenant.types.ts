export interface Tenant {
  id: string;             // Tenant ID (transformed from _id)
  name: string;           // Tenant name
  ownerId: string;        // Auth0 user ID of the owner
  settings: {             // Tenant settings
    allowPublicProjects: boolean;  // Whether public projects are allowed
    maxProjects: number;           // Maximum number of projects allowed
  };
  createdAt: string;      // ISO date string
  updatedAt: string;      // ISO date string
  archived: boolean;      // Whether tenant is archived
}

export interface TenantCreate {
  name: string;           // 3-50 chars
  settings?: {            // Optional tenant settings
    allowPublicProjects?: boolean;  // Default: false
    maxProjects?: number;           // 1-100, Default: 10
  };
}

export interface TenantUpdate {
  name?: string;          // 3-50 chars
  settings?: {            // Optional tenant settings update
    allowPublicProjects?: boolean;
    maxProjects?: number; // 1-100
  };
  archived?: boolean;     // Archive/unarchive tenant
}