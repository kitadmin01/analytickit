// frontend/src/scenes/crypto-analytics/utils/errorHandling.ts
export enum ErrorType {
      API_ERROR = 'API_ERROR',
      VALIDATION_ERROR = 'VALIDATION_ERROR',
      NETWORK_ERROR = 'NETWORK_ERROR',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
  }
  
  export interface ErrorDetails {
      type: ErrorType
      message: string
      details?: Record<string, any>
  }
  
  export function handleError(error: any): ErrorDetails {
      if (error.response) {
          // API errors
          return {
              type: ErrorType.API_ERROR,
              message: error.response.data.detail || 'An API error occurred',
              details: error.response.data
          }
      } else if (error.request) {
          // Network errors
          return {
              type: ErrorType.NETWORK_ERROR,
              message: 'Unable to connect to the server',
              details: { request: error.request }
          }
      }
      
      return {
          type: ErrorType.UNKNOWN_ERROR,
          message: error.message || 'An unexpected error occurred',
          details: error
      }
  }