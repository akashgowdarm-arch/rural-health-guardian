const API_BASE = 'http://localhost:4000/api';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('launchflow_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => apiRequest('/auth/me'),

  // Tunnels & Localhost Probe
  getTunnelStatus: () => apiRequest('/tunnels/status'),
  probeLocalhost: (port: number, path: string = '/') => apiRequest('/tunnels/probe', { method: 'POST', body: JSON.stringify({ port, path }) }),

  // Repositories
  getRepositories: () => apiRequest('/repositories'),
  createRepository: (data: any) => apiRequest('/repositories', { method: 'POST', body: JSON.stringify(data) }),

  // Analysis
  analyzeProject: (path?: string) => apiRequest('/projects/analyze', { method: 'POST', body: JSON.stringify({ path }) }),

  // Projects
  getProjects: () => apiRequest('/projects'),
  getProject: (id: string) => apiRequest(`/projects/${id}`),
  createProject: (data: any) => apiRequest('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, updates: any) => apiRequest(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteProject: (id: string) => apiRequest(`/projects/${id}`, { method: 'DELETE' }),

  // Environment Variables
  getEnvironment: (projectId: string, reveal: boolean = false) => apiRequest(`/projects/${projectId}/environment?reveal=${reveal}`),
  setEnvironment: (projectId: string, data: { key: string; value: string; category?: string; isSecret?: boolean }) =>
    apiRequest(`/projects/${projectId}/environment`, { method: 'POST', body: JSON.stringify(data) }),
  deleteEnvironment: (projectId: string, key: string) => apiRequest(`/projects/${projectId}/environment/${key}`, { method: 'DELETE' }),

  // Builds
  triggerBuild: (projectId: string, data?: any) => apiRequest(`/projects/${projectId}/build`, { method: 'POST', body: JSON.stringify(data || {}) }),
  getBuild: (id: string) => apiRequest(`/builds/${id}`),

  // Previews
  getPreview: (deploymentId: string) => apiRequest(`/deployments/${deploymentId}/preview`),

  // Readiness Engine
  runReadiness: (projectId: string, deploymentId?: string) => apiRequest(`/projects/${projectId}/readiness`, { method: 'POST', body: JSON.stringify({ deploymentId }) }),
  getReadinessHistory: (projectId: string) => apiRequest(`/projects/${projectId}/readiness/history`),

  // Production Deployment
  deploy: (projectId: string, deploymentId?: string) => apiRequest(`/projects/${projectId}/deploy`, { method: 'POST', body: JSON.stringify({ deploymentId }) }),
  getDeployments: (projectId: string) => apiRequest(`/projects/${projectId}/deployments`),
  rollback: (projectId: string, targetDeploymentId: string) => apiRequest(`/projects/${projectId}/rollback`, { method: 'POST', body: JSON.stringify({ targetDeploymentId }) }),

  // Monitoring
  getMonitoring: (projectId: string) => apiRequest(`/projects/${projectId}/monitoring`),

  // Domains
  getDomains: (projectId: string) => apiRequest(`/projects/${projectId}/domains`),
  addDomain: (projectId: string, domain: string, isCustom: boolean = false) => apiRequest(`/projects/${projectId}/domains`, { method: 'POST', body: JSON.stringify({ domain, isCustom }) }),
};
