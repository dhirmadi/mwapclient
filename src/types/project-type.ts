export interface ProjectType {
  _id: string;
  name: string;
  description: string;
  configSchema: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ProjectTypeCreate {
  name: string;
  description: string;
  configSchema: Record<string, unknown>;
  isActive: boolean;
}

export interface ProjectTypeUpdate {
  name?: string;
  description?: string;
  configSchema?: Record<string, unknown>;
  isActive?: boolean;
}