-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Expenses Table
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  expense_date DATE,
  payment_method TEXT DEFAULT 'نقدي',
  store_name TEXT,
  notes TEXT,
  receipt_image_url TEXT,
  linked_task_id UUID,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_type TEXT
);

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Budgets Table
CREATE TABLE budgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  category TEXT NOT NULL,
  monthly_limit NUMERIC NOT NULL,
  alert_percentage NUMERIC DEFAULT 80,
  month TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tasks Table
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'other',
  assigned_to TEXT,
  due_date DATE NOT NULL,
  progress NUMERIC DEFAULT 0,
  reminder_sent BOOLEAN DEFAULT FALSE
);

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sub Tasks Table
CREATE TABLE sub_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  parent_task_id UUID NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER
);

CREATE TRIGGER update_sub_tasks_updated_at BEFORE UPDATE ON sub_tasks 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Notifications Table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  related_task_id UUID,
  user_email TEXT NOT NULL
);

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Recurring Tasks Table
CREATE TABLE recurring_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  task_template_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'other',
  priority TEXT DEFAULT 'medium',
  assigned_to TEXT,
  recurrence_type TEXT NOT NULL,
  recurrence_interval INTEGER DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  last_generated_date DATE
);

CREATE TRIGGER update_recurring_tasks_updated_at BEFORE UPDATE ON recurring_tasks 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inventory Items Table
CREATE TABLE inventory_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  room TEXT,
  purchase_date DATE,
  purchase_price NUMERIC,
  current_value NUMERIC,
  warranty_expiry DATE,
  image_url TEXT,
  notes TEXT,
  suppliers JSONB
);

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DIY Projects Table
CREATE TABLE diy_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'مخطط',
  priority TEXT DEFAULT 'متوسطة',
  start_date DATE,
  target_date DATE,
  budget NUMERIC,
  actual_cost NUMERIC,
  materials JSONB,
  steps JSONB,
  tutorial_url TEXT,
  image_url TEXT
);

CREATE TRIGGER update_diy_projects_updated_at BEFORE UPDATE ON diy_projects 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Household Tasks Table
CREATE TABLE household_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  assigned_to TEXT,
  frequency TEXT DEFAULT 'مرة واحدة',
  due_date DATE,
  status TEXT DEFAULT 'معلقة',
  priority TEXT DEFAULT 'متوسطة',
  points NUMERIC DEFAULT 10,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT,
  recurrence_days JSONB
);

CREATE TRIGGER update_household_tasks_updated_at BEFORE UPDATE ON household_tasks 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Family Members Table
CREATE TABLE family_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  avatar_color TEXT,
  total_points NUMERIC DEFAULT 0,
  permission_level TEXT DEFAULT 'عضو',
  can_manage_tasks BOOLEAN DEFAULT TRUE,
  can_manage_medications BOOLEAN DEFAULT FALSE,
  can_manage_inventory BOOLEAN DEFAULT TRUE,
  can_manage_members BOOLEAN DEFAULT FALSE,
  level INTEGER DEFAULT 1
);

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Maintenance Table
CREATE TABLE maintenance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  item_name TEXT NOT NULL,
  item_id UUID,
  maintenance_type TEXT NOT NULL,
  frequency TEXT NOT NULL,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  notes TEXT,
  cost NUMERIC,
  status TEXT DEFAULT 'مجدولة',
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_days_before INTEGER DEFAULT 3
);

CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Schedules Table
CREATE TABLE schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  child_name TEXT NOT NULL,
  day_of_week TEXT,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  is_recurring BOOLEAN DEFAULT TRUE,
  specific_date DATE,
  notes TEXT,
  color TEXT,
  completed BOOLEAN DEFAULT FALSE,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_minutes_before INTEGER DEFAULT 30
);

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Plants Table
CREATE TABLE plants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  name TEXT NOT NULL,
  species TEXT,
  location TEXT,
  image_url TEXT,
  watering_frequency TEXT NOT NULL,
  last_watered DATE,
  next_watering DATE,
  sunlight_needs TEXT,
  fertilizing_frequency TEXT,
  last_fertilized DATE,
  next_fertilizing DATE,
  season TEXT,
  care_notes TEXT,
  health_status TEXT DEFAULT 'جيد',
  reminder_enabled BOOLEAN DEFAULT TRUE,
  acquired_date DATE
);

CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Notification Settings Table
CREATE TABLE notification_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT NOT NULL,
  task_reminders BOOLEAN DEFAULT TRUE,
  task_reminder_hours INTEGER DEFAULT 24,
  warranty_reminders BOOLEAN DEFAULT TRUE,
  warranty_reminder_days INTEGER DEFAULT 30,
  maintenance_reminders BOOLEAN DEFAULT TRUE,
  maintenance_reminder_days INTEGER DEFAULT 3,
  project_reminders BOOLEAN DEFAULT TRUE,
  project_reminder_days INTEGER DEFAULT 7,
  plant_reminders BOOLEAN DEFAULT TRUE,
  schedule_reminders BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  daily_summary BOOLEAN DEFAULT FALSE
);

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Food Inventory Table
CREATE TABLE food_inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  name TEXT NOT NULL,
  category TEXT,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  min_quantity NUMERIC,
  expiry_date DATE,
  storage_location TEXT,
  notes TEXT,
  image_url TEXT,
  preferred_supplier_id UUID,
  last_purchase_price NUMERIC,
  barcode TEXT
);

CREATE TRIGGER update_food_inventory_updated_at BEFORE UPDATE ON food_inventory 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Family Profiles Table
CREATE TABLE family_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  house_name TEXT NOT NULL,
  family_code TEXT NOT NULL,
  address TEXT,
  image_url TEXT
);

CREATE TRIGGER update_family_profiles_updated_at BEFORE UPDATE ON family_profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Visits Table
CREATE TABLE visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  visitor_name TEXT NOT NULL,
  destination TEXT,
  address TEXT,
  date DATE,
  time TEXT,
  notes TEXT,
  status TEXT DEFAULT 'مخطط'
);

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments Table
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  text TEXT NOT NULL,
  author_name TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL
);

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Suppliers Table
CREATE TABLE suppliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  google_maps_url TEXT,
  website TEXT,
  rating NUMERIC,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE
);

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Shopping List Table
CREATE TABLE shopping_list (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  name TEXT NOT NULL,
  category TEXT,
  quantity NUMERIC NOT NULL,
  unit TEXT,
  is_purchased BOOLEAN DEFAULT FALSE,
  preferred_supplier_id UUID,
  estimated_price NUMERIC,
  notes TEXT,
  food_inventory_id UUID
);

CREATE TRIGGER update_shopping_list_updated_at BEFORE UPDATE ON shopping_list 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Medications Table
CREATE TABLE medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  name TEXT NOT NULL,
  family_member TEXT NOT NULL,
  medication_type TEXT DEFAULT 'حبوب',
  dosage TEXT,
  frequency_type TEXT NOT NULL,
  times_per_day JSONB,
  interval_hours INTEGER,
  days_of_week JSONB,
  timing TEXT,
  start_date DATE,
  end_date DATE,
  quantity_remaining NUMERIC,
  notes TEXT,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Consumption Logs Table
CREATE TABLE consumption_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  food_item_id UUID,
  food_item_name TEXT,
  quantity_consumed NUMERIC,
  unit TEXT,
  consumed_date DATE DEFAULT CURRENT_DATE
);

CREATE TRIGGER update_consumption_logs_updated_at BEFORE UPDATE ON consumption_logs 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Recipes Table
CREATE TABLE recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB,
  instructions TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  image_url TEXT,
  category TEXT
);

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Calendar Events Table
CREATE TABLE calendar_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN DEFAULT FALSE,
  category TEXT,
  color TEXT,
  reminder_minutes INTEGER
);

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Price Records Table
CREATE TABLE price_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  product_name TEXT NOT NULL,
  supplier_id UUID,
  price NUMERIC NOT NULL,
  unit TEXT,
  recorded_date DATE DEFAULT CURRENT_DATE
);

CREATE TRIGGER update_price_records_updated_at BEFORE UPDATE ON price_records 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Store Reviews Table
CREATE TABLE store_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  store_name TEXT NOT NULL,
  supplier_id UUID,
  rating NUMERIC,
  review_text TEXT,
  reviewer_name TEXT
);

