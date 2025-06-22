import axios from 'axios';
import store from '@/store';

const API_ORGS_URL = 'http://localhost:8000/api/organizations/';
const API_MEMBERSHIPS_URL = 'http://localhost:8000/api/organization-memberships/';

export interface Organization {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMembership {
  id: number;
  user: number;
  organization: number;
  role: string;
  is_admin: boolean;
  joined_at: string;
}

export const fetchOrganizations = async (): Promise<Organization[]> => {
  const token = store.getters.getToken;
  if (!token) throw new Error('No token available for API call');
  const response = await axios.get(API_ORGS_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchMyMemberships = async (): Promise<OrganizationMembership[]> => {
  const token = store.getters.getToken;
  if (!token) throw new Error('No token available for API call');
  const response = await axios.get(API_MEMBERSHIPS_URL + '?mine=true', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const joinOrganization = async (orgId: number): Promise<OrganizationMembership> => {
  const token = store.getters.getToken;
  if (!token) throw new Error('No token available for API call');
  const response = await axios.post(API_MEMBERSHIPS_URL, { organization: orgId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const leaveOrganization = async (membershipId: number): Promise<void> => {
  const token = store.getters.getToken;
  if (!token) throw new Error('No token available for API call');
  await axios.delete(API_MEMBERSHIPS_URL + membershipId + '/', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const switchOrganization = async (orgId: number): Promise<void> => {
  // This may be a backend session update or just a frontend state change
  // For now, just store in localStorage
  localStorage.setItem('activeOrganizationId', String(orgId));
};

export const fetchOrganizationMembers = async (orgId: number): Promise<OrganizationMembership[]> => {
  const token = store.getters.getToken;
  if (!token) throw new Error('No token available for API call');
  const response = await axios.get(API_MEMBERSHIPS_URL + '?organization=' + orgId, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateOrganizationMember = async (membershipId: number, data: Partial<OrganizationMembership>): Promise<OrganizationMembership> => {
  const token = store.getters.getToken;
  if (!token) throw new Error('No token available for API call');
  const response = await axios.patch(API_MEMBERSHIPS_URL + membershipId + '/', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createOrganization = async (org: { name: string; description?: string }): Promise<Organization> => {
  const token = store.getters.getToken;
  if (!token) throw new Error('No token available for API call');
  const response = await axios.post(API_ORGS_URL, org, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
