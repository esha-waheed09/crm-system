const BASE = '/api';

async function req(method, path, body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.message || 'Request failed');
  return json;
}

export const checkHealth          = () => req('GET', '/health');
export const getDashboardStats    = () => req('GET', '/reports/dashboard-stats');
export const getCampaignROI       = () => req('GET', '/reports/campaign-roi');
export const getLeadFunnel        = () => req('GET', '/reports/lead-funnel');
export const getRepPerformance    = () => req('GET', '/reports/rep-performance');
export const getAvgFeedback       = () => req('GET', '/reports/avg-feedback');
export const getUnresolved        = () => req('GET', '/reports/unresolved');
export const getConversionJourney = () => req('GET', '/reports/conversion-journey');
export const getLeads             = () => req('GET', '/leads');
export const createLead           = d  => req('POST',   '/leads', d);
export const updateLead           = (id,d) => req('PUT', `/leads/${id}`, d);
export const deleteLead           = id => req('DELETE', `/leads/${id}`);
export const convertLead          = id => req('POST',   `/leads/${id}/convert`);
export const getCustomers         = () => req('GET', '/customers');
export const getCampaigns         = () => req('GET', '/campaigns');
export const getPipelineStages    = () => req('GET', '/pipeline-stages');
export const getSalesReps         = () => req('GET', '/sales-reps');
export const getContacts          = () => req('GET', '/contacts');
export const createContact        = d  => req('POST', '/contacts', d);
export const getFeedback          = () => req('GET', '/feedback');
export const createFeedback       = d  => req('POST', '/feedback', d);
export const getComplaints        = () => req('GET', '/complaints');
export const createComplaint      = d  => req('POST', '/complaints', d);
export const resolveComplaint     = id => req('PATCH', `/complaints/${id}/resolve`);
export const getResolutions       = () => req('GET', '/resolutions');
export const getConversions       = () => req('GET', '/conversions');
