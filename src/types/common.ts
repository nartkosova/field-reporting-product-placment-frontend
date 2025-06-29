export interface BaseEntity {
  id: number;
  name: string;
  created_at?: string;
  created_by?: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "password" | "select" | "textarea";
  required?: boolean;
  options?: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

export type Size = "sm" | "md" | "lg";
export type ButtonVariant = "primary" | "secondary" | "danger" | "success";
export type UserRole = "admin" | "employee" | "user";
