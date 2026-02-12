export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      flavors: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string | null;
          tags: string[] | null;
          first_appeared: string;
          last_appeared: string | null;
          total_appearances: number;
          total_days_available: number;
          rarity_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: string | null;
          tags?: string[] | null;
          first_appeared: string;
          last_appeared?: string | null;
          total_appearances?: number;
          total_days_available?: number;
          rarity_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          tags?: string[] | null;
          first_appeared?: string;
          last_appeared?: string | null;
          total_appearances?: number;
          total_days_available?: number;
          rarity_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_menu: {
        Row: {
          id: string;
          flavor_id: string;
          menu_date: string;
          appearance_number: number | null;
          days_since_last: number | null;
          sold_out_at: string | null;
          popularity_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          flavor_id: string;
          menu_date: string;
          appearance_number?: number | null;
          days_since_last?: number | null;
          sold_out_at?: string | null;
          popularity_score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          flavor_id?: string;
          menu_date?: string;
          appearance_number?: number | null;
          days_since_last?: number | null;
          sold_out_at?: string | null;
          popularity_score?: number;
          created_at?: string;
        };
      };
      flavor_photos: {
        Row: {
          id: string;
          image_url: string;
          menu_date: string;
          claude_response: Json | null;
          processed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          menu_date: string;
          claude_response?: Json | null;
          processed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          menu_date?: string;
          claude_response?: Json | null;
          processed?: boolean;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          name: string | null;
          birthday: string | null;
          notification_preferences: Json;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          phone?: string | null;
          name?: string | null;
          birthday?: string | null;
          notification_preferences?: Json;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          name?: string | null;
          birthday?: string | null;
          notification_preferences?: Json;
          is_admin?: boolean;
          created_at?: string;
        };
      };
      user_watchlists: {
        Row: {
          id: string;
          user_id: string;
          flavor_id: string;
          alert_enabled: boolean;
          missed_count: number;
          caught_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          flavor_id: string;
          alert_enabled?: boolean;
          missed_count?: number;
          caught_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          flavor_id?: string;
          alert_enabled?: boolean;
          missed_count?: number;
          caught_count?: number;
          created_at?: string;
        };
      };
      user_flavors_tried: {
        Row: {
          id: string;
          user_id: string;
          flavor_id: string;
          tried_date: string;
          rating: number | null;
          review: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          flavor_id: string;
          tried_date: string;
          rating?: number | null;
          review?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          flavor_id?: string;
          tried_date?: string;
          rating?: number | null;
          review?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
      };
      flavor_suggestions: {
        Row: {
          id: string;
          suggested_by: string | null;
          flavor_name: string;
          description: string | null;
          upvotes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          suggested_by?: string | null;
          flavor_name: string;
          description?: string | null;
          upvotes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          suggested_by?: string | null;
          flavor_name?: string;
          description?: string | null;
          upvotes?: number;
          created_at?: string;
        };
      };
      flavor_suggestion_votes: {
        Row: {
          id: string;
          suggestion_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          suggestion_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          suggestion_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Flavor = Database['public']['Tables']['flavors']['Row'];
export type DailyMenu = Database['public']['Tables']['daily_menu']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type UserWatchlist = Database['public']['Tables']['user_watchlists']['Row'];
export type UserFlavorTried = Database['public']['Tables']['user_flavors_tried']['Row'];
export type FlavorSuggestion = Database['public']['Tables']['flavor_suggestions']['Row'];
export type FlavorSuggestionVote = Database['public']['Tables']['flavor_suggestion_votes']['Row'];
export type FlavorPhoto = Database['public']['Tables']['flavor_photos']['Row'];

export type FlavorWithMenu = Flavor & {
  daily_menu?: DailyMenu[];
};

export type DailyMenuWithFlavor = DailyMenu & {
  flavors: Flavor;
};

export type NotificationPreferences = {
  daily_drops: boolean;
  watchlist: boolean;
  sold_out: boolean;
};
