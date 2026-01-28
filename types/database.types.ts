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
          gender?: string | null
          nationality?: string | null
          country_code?: string | null
          mobile_number?: string | null
          mobile_verified?: boolean | null
        }
        Insert: {
          id?: string
          username: string
          email: string
          name: string
          bio?: string | null
          created_at?: string
          gender?: string | null
          nationality?: string | null
          country_code?: string | null
          mobile_number?: string | null
          mobile_verified?: boolean | null
        }
        Update: {
          id?: string
          username?: string
          email?: string
          name?: string
          bio?: string | null
          created_at?: string
          gender?: string | null
          nationality?: string | null
          country_code?: string | null
          mobile_number?: string | null
          mobile_verified?: boolean | null
        }
      }
      predictions: {
        Row: {
          id: string
          expert_id: string
          category: string
          asset_name: string | null
          prediction: string | null
          target_value: number | null
          current_value: number | null
          confidence: number | null
          direction: string | null
          event_date: string | null
          event_close_time: string | null
          is_locked: boolean
          is_revealed: boolean
          created_at: string
          // New Columns
          title: string | null
          region: string | null
          target_date: string | null
          reference_price: number | null
          reference_time: string | null
          final_price: number | null
          outcome: string | null
          evaluation_time: string | null
          data_source: string | null
          market_type: string | null
          asset_symbol: string | null
          duration_minutes: number | null
          prediction_type: string | null
        }
        Insert: {
          id?: string
          expert_id: string
          category: string
          asset_name?: string | null
          prediction?: string | null
          target_value?: number | null
          current_value?: number | null
          confidence?: number | null
          direction?: string | null
          event_date?: string | null
          event_close_time?: string | null
          is_locked?: boolean
          is_revealed?: boolean
          created_at?: string
          // New Columns
          title?: string | null
          region?: string | null
          target_date?: string | null
          reference_price?: number | null
          reference_time?: string | null
          final_price?: number | null
          outcome?: string | null
          evaluation_time?: string | null
          data_source?: string | null
          market_type?: string | null
          asset_symbol?: string | null
          duration_minutes?: number | null
          prediction_type?: string | null
        }
        Update: {
          id?: string
          expert_id?: string
          category?: string
          asset_name?: string | null
          prediction?: string | null
          target_value?: number | null
          current_value?: number | null
          confidence?: number | null
          direction?: string | null
          event_date?: string | null
          event_close_time?: string | null
          is_locked?: boolean
          is_revealed?: boolean
          created_at?: string
          // New Columns
          title?: string | null
          region?: string | null
          target_date?: string | null
          reference_price?: number | null
          reference_time?: string | null
          final_price?: number | null
          outcome?: string | null
          evaluation_time?: string | null
          data_source?: string | null
          market_type?: string | null
          asset_symbol?: string | null
          duration_minutes?: number | null
          prediction_type?: string | null
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
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
    Views: {
      user_verivo_scores: {
        Row: {
          user_id: string
          total_predictions: number
          correct_predictions: number
          raw_accuracy: number
          weighted_accuracy: number
          confidence_factor: number
          credible_accuracy: number
          verivo_score: number
        }
      }
    }
  }
}
