/**
 * Project Types
 * These types define the structure of project-related data
 */

import { User } from './auth';
import { Tenant } from './tenant';
import { CloudProvider } from './cloud-provider';
import { ProjectType } from './project-type';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  tenant: Tenant;
  projectType: ProjectType;
  cloudProvider: CloudProvider;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface ProjectMember {
  id: string;
  user: User;
  project: Project;
  role: ProjectMemberRole;
  createdAt: string;
  updatedAt: string;
}

export enum ProjectMemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export interface CreateProjectDto {
  name: string;
  description: string;
  tenantId: string;
  projectTypeId: string;
  cloudProviderId: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  archived?: boolean;
}