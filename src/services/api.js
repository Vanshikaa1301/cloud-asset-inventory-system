const API_BASE_URL = 'http://3.25.203.112:5000/api';

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(`Backend returned an invalid response (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export async function getInventory() {
  return apiRequest('/assets/inventory');
}

export async function getAsset(assetId) {
  return apiRequest(`/assets/${encodeURIComponent(assetId)}`);
}

export async function scanAllAssets() {
  return apiRequest('/assets/scan', {
    method: 'POST',
  });
}

export async function loginUser(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function registerUser(name, email, password) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
}

export async function getAssetStatistics() {
  return apiRequest('/assets/statistics');
}

export async function getActivityLogs() {
  return apiRequest('/activity');
}

export async function getSecurityFindings() {
  return apiRequest('/security/findings');
}

export async function getSecurityFinding(findingId) {
  return apiRequest(
    `/security/findings/${encodeURIComponent(findingId)}`
  );
}

export async function resolveSecurityFinding(
  findingId,
  resolvedBy = 'System',
  resolutionNote = ''
) {
  return apiRequest(
    `/security/findings/${encodeURIComponent(findingId)}/resolve`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        resolvedBy,
        resolutionNote,
      }),
    }
  );
}
