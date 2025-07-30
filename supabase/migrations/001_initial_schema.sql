-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE pathway_type AS ENUM ('A', 'B');
CREATE TYPE cpd_category AS ENUM ('mandatory', 'continuing_competence', 'education', 'other');
CREATE TYPE activity_type AS ENUM ('course', 'conference', 'workshop', 'webinar', 'reading', 'research', 'other');
CREATE TYPE document_category AS ENUM (
  'academic_transcripts',
  'certificates',
  'cv_resume',
  'statement_of_service',
  'cpd_evidence',
  'supervisor_references',
  'identity_documents',
  'criminal_history_check',
  'english_proficiency',
  'portfolio_evidence',
  'other'
);
CREATE TYPE competency_level AS ENUM ('developing', 'proficient', 'advanced', 'expert');
CREATE TYPE milestone_type AS ENUM (
  'registration_current',
  'masters_enrolled',
  'masters_completed',
  'practice_hours_started',
  'practice_hours_50_percent',
  'practice_hours_completed',
  'cpd_requirements_met',
  'documents_uploaded',
  'portfolio_completed',
  'supervisor_verification',
  'ready_for_submission',
  'application_submitted',
  'endorsement_received'
);
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  pathway pathway_type,
  current_role VARCHAR,
  workplace VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practice hours tracking
CREATE TABLE public.practice_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  hours DECIMAL(6,2) NOT NULL CHECK (hours > 0),
  workplace VARCHAR NOT NULL,
  department VARCHAR,
  position VARCHAR NOT NULL,
  supervisor_name VARCHAR NOT NULL,
  supervisor_email VARCHAR,
  supervisor_phone VARCHAR,
  description TEXT,
  is_advanced_practice BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CPD records
CREATE TABLE public.cpd_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  provider VARCHAR,
  category cpd_category NOT NULL,
  activity_type activity_type NOT NULL,
  hours_earned DECIMAL(4,2) NOT NULL CHECK (hours_earned > 0),
  completion_date DATE NOT NULL,
  expiry_date DATE,
  description TEXT,
  learning_outcomes TEXT,
  reflection TEXT,
  certificate_url VARCHAR,
  evidence_url VARCHAR,
  registration_period VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document management
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category document_category NOT NULL,
  file_name VARCHAR NOT NULL,
  original_file_name VARCHAR NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0),
  mime_type VARCHAR NOT NULL,
  file_url VARCHAR NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  is_submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competency assessments
CREATE TABLE public.competency_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  competency_area VARCHAR NOT NULL,
  evidence_description TEXT NOT NULL,
  reflective_statement TEXT,
  competency_level competency_level NOT NULL,
  assessment_date DATE NOT NULL,
  assessor_name VARCHAR,
  assessor_role VARCHAR,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress milestones
CREATE TABLE public.progress_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  milestone_type milestone_type NOT NULL,
  status progress_status DEFAULT 'not_started',
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, milestone_type)
);

-- Activity log
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action VARCHAR NOT NULL,
  entity_type VARCHAR NOT NULL,
  entity_id VARCHAR,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_practice_hours_user_id ON public.practice_hours(user_id);
CREATE INDEX idx_practice_hours_dates ON public.practice_hours(start_date, end_date);
CREATE INDEX idx_cpd_records_user_id ON public.cpd_records(user_id);
CREATE INDEX idx_cpd_records_period ON public.cpd_records(registration_period);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_category ON public.documents(category);
CREATE INDEX idx_competency_assessments_user_id ON public.competency_assessments(user_id);
CREATE INDEX idx_progress_milestones_user_id ON public.progress_milestones(user_id);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_practice_hours
  BEFORE UPDATE ON public.practice_hours
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_cpd_records
  BEFORE UPDATE ON public.cpd_records
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_documents
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_competency_assessments
  BEFORE UPDATE ON public.competency_assessments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_progress_milestones
  BEFORE UPDATE ON public.progress_milestones
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpd_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Practice hours policies
CREATE POLICY "Users can view own practice hours" ON public.practice_hours
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice hours" ON public.practice_hours
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own practice hours" ON public.practice_hours
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own practice hours" ON public.practice_hours
  FOR DELETE USING (auth.uid() = user_id);

-- CPD records policies
CREATE POLICY "Users can view own CPD records" ON public.cpd_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CPD records" ON public.cpd_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CPD records" ON public.cpd_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own CPD records" ON public.cpd_records
  FOR DELETE USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Competency assessments policies
CREATE POLICY "Users can view own assessments" ON public.competency_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments" ON public.competency_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments" ON public.competency_assessments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments" ON public.competency_assessments
  FOR DELETE USING (auth.uid() = user_id);

-- Progress milestones policies
CREATE POLICY "Users can view own milestones" ON public.progress_milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones" ON public.progress_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones" ON public.progress_milestones
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones" ON public.progress_milestones
  FOR DELETE USING (auth.uid() = user_id);

-- Activity log policies
CREATE POLICY "Users can view own activity" ON public.activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON public.activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();