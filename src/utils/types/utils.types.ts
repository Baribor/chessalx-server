export interface PaginationControl {
  cursor: number | string;
  recordsPerPage: number;
  totalRecords: number;
  totalPages: number;
}

export interface BaseResponseDTO {
  status: boolean;
  message: string;
  type?: 'array' | 'object';
  data?: any;
  pagination?: PaginationControl;
}

export interface MailOption {
  to: string;
  subject: string;
  message: string;
  html: string;
}

export interface AuthUser {
  id: string;
  role: string;
  email: string;
}
