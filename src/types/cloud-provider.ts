export interface CloudProvider {
  _id: string;
  name: string;
  slug: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CloudProviderCreate {
  name: string;
  slug: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
}

export interface CloudProviderUpdate {
  name?: string;
  slug?: string;
  scopes?: string[];
  authUrl?: string;
  tokenUrl?: string;
}

export interface CloudProviderIntegration {
  _id: string;
  tenantId: string;
  cloudProviderId: string;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CloudProviderIntegrationCreate {
  tenantId: string;
  cloudProviderId: string;
  config: Record<string, unknown>;
}