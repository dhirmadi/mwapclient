/**
 * Project Type Types
 * These types define the structure of project type-related data
 */

export interface ProjectType {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectTypeDto {
  name: string;
  description: string;
}

export interface UpdateProjectTypeDto {
  name?: string;
  description?: string;
  active?: boolean;
}