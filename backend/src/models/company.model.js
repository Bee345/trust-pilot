const supabase = require('../config/supabase');
const { NIGERIAN_PHONE_REGEX, REPORT_STATUS } = require('../constants');

async function searchEntities(query) {
  const base = supabase
    .from('reports')
    .select('phone, business_name, scam_type, risk_level, created_at')
    .neq('status', REPORT_STATUS.REJECTED)
    .limit(20);
  const { data, error } = await (NIGERIAN_PHONE_REGEX.test(query)
    ? base.eq('phone', query)
    : base.textSearch('search_vector', query));
  if (error) {throw error;}
  return data;
}

async function getVerifiedUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, phone, verification_type, trust_points, created_at')
    .eq('is_verified', true)
    .order('trust_points', { ascending: false });
  if (error) {throw error;}
  return data;
}

async function getVerifiedUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, phone, verification_type, trust_points, created_at')
    .eq('id', id)
    .eq('is_verified', true)
    .single();
  if (error) {throw error;}
  return data;
}

module.exports = { searchEntities, getVerifiedUsers, getVerifiedUserById };
