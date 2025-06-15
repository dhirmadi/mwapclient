export interface CloudProvider {
  _id: string;
  name: string;
  type: string;
  authType: string;
  configSchema: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CloudProviderCreate {
  name: string;
  type: string;
  authType: string;
  configSchema: Record<string, unknown>;
  isActive: boolean;
  credentials?: Record<string, string>;
}

export interface CloudProviderUpdate {
  name?: string;
  type?: string;
  authType?: string;
  configSchema?: Record<string, unknown>;
  isActive?: boolean;
  credentials?: Record<string, string>;
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