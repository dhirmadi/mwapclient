/**
 * Cloud Provider Types
 * These types define the structure of cloud provider-related data
 */

export interface CloudProvider {
  id: string;
  name: string;
  description: string;
  type: CloudProviderType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum CloudProviderType {
  AWS = 'AWS',
  AZURE = 'AZURE',
  GCP = 'GCP',
  DIGITAL_OCEAN = 'DIGITAL_OCEAN',
  OTHER = 'OTHER',
}

export interface CreateCloudProviderDto {
  name: string;
  description: string;
  type: CloudProviderType;
}

export interface UpdateCloudProviderDto {
  name?: string;
  description?: string;
  type?: CloudProviderType;
  active?: boolean;
}