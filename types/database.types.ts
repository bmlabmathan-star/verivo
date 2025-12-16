export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      experts: {
        Row: {
          id: string
          username: string
          email: string
          name: string
          bio: string | null
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          name: string
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          name?: string
          bio?: string | null
          created_at?: string
        }
      }
      predictions: {
        Row: {
          id: string
          expert_id: string
          category: 'equity' | 'commodity' | 'currency' | 'crypto'
          asset_name: string
          prediction: string
          target_value: number | null
          current_value: number | null
          confidence: number | null
          direction: 'up' | 'down' | 'neutral' | null
          event_date: string
          event_close_time: string
          is_locked: boolean
          is_revealed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          expert_id: string
          category: 'equity' | 'commodity' | 'currency' | 'crypto'
          asset_name: string
          prediction: string
          target_value?: number | null
          current_value?: number | null
          confidence?: number | null
          direction?: 'up' | 'down' | 'neutral' | null
          event_date: string
          event_close_time: string
          is_locked?: boolean
          is_revealed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          expert_id?: string
          category?: 'equity' | 'commodity' | 'currency' | 'crypto'
          asset_name?: string
          prediction?: string
          target_value?: number | null
          current_value?: number | null
          confidence?: number | null
          direction?: 'up' | 'down' | 'neutral' | null
          event_date?: string
          event_close_time?: string
          is_locked?: boolean
          is_revealed?: boolean
          created_at?: string
        }
      }
      validations: {
        Row: {
          id: string
          prediction_id: string
          actual_value: number | null
          is_correct: boolean | null
          validated_at: string
        }
        Insert: {
          id?: string
          prediction_id: string
          actual_value?: number | null
          is_correct?: boolean | null
          validated_at?: string
        }
        Update: {
          id?: string
          prediction_id?: string
          actual_value?: number | null
          is_correct?: boolean | null
          validated_at?: string
        }
      }
      expert_stats: {
        Row: {
          expert_id: string
          total_predictions: number
          correct_predictions: number
          accuracy_rate: number
          verivo_score: number
          last_updated: string
        }
        Insert: {
          expert_id: string
          total_predictions?: number
          correct_predictions?: number
          accuracy_rate?: number
          verivo_score?: number
          last_updated?: string
        }
        Update: {
          expert_id?: string
          total_predictions?: number
          correct_predictions?: number
          accuracy_rate?: number
          verivo_score?: number
          last_updated?: string
        }
      }
    }
  }
}



