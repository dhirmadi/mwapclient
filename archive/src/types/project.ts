import { ProjectRole } from './auth';

export interface ProjectMember {
  userId: string;
  role: ProjectRole;
}

export interface Project {
  _id: string;
  tenantId: string;
  projectTypeId: string;
  cloudIntegrationId: string;
  folderpath: string;
  name: string;
  description: string;
  archived: boolean;
  members: ProjectMember[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface ProjectCreate {
  tenantId: string;
  projectTypeId: string;
  cloudIntegrationId: string;
  folderpath: string;
  name: string;
  description?: string;
  members: ProjectMember[];
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  archived?: boolean;
}