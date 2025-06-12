/**
 * File Types
 * These types define the structure of file-related data
 */

import { Project } from './project';
import { User } from './auth';

export interface File {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  project: Project;
  uploadedBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface UploadFileDto {
  projectId: string;
  file: Blob;
}

export interface FileUploadResponse {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  url: string;
}