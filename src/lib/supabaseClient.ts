import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Khởi tạo client, nếu chưa có key thực thì các lệnh gọi sẽ bị lỗi nhưng app không bị crash lúc build
export const supabase = createClient(supabaseUrl, supabaseKey);
