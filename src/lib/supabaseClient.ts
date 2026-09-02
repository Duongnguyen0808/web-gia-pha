import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
// Tự động xoá đuôi /rest/v1/ hoặc dấu / thừa nếu người dùng copy nhầm
supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Khởi tạo client, nếu chưa có key thực thì các lệnh gọi sẽ bị lỗi nhưng app không bị crash lúc build
export const supabase = createClient(supabaseUrl, supabaseKey);
