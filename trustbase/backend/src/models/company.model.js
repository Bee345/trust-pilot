const supabase = require('../config/supabase');

async function searchEntities(query) {
  const { data, error } = await supabase
    .from('reports')
    .select('phone, business_name, scam_type, risk_level, created_at')
    .or(`phone.ilike.%${query}%,business_name.ilike.%${query}%`)
    .eq('status', 'published')
    .limit(20);
  if (error) throw error;
  return data;
}

async function getVerifiedUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, phone, verification_type, trust_points, created_at')
    .eq('is_verified', true)
    .order('trust_points', { ascending: false });
  if (error) throw error;
  return data;
}

async function getVerifiedUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, phone, verification_type, trust_points, created_at')
    .eq('id', id)
    .eq('is_verified', true)
    .single();
  if (error) throw error;
  return data;
}

module.exports = { searchEntities, getVerifiedUsers, getVerifiedUserById };
