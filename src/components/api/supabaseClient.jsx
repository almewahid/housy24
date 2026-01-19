import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise use the provided credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tugrpzywepplllhmsxbk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Z3Jwenl3ZXBwbGxsaG1zeGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMTQ2MTIsImV4cCI6MjA1MjY5MDYxMn0.qBW67_nh3sWwjqBYUjqMBBNHaCOH2i6GsN_zFWN0GFY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'housy24-auth-token',
  }
});

// Helper functions for common operations
export const supabaseHelpers = {
  // Get current user - آمن من الأخطاء
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.log('No active session');
        return null;
      }
      return user;
    } catch (error) {
      console.log('Auth error:', error);
      return null;
    }
  },

  // List entities with sorting (without filters)
  async list(table, sortBy = '-created_at', limit = 50) {
    const isDescending = sortBy.startsWith('-');
    const column = isDescending ? sortBy.slice(1) : sortBy;
    
    let query = supabase
      .from(table)
      .select('*')
      .order(column, { ascending: !isDescending });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Filter entities
  async filter(table, filters = {}, sortBy = '-created_at', limit = 50) {
    const isDescending = sortBy.startsWith('-');
    const column = isDescending ? sortBy.slice(1) : sortBy;
    
    let query = supabase.from(table).select('*');
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    query = query.order(column, { ascending: !isDescending });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get single entity by ID
  async getById(table, id) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create entity - آمن من أخطاء Auth
  async create(table, data) {
    const user = await this.getCurrentUser();
    const { data: result, error } = await supabase
      .from(table)
      .insert({
        ...data,
        created_by: user?.email || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  // Bulk create - آمن من أخطاء Auth
  async bulkCreate(table, dataArray) {
    const user = await this.getCurrentUser();
    const { data, error } = await supabase
      .from(table)
      .insert(
        dataArray.map(item => ({
          ...item,
          created_by: user?.email || null,
        }))
      )
      .select();
    
    if (error) throw error;
    return data;
  },

  // Update entity
  async update(table, id, data) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  // Delete entity
  async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Subscribe to changes
  subscribe(table, callback) {
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          callback({
            type: payload.eventType === 'INSERT' ? 'create' : 
                  payload.eventType === 'UPDATE' ? 'update' : 'delete',
            data: payload.new,
            id: payload.new?.id || payload.old?.id,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Auth helpers
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  },

  async updateProfile(updates) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase.auth.updateUser({
      data: updates
    });
    
    if (error) throw error;
  }
};