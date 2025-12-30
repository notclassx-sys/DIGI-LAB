
import { createClient } from '@supabase/supabase-js';

// Connection details provided by the user for the production environment
const supabaseUrl = 'https://jytavpcthkzxylpeskio.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dGF2cGN0aGt6eHlscGVza2lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMDY0NzYsImV4cCI6MjA4MjY4MjQ3Nn0.GKqjDTY_U8WogIUg-lHV4V-IqoO1V-IAsBOcxCNPruU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
