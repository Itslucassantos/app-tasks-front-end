export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
  token: string;
}
