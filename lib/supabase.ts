import { createClient } from '@supabase/supabase-js';

// Connection Configuration - Final Force Sync
// This file is the single source of truth for the Supabase connection.

const supabaseUrl = 'https://jeglpmxypjdkafmcuabi.supabase.co';
const supabaseAnonKey = 'sb_publishable_vnDIvJpLXR0S_TUY396jBw_bcN9vR4h';

// Initialize the client directly with literals to bypass .env issues
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
