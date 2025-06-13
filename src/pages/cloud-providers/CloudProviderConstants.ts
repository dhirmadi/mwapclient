import React from 'react';
import {
  IconBrandDropbox,
  IconBrandGoogleDrive,
  IconBrandOnedrive,
  IconBrandAmazon,
  IconBrandGoogle,
  IconBrandMicrosoft,
  IconCloud
} from '@tabler/icons-react';

// Define auth types
export const AUTH_TYPES = [
  { value: 'oauth2', label: 'OAuth 2.0' },
  { value: 'api_key', label: 'API Key' },
  { value: 'basic', label: 'Basic Authentication' },
  { value: 'custom', label: 'Custom' }
];

// Define provider types with icons
export const PROVIDER_TYPES = [
  { value: 'dropbox', label: 'Dropbox', icon: <IconBrandDropbox size={20} /> },
  { value: 'google_drive', label: 'Google Drive', icon: <IconBrandGoogleDrive size={20} /> },
  { value: 'onedrive', label: 'Microsoft OneDrive', icon: <IconBrandOnedrive size={20} /> },
  { value: 'aws_s3', label: 'Amazon S3', icon: <IconBrandAmazon size={20} /> },
  { value: 'gcp_storage', label: 'Google Cloud Storage', icon: <IconBrandGoogle size={20} /> },
  { value: 'azure_blob', label: 'Azure Blob Storage', icon: <IconBrandMicrosoft size={20} /> },
  { value: 'custom', label: 'Custom Storage Provider', icon: <IconCloud size={20} /> }
];

// Default schema templates for different provider types
export const DEFAULT_SCHEMAS: Record<string, any> = {
  dropbox: {
    type: 'object',
    properties: {
      client_id: { type: 'string', description: 'OAuth Client ID' },
      client_secret: { type: 'string', description: 'OAuth Client Secret' },
      redirect_uri: { type: 'string', description: 'OAuth Redirect URI' }
    },
    required: ['client_id', 'client_secret', 'redirect_uri']
  },
  google_drive: {
    type: 'object',
    properties: {
      client_id: { type: 'string', description: 'OAuth Client ID' },
      client_secret: { type: 'string', description: 'OAuth Client Secret' },
      redirect_uri: { type: 'string', description: 'OAuth Redirect URI' },
      scopes: { type: 'array', items: { type: 'string' }, description: 'OAuth Scopes' }
    },
    required: ['client_id', 'client_secret', 'redirect_uri']
  },
  onedrive: {
    type: 'object',
    properties: {
      client_id: { type: 'string', description: 'OAuth Client ID' },
      client_secret: { type: 'string', description: 'OAuth Client Secret' },
      redirect_uri: { type: 'string', description: 'OAuth Redirect URI' },
      tenant_id: { type: 'string', description: 'Microsoft Tenant ID (optional)' }
    },
    required: ['client_id', 'client_secret', 'redirect_uri']
  },
  aws_s3: {
    type: 'object',
    properties: {
      access_key_id: { type: 'string', description: 'AWS Access Key ID' },
      secret_access_key: { type: 'string', description: 'AWS Secret Access Key' },
      region: { type: 'string', description: 'AWS Region' },
      bucket: { type: 'string', description: 'Default S3 Bucket Name' }
    },
    required: ['access_key_id', 'secret_access_key', 'region']
  },
  gcp_storage: {
    type: 'object',
    properties: {
      project_id: { type: 'string', description: 'GCP Project ID' },
      client_email: { type: 'string', description: 'Service Account Email' },
      private_key: { type: 'string', description: 'Service Account Private Key' },
      bucket: { type: 'string', description: 'Default GCS Bucket Name' }
    },
    required: ['project_id', 'client_email', 'private_key']
  },
  azure_blob: {
    type: 'object',
    properties: {
      account_name: { type: 'string', description: 'Storage Account Name' },
      account_key: { type: 'string', description: 'Storage Account Key' },
      container_name: { type: 'string', description: 'Default Container Name' }
    },
    required: ['account_name', 'account_key']
  },
  custom: {
    type: 'object',
    properties: {
      base_url: { type: 'string', description: 'API Base URL' },
      auth_method: { type: 'string', description: 'Authentication Method' },
      credentials: { 
        type: 'object',
        properties: {
          key: { type: 'string' },
          secret: { type: 'string' }
        }
      }
    },
    required: ['base_url', 'auth_method']
  }
};

// Required credentials fields for different auth types
export const AUTH_TYPE_FIELDS: Record<string, Array<{ key: string, label: string, type: string }>> = {
  oauth2: [
    { key: 'client_id', label: 'Client ID', type: 'text' },
    { key: 'client_secret', label: 'Client Secret', type: 'password' },
    { key: 'redirect_uri', label: 'Redirect URI', type: 'text' }
  ],
  api_key: [
    { key: 'api_key', label: 'API Key', type: 'text' },
    { key: 'api_secret', label: 'API Secret', type: 'password' }
  ],
  basic: [
    { key: 'username', label: 'Username', type: 'text' },
    { key: 'password', label: 'Password', type: 'password' }
  ],
  custom: [
    { key: 'auth_method', label: 'Authentication Method', type: 'text' },
    { key: 'auth_data', label: 'Authentication Data (JSON)', type: 'textarea' }
  ]
};