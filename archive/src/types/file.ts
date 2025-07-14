export interface File {
  fileId: string;
  name: string;
  mimeType: string;
  path: string;
  status: 'pending' | 'processed' | 'error';
  size?: number;
  createdAt?: string;
  modifiedAt?: string;
  metadata?: {
    isFolder?: boolean;
    webViewLink?: string;
    [key: string]: any;
  };
}

export interface FileListParams {
  folder?: string;
  recursive?: boolean;
  fileTypes?: string[];
  limit?: number;
  page?: number;
}