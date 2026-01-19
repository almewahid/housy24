import { supabase, supabaseHelpers } from './supabaseClient';

// Table name mapping from entity names to Supabase table names
const TABLE_MAP = {
  Expense: 'expenses',
  Budget: 'budgets',
  Task: 'tasks',
  SubTask: 'sub_tasks',
  Notification: 'notifications',
  RecurringTask: 'recurring_tasks',
  InventoryItem: 'inventory_items',
  DIYProject: 'diy_projects',
  HouseholdTask: 'household_tasks',
  FamilyMember: 'family_members',
  Maintenance: 'maintenance',
  Schedule: 'schedules',
  Plant: 'plants',
  NotificationSettings: 'notification_settings',
  FoodInventory: 'food_inventory',
  FamilyProfile: 'family_profiles',
  Visit: 'visits',
  Comment: 'comments',
  Supplier: 'suppliers',
  ShoppingList: 'shopping_list',
  Medication: 'medications',
  ConsumptionLog: 'consumption_logs',
  Recipe: 'recipes',
  CalendarEvent: 'calendar_events',
  PriceRecord: 'price_records',
  StoreReview: 'store_reviews',
  MealPlan: 'meal_plans',
  Pet: 'pets',
  ChatMessage: 'chat_messages',
  PetReminder: 'pet_reminders',
  PetExpense: 'pet_expenses',
  PetBudget: 'pet_budgets',
  SectionVisibility: 'section_visibility',
  Reward: 'rewards',
  Achievement: 'achievements',
  MemberAchievement: 'member_achievements',
  RewardRedemption: 'reward_redemptions',
};

// Create entity wrapper that mimics base44 API
function createEntityWrapper(entityName) {
  const tableName = TABLE_MAP[entityName];
  
  return {
    async list(sortBy = '-created_at', limit = 50) {
      return supabaseHelpers.list(tableName, sortBy, limit);
    },
    
    async filter(filters = {}, sortBy = '-created_at', limit = 50) {
      return supabaseHelpers.filter(tableName, filters, sortBy, limit);
    },
    
    async create(data) {
      return supabaseHelpers.create(tableName, data);
    },
    
    async bulkCreate(dataArray) {
      return supabaseHelpers.bulkCreate(tableName, dataArray);
    },
    
    async update(id, data) {
      return supabaseHelpers.update(tableName, id, data);
    },
    
    async delete(id) {
      return supabaseHelpers.delete(tableName, id);
    },
    
    subscribe(callback) {
      return supabaseHelpers.subscribe(tableName, callback);
    },
    
    async schema() {
      // Return empty schema - not needed for Supabase
      return {};
    }
  };
}

// Create db object that mimics base44 structure
export const db = {
  entities: {},
  auth: {
    async me() {
      const user = await supabaseHelpers.getCurrentUser();
      
      // ✅ إذا لم يكن هناك user، أرجع null بدلاً من رمي خطأ
      if (!user) {
        return null;
      }
      
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email,
        role: user.user_metadata?.role || 'user',
      };
    },
    
    async isAuthenticated() {
      try {
        const user = await supabaseHelpers.getCurrentUser();
        return !!user;
      } catch {
        return false;
      }
    },
    
    async updateMe(data) {
      await supabaseHelpers.updateProfile(data);
    },
    
    logout(redirectUrl) {
      return supabaseHelpers.signOut();
    },
    
    redirectToLogin(nextUrl) {
      // Redirect to Supabase auth
      window.location.href = '/login';
    }
  },
  users: {
    async inviteUser(email, role) {
      // This would need to be implemented with Supabase Auth Admin API
      console.warn('inviteUser not implemented for Supabase');
    }
  },
  integrations: {},
  analytics: {
    track(data) {
      console.log('Analytics track:', data);
    }
  }
};

// Populate entities
Object.keys(TABLE_MAP).forEach(entityName => {
  db.entities[entityName] = createEntityWrapper(entityName);
});

// Export for backwards compatibility
export { supabase } from './supabaseClient';