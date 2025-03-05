/**
 * AIサービスのエラー種別
 */
export type AIErrorType =
  | 'API_KEY_NOT_SET'
  | 'RATE_LIMIT_EXCEEDED'
  | 'TIMEOUT'
  | 'INVALID_RESPONSE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'
  | 'INVALID_REQUEST';

/**
 * AIサービスのエラー情報
 */
export interface AIError {
  type: AIErrorType;
  message: string;
  originalError?: unknown;
} 