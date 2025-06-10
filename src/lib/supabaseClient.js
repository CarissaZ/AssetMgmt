// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://xphawlmihpxcyhnoqyti.supabase.co';
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwaGF3bG1paHB4Y3lobm9xeXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTAyOTAsImV4cCI6MjA2MzY2NjI5MH0.a60m08d7fRxZn23vTCTQbUpMH9BXe5LjNSaVn5f0sHg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
