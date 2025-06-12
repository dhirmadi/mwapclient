/**
 * Tenant Types
 * These types define the structure of tenant-related data
 */

import { User } from './auth';

export interface Tenant {
  id: string;
  name: string;
  description: string;
  status: TenantStatus;
  owner: User;
  createdAt: string;
  updatedAt: string;
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface TenantMember {
  id: string;
  user: User;
  tenant: Tenant;
  role: TenantMemberRole;
  createdAt: string;
  updatedAt: string;
}

export enum TenantMemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface CreateTenantDto {
  name: string;
  description: string;
}

export interface UpdateTenantDto {
  name?: string;
  description?: string;
  status?: TenantStatus;
}