export type Priority = '高' | '中' | '低';

export interface Tag {
  id: string;
  name: string;
  color?: string | null;
}

export interface BaseResponse {
  error?: string;
  details?: string;
}

// 認証関連
export interface Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
}

// 共通のバリデーション型
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
} 