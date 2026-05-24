const supabase = require('../config/supabase');

async function createReport(data) {
  const { data: report, error } = await supabase
    .from('reports')
    .insert(data)
    .select()
    .single();
  if (error) {throw error;}
  return report;
}

async function getReportsByPhone(phone) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('phone', phone)
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  if (error) {throw error;}
  return data;
}

async function getRecentReports({ page = 1, limit = 20 } = {}) {
  const from = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from('reports')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);
  if (error) {throw error;}
  return { reports: data, total: count };
}

async function upvoteReport(reportId, userId) {
  const { error } = await supabase
    .from('report_upvotes')
    .upsert({ report_id: reportId, user_id: userId });
  if (error) {throw error;}
}

async function getUpvoteCount(reportId) {
  const { count, error } = await supabase
    .from('report_upvotes')
    .select('*', { count: 'exact', head: true })
    .eq('report_id', reportId);
  if (error) {throw error;}
  return count;
}

async function getReportsByUser(userId) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('reporter_id', userId)
    .order('created_at', { ascending: false });
  if (error) {throw error;}
  return data;
}

module.exports = { createReport, getReportsByPhone, getRecentReports, upvoteReport, getUpvoteCount, getReportsByUser };
