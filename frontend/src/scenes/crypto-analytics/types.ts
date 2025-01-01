// frontend/src/scenes/crypto-analytics/types.ts
import { ErrorDetails } from './utils/errorHandling'

export interface CryptoAnalyticsFilters {
      token_type?: string
      active_users?: {
          min: number
          max: number
          label: string
      }
      total_contract_calls?: {
          min: number
          max: number
          label: string
      }
      // ... other filter types
  }
  
  export interface CryptoAnalytic {
      id: number
      short_id: string
      name: string
      filters: {
          active_users: number
          ave_gas_used: number
          total_contract_calls: number
          [key: string]: number
      }
      created_at: string
      description: string
      // ... other fields
  }

  import { Logic } from 'kea'

  export interface cryptoAnalyticsLogicType extends Logic {
      values: {
          analyticsList: CryptoAnalytic[]
          analytic: CryptoAnalytic | null
          error: ErrorDetails | null
          isLoading: boolean
          loadingStates: Record<string, boolean>
          hasError: boolean
      }
      actions: {
        setError: (error: ErrorDetails | null) => { error: ErrorDetails | null }
        clearError: () => void
        setLoadingState: (key: string, isLoading: boolean) => { key: string, isLoading: boolean }
        retryFailedOperation: (operationType: string) => { operationType: string }
        setDateRange: (range: [Date, Date]) => { range: [Date, Date] }
        toggleMetric: (metric: string) => { metric: string }
        loadAnalyticsList: () => void
        createAnalytic: (payload: { values: any }) => void
        loadAnalytic: (id: string) => void
        updateAnalytic: (id: string, values: any) => void
      }
  }