CREATE TRIGGER update_store_reviews_updated_at BEFORE UPDATE ON store_reviews 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Meal Plans Table
CREATE TABLE meal_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  recipe_id UUID,
  recipe_name TEXT,
  notes TEXT
);

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Pets Table
CREATE TABLE pets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  breed TEXT,
  birth_date DATE,
  gender TEXT,
  color TEXT,
  microchip_number TEXT,
  image_url TEXT,
  weight NUMERIC,
  vaccinations JSONB,
  medications JSONB,
  vet_name TEXT,
  vet_phone TEXT,
  feeding_schedule JSONB,
  last_vet_visit DATE,
  next_vet_visit DATE,
  next_grooming DATE,
  health_status TEXT DEFAULT 'جيد',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Chat Messages Table
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  message TEXT NOT NULL,
  sender_name TEXT,
  sender_email TEXT,
  image_url TEXT,
  message_type TEXT DEFAULT 'text',
  read_by JSONB
);

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Pet Reminders Table
CREATE TABLE pet_reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  pet_id UUID NOT NULL,
  reminder_type TEXT NOT NULL,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT
);

CREATE TRIGGER update_pet_reminders_updated_at BEFORE UPDATE ON pet_reminders 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Pet Expenses Table
CREATE TABLE pet_expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  pet_id UUID NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  expense_date DATE DEFAULT CURRENT_DATE
);

CREATE TRIGGER update_pet_expenses_updated_at BEFORE UPDATE ON pet_expenses 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Pet Budgets Table
CREATE TABLE pet_budgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  pet_id UUID NOT NULL,
  category TEXT NOT NULL,
  monthly_limit NUMERIC NOT NULL,
  month TEXT NOT NULL
);

CREATE TRIGGER update_pet_budgets_updated_at BEFORE UPDATE ON pet_budgets 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Section Visibility Table
CREATE TABLE section_visibility (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT NOT NULL,
  show_tasks BOOLEAN DEFAULT TRUE,
  show_gamification BOOLEAN DEFAULT TRUE,
  show_expenses BOOLEAN DEFAULT TRUE,
  show_inventory BOOLEAN DEFAULT TRUE,
  show_maintenance BOOLEAN DEFAULT TRUE,
  show_plants BOOLEAN DEFAULT TRUE,
  show_pets BOOLEAN DEFAULT TRUE,
  show_medications BOOLEAN DEFAULT TRUE
);

CREATE TRIGGER update_section_visibility_updated_at BEFORE UPDATE ON section_visibility 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Rewards Table
CREATE TABLE rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  title TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  icon TEXT,
  category TEXT,
  redemption_limit INTEGER,
  total_redeemed INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Achievements Table
CREATE TABLE achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  title TEXT NOT NULL,
  description TEXT,
  criteria_type TEXT NOT NULL,
  criteria_value INTEGER NOT NULL,
  bonus_points INTEGER DEFAULT 0,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Member Achievements Table
CREATE TABLE member_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  member_email TEXT NOT NULL,
  achievement_id UUID NOT NULL,
  earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_member_achievements_updated_at BEFORE UPDATE ON member_achievements 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Reward Redemptions Table
CREATE TABLE reward_redemptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  member_email TEXT NOT NULL,
  reward_id UUID NOT NULL,
  points_spent INTEGER NOT NULL,
  redemption_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);

CREATE TRIGGER update_reward_redemptions_updated_at BEFORE UPDATE ON reward_redemptions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE diy_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow authenticated users full access)
CREATE POLICY "Allow all for authenticated users" ON expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON budgets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON sub_tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON notifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON recurring_tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON inventory_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON diy_projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON household_tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON family_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON maintenance FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON schedules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON plants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON notification_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON food_inventory FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON family_profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON visits FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON comments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON shopping_list FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON medications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON consumption_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON recipes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON calendar_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON price_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON store_reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON meal_plans FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON pets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON chat_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON pet_reminders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON pet_expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON pet_budgets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON section_visibility FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON rewards FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON achievements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON member_achievements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON reward_redemptions FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_expenses_created_by ON expenses(created_by);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_notifications_user_email ON notifications(user_email);
CREATE INDEX idx_food_inventory_category ON food_inventory(category);
CREATE INDEX idx_shopping_list_is_purchased ON shopping_list(is_purchased);
CREATE INDEX idx_medications_family_member ON medications(family_member);
CREATE INDEX idx_pets_is_active ON pets(is_active);
CREATE INDEX idx_calendar_events_start_date ON calendar_events(start_date);