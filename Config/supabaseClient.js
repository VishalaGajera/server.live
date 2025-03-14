//project setting -> API 


import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://gohxhbwkwbuuxgqqppwq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvaHhoYndrd2J1dXhncXFwcHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NDgxMTcsImV4cCI6MjA1MTMyNDExN30.U5lVTyduZNskdOjrgq1rW1r-0ROgmLSxhCWR9c-fSfc";

export const supabase = createClient(supabaseUrl, supabaseKey);