<template>
  <div class="settings-view max-w-xl mx-auto mt-10 p-8 bg-white rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-6 text-primary">Settings</h1>
    <div class="mb-8 text-gray-600">Update your account settings below.</div>
    <form @submit.prevent="saveSettings">
      <FormInput id="firstName" label="First Name" v-model="firstName" type="text" required />
      <FormInput id="lastName" label="Last Name" v-model="lastName" type="text" required />
      <FormInput id="email" label="Email" v-model="email" type="email" required />
      <FormInput id="password" label="Change Password" v-model="password" type="password" placeholder="New password (leave blank to keep current)" />
      <div class="flex gap-4">
        <button type="submit" class="settings-save-btn">Save Changes</button>
        <span v-if="success" class="text-green-600 self-center">{{ success }}</span>
        <span v-if="error" class="text-red-600 self-center">{{ error }}</span>
      </div>
    </form>
    <hr class="my-8" />
    <div class="appearance-section mb-6">
      <h2 class="text-lg font-semibold mb-3">Appearance</h2>
      <div class="flex items-center gap-4">
        <span>Theme:</span>
        <button @click="toggleTheme" class="theme-toggle-btn" :aria-pressed="isDarkMode">
          <span v-if="isDarkMode">🌙 Dark</span>
          <span v-else>☀️ Light</span>
        </button>
        <span class="text-gray-500 text-sm">(applies instantly)</span>
      </div>
    </div>
    <div class="mb-8">
      <h2 class="text-lg font-semibold mb-3">Login Activity</h2>
      <div v-if="loginActivity.length === 0" class="text-gray-500">No recent login activity found.</div>
      <table v-else class="min-w-full text-sm border rounded">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 py-1 text-left">Time</th>
            <th class="px-2 py-1 text-left">IP</th>
            <th class="px-2 py-1 text-left">Status</th>
            <th class="px-2 py-1 text-left">Device</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activity in loginActivity" :key="activity.id">
            <td class="px-2 py-1">{{ new Date(activity.timestamp).toLocaleString() }}</td>
            <td class="px-2 py-1">{{ activity.ip_address || 'N/A' }}</td>
            <td class="px-2 py-1">{{ activity.status }}</td>
            <td class="px-2 py-1 truncate max-w-xs" :title="activity.user_agent">{{ activity.user_agent.slice(0, 32) }}<span v-if="activity.user_agent.length > 32">...</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mb-8">
      <h2 class="text-lg font-semibold mb-3">API Keys</h2>
      <form @submit.prevent="handleCreateApiKey" class="flex gap-2 mb-4">
        <input v-model="newApiKeyName" type="text" placeholder="API Key Name" class="input" required />
        <button type="submit" class="settings-save-btn">Create</button>
      </form>
      <div v-if="apiKeySuccess" class="text-green-600 mb-2">{{ apiKeySuccess }}</div>
      <div v-if="apiKeyError" class="text-red-600 mb-2">{{ apiKeyError }}</div>
      <div v-if="apiKeyCreated" class="mb-2">
        <span class="font-mono bg-gray-100 px-2 py-1 rounded">{{ apiKeyCreated.key }}</span>
        <span class="text-xs text-gray-500 ml-2">Copy and store this key now. It won't be shown again.</span>
      </div>
      <table v-if="apiKeys.length" class="min-w-full text-sm border rounded">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 py-1 text-left">Name</th>
            <th class="px-2 py-1 text-left">Key</th>
            <th class="px-2 py-1 text-left">Created</th>
            <th class="px-2 py-1 text-left">Last Used</th>
            <th class="px-2 py-1 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="key in apiKeys" :key="key.id">
            <td class="px-2 py-1">{{ key.name }}</td>
            <td class="px-2 py-1 font-mono">****{{ key.key.slice(-6) }}</td>
            <td class="px-2 py-1">{{ new Date(key.created_at).toLocaleString() }}</td>
            <td class="px-2 py-1">{{ key.last_used_at ? new Date(key.last_used_at).toLocaleString() : 'Never' }}</td>
            <td class="px-2 py-1">
              <button @click="handleRevokeApiKey(key.id)" class="text-red-600 underline text-xs">Revoke</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="text-gray-500">No API keys found.</div>
    </div>
    <div class="feedback-section">
      <h2 class="text-lg font-semibold mb-3">Feedback</h2>
      <form @submit.prevent="handleSubmitFeedback" class="flex flex-col gap-4">
        <textarea v-model="feedbackMessage" placeholder="Your feedback..." class="input h-24 resize-none" required></textarea>
        <input v-model="feedbackEmail" type="email" placeholder="Your email (optional)" class="input" />
        <button type="submit" class="settings-save-btn">Submit Feedback</button>
        <div v-if="feedbackSuccess" class="text-green-600 text-sm">{{ feedbackSuccess }}</div>
        <div v-if="feedbackError" class="text-red-600 text-sm">{{ feedbackError }}</div>
      </form>
    </div>
    <div class="account-section mt-10">
      <h2 class="text-lg font-semibold mb-3">Account Actions</h2>
      <div class="flex flex-col gap-4">
        <button @click="handleDownloadData" class="settings-save-btn w-fit">Download My Data</button>
        <div v-if="downloadError" class="text-red-600 text-sm">{{ downloadError }}</div>
        <div v-if="downloadSuccess" class="text-green-600 text-sm">{{ downloadSuccess }}</div>
        <button @click="showDeleteConfirm = true" class="settings-save-btn w-fit bg-red-600 hover:bg-red-700" style="margin-top:1rem;">Delete My Account</button>
        <div v-if="deleteError" class="text-red-600 text-sm">{{ deleteError }}</div>
      </div>
      <dialog v-if="showDeleteConfirm" open class="delete-confirm-modal">
        <div class="modal-content">
          <h3 class="font-bold text-lg mb-2">Confirm Account Deletion</h3>
          <p class="mb-4">Are you sure you want to delete your account? This action is <span class="text-red-600 font-semibold">permanent</span> and cannot be undone.</p>
          <div class="flex gap-4">
            <button @click="handleDeleteAccount" class="settings-save-btn bg-red-600 hover:bg-red-700">Yes, Delete</button>
            <button @click="showDeleteConfirm = false" class="settings-save-btn bg-gray-300 text-gray-800 hover:bg-gray-400">Cancel</button>
          </div>
        </div>
      </dialog>
    </div>
    <div class="delegate-section mt-10">
      <h2 class="text-lg font-semibold mb-3">Delegate/Proxy Access</h2>
      <div v-if="delegateError" class="text-red-600 text-sm mb-2">{{ delegateError }}</div>
      <div v-if="delegates.length === 0" class="text-gray-500 mb-2">No delegates added yet.</div>
      <table v-if="delegates.length" class="min-w-full text-sm border rounded mb-4">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 py-1 text-left">Delegate</th>
            <th class="px-2 py-1 text-left">Permissions</th>
            <th class="px-2 py-1 text-left">Status</th>
            <th class="px-2 py-1 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in delegates" :key="d.id">
            <td class="px-2 py-1">{{ d.delegate_username }}</td>
            <td class="px-2 py-1">
              <span v-if="d.can_manage_schedule">Manage Schedule</span>
              <span v-if="d.can_view_data">, View Data</span>
              <span v-if="d.can_act_as_user">, Act as User</span>
            </td>
            <td class="px-2 py-1">{{ d.revoked ? 'Revoked' : 'Active' }}</td>
            <td class="px-2 py-1">
              <button v-if="!d.revoked" @click="handleRevokeDelegate(d.id)" class="text-red-600 underline text-xs">Revoke</button>
            </td>
          </tr>
        </tbody>
      </table>
      <form @submit.prevent="handleAddDelegate" class="flex flex-col gap-2 mb-2">
        <label class="font-semibold">Add Delegate</label>
        <input v-model="delegateSearch" @input="searchUsers" type="text" placeholder="Search user by username or email..." class="input" />
        <div v-if="userSearchResults.length" class="bg-gray-50 border rounded p-2 mb-2">
          <div v-for="u in userSearchResults" :key="u.id" class="flex items-center gap-2 mb-1">
            <label>
              <input type="radio" v-model="selectedDelegateId" :value="u.id" />
              {{ u.username }} <span class="text-xs text-gray-500">({{ u.email }})</span>
            </label>
          </div>
        </div>
        <div class="flex gap-4 mb-2">
          <label><input type="checkbox" v-model="addPerms.manage" /> Manage Schedule</label>
          <label><input type="checkbox" v-model="addPerms.view" /> View Data</label>
          <label><input type="checkbox" v-model="addPerms.act" /> Act as User</label>
        </div>
        <button type="submit" class="settings-save-btn w-fit">Add Delegate</button>
      </form>
      <div v-if="delegateSuccess" class="text-green-600 text-sm">{{ delegateSuccess }}</div>
    </div>
    <div class="organization-section mt-10">
      <h2 class="text-lg font-semibold mb-3">Organization Management</h2>
      <div v-if="orgError" class="text-red-600 text-sm mb-2">{{ orgError }}</div>
      <div v-if="myMemberships.length === 0" class="text-gray-500 mb-2">You are not a member of any organization.</div>
      <div v-else>
        <div class="mb-2">
          <span class="font-semibold">Current Organization:</span>
          <span v-if="activeOrg">{{ activeOrg.name }}</span>
          <span v-else class="text-gray-500">(none selected)</span>
        </div>
        <div class="mb-2">
          <label for="org-switch" class="font-semibold">Switch Organization:</label>
          <select id="org-switch" v-model="selectedOrgId" @change="handleSwitchOrg" class="input w-auto ml-2">
            <option v-for="m in myMemberships" :key="m.organization" :value="m.organization">{{ getOrgName(m.organization) }}</option>
          </select>
        </div>
        <div class="mb-2">
          <button @click="handleLeaveOrg" class="settings-save-btn w-fit bg-red-600 hover:bg-red-700" v-if="activeMembership && !activeMembership.is_admin">Leave Organization</button>
        </div>
        <div v-if="activeMembership && activeMembership.is_admin" class="mt-4">
          <h3 class="font-semibold mb-2">Organization Members</h3>
          <table v-if="orgMembers.length" class="min-w-full text-sm border rounded mb-2">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-2 py-1 text-left">User</th>
                <th class="px-2 py-1 text-left">Role</th>
                <th class="px-2 py-1 text-left">Admin</th>
                <th class="px-2 py-1 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in orgMembers" :key="m.id">
                <td class="px-2 py-1">{{ getUserName(m.user) }}</td>
                <td class="px-2 py-1">{{ m.role }}</td>
                <td class="px-2 py-1">{{ m.is_admin ? 'Yes' : 'No' }}</td>
                <td class="px-2 py-1">
                  <button v-if="!m.is_admin" @click="makeAdmin(m.id)" class="text-blue-600 underline text-xs">Make Admin</button>
                  <button v-if="!isSelf(m.user)" @click="removeMember(m.id)" class="text-red-600 underline text-xs ml-2">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="mt-4">
        <h3 class="font-semibold mb-2">Join Organization</h3>
        <select v-model="joinOrgId" class="input w-auto mr-2">
          <option value="">Select organization...</option>
          <option v-for="org in availableOrgs" :key="org.id" :value="org.id">{{ org.name }}</option>
        </select>
        <button @click="handleJoinOrg" class="settings-save-btn w-fit">Join</button>
      </div>
      <div class="mt-4">
        <h3 class="font-semibold mb-2">Create Organization</h3>
        <input v-model="newOrgName" type="text" placeholder="Organization Name" class="input w-auto mr-2" />
        <input v-model="newOrgDesc" type="text" placeholder="Description (optional)" class="input w-auto mr-2" />
        <button @click="handleCreateOrg" class="settings-save-btn w-fit">Create</button>
      </div>
      <div v-if="orgSuccess" class="text-green-600 text-sm mt-2">{{ orgSuccess }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import FormInput from '@/components/FormElements/FormInput.vue';
import axios from 'axios';
import { getUserPreferences, updateUserPreferences } from '@/services/preferencesService';
import { fetchLoginActivity, LoginActivity } from '@/services/loginActivityService';
import { fetchApiKeys, createApiKey, revokeApiKey, ApiKey } from '@/services/apiKeyService';
import { submitFeedback } from '@/services/feedbackService';
import { downloadUserData, deleteAccount } from '@/services/accountService';
import { fetchDelegates, addDelegate, revokeDelegate, type DelegateAccess } from '@/services/delegateService';
import { fetchUsers, type User } from '@/services/userService';
import {
  fetchOrganizations,
  fetchMyMemberships,
  joinOrganization,
  leaveOrganization,
  switchOrganization,
  fetchOrganizationMembers,
  updateOrganizationMember,
  createOrganization,
  type Organization,
  type OrganizationMembership
} from '@/services/organizationService';

const store = useStore();
const token = computed(() => store.state.token);
const user = computed(() => store.state.user);
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const success = ref('');
const error = ref('');
const isDarkMode = ref(false);
const loginActivity = ref<LoginActivity[]>([]);
const apiKeys = ref<ApiKey[]>([]);
const newApiKeyName = ref('');
const apiKeyError = ref('');
const apiKeySuccess = ref('');
const apiKeyCreated = ref<ApiKey | null>(null);
const feedbackMessage = ref('');
const feedbackEmail = ref('');
const feedbackSuccess = ref('');
const feedbackError = ref('');
const showDeleteConfirm = ref(false);
const deleteError = ref('');
const downloadError = ref('');
const downloadSuccess = ref('');
const delegates = ref<DelegateAccess[]>([]);
const delegateError = ref('');
const delegateSuccess = ref('');
const delegateSearch = ref('');
const userSearchResults = ref<User[]>([]);
const selectedDelegateId = ref<number|null>(null);
const addPerms = ref({ manage: false, view: true, act: false });
const orgError = ref('');
const orgSuccess = ref('');
const organizations = ref<Organization[]>([]);
const myMemberships = ref<OrganizationMembership[]>([]);
const orgMembers = ref<OrganizationMembership[]>([]);
const selectedOrgId = ref<number|null>(null);
const joinOrgId = ref<number|null>(null);
const newOrgName = ref('');
const newOrgDesc = ref('');

const activeOrgId = computed(() => Number(localStorage.getItem('activeOrganizationId')) || (myMemberships.value[0]?.organization ?? null));
const activeOrg = computed(() => organizations.value.find(o => o.id === activeOrgId.value));
const activeMembership = computed(() => myMemberships.value.find(m => m.organization === activeOrgId.value));
const availableOrgs = computed(() => organizations.value.filter(o => !myMemberships.value.some(m => m.organization === o.id)));

const applyTheme = (dark: boolean) => {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  isDarkMode.value = dark;
};

const loadThemePreference = async () => {
  if (!token.value) return;
  try {
    const prefs = await getUserPreferences(token.value);
    if (prefs.theme === 'dark') applyTheme(true);
    else applyTheme(false);
  } catch (e) {
    applyTheme(false);
  }
};

const saveThemePreference = async (dark: boolean) => {
  if (!token.value) return;
  try {
    await updateUserPreferences({ theme: dark ? 'dark' : 'light' }, token.value);
  } catch (e) {}
};

const toggleTheme = async () => {
  const newDark = !isDarkMode.value;
  applyTheme(newDark);
  await saveThemePreference(newDark);
};

const fetchProfile = async () => {
  if (!token.value) return;
  try {
    const res = await axios.get('/api/users/me/', { headers: { Authorization: `Bearer ${token.value}` } });
    firstName.value = res.data.first_name || '';
    lastName.value = res.data.last_name || '';
    email.value = res.data.email || '';
  } catch (e) {}
};

const saveSettings = async () => {
  if (!token.value) return;
  try {
    await axios.put('/api/users/me/', {
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      password: password.value || undefined,
    }, { headers: { Authorization: `Bearer ${token.value}` } });
    success.value = 'Settings updated!';
    error.value = '';
    password.value = '';
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to update settings.';
    success.value = '';
  }
};

const loadLoginActivity = async () => {
  if (!token.value) return;
  try {
    loginActivity.value = await fetchLoginActivity(token.value);
  } catch (e) {
    loginActivity.value = [];
  }
};

const loadApiKeys = async () => {
  if (!token.value) return;
  try {
    apiKeys.value = await fetchApiKeys(token.value);
  } catch (e) {
    apiKeys.value = [];
  }
};

const handleCreateApiKey = async () => {
  if (!token.value || !newApiKeyName.value) return;
  try {
    const key = await createApiKey(newApiKeyName.value, token.value);
    apiKeyCreated.value = key;
    apiKeySuccess.value = 'API key created!';
    apiKeyError.value = '';
    newApiKeyName.value = '';
    await loadApiKeys();
  } catch (e: any) {
    apiKeyError.value = e?.response?.data?.detail || 'Failed to create API key.';
    apiKeySuccess.value = '';
  }
};

const handleRevokeApiKey = async (id: number) => {
  if (!token.value) return;
  try {
    await revokeApiKey(id, token.value);
    apiKeySuccess.value = 'API key revoked.';
    apiKeyError.value = '';
    await loadApiKeys();
  } catch (e: any) {
    apiKeyError.value = e?.response?.data?.detail || 'Failed to revoke API key.';
    apiKeySuccess.value = '';
  }
};

const handleSubmitFeedback = async () => {
  if (!token.value || !feedbackMessage.value) return;
  try {
    await submitFeedback(feedbackMessage.value, feedbackEmail.value, token.value);
    feedbackSuccess.value = 'Feedback submitted! Thank you.';
    feedbackError.value = '';
    feedbackMessage.value = '';
  } catch (e: any) {
    feedbackError.value = e?.response?.data?.detail || 'Failed to submit feedback.';
    feedbackSuccess.value = '';
  }
};

const handleDownloadData = async () => {
  downloadError.value = '';
  downloadSuccess.value = '';
  try {
    const blob = await downloadUserData();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_data.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    downloadSuccess.value = 'Your data has been downloaded.';
  } catch (e: any) {
    downloadError.value = e?.message || 'Failed to download data.';
  }
};

const handleDeleteAccount = async () => {
  deleteError.value = '';
  try {
    await deleteAccount();
    showDeleteConfirm.value = false;
    // Log out user and redirect to login page
    store.commit('logout');
    window.location.href = '/login';
  } catch (e: any) {
    deleteError.value = e?.message || 'Failed to delete account.';
  }
};

const loadDelegates = async () => {
  try {
    delegates.value = await fetchDelegates();
  } catch (e: any) {
    delegates.value = [];
    delegateError.value = e?.message || 'Failed to load delegates.';
  }
};

const searchUsers = async () => {
  delegateError.value = '';
  userSearchResults.value = [];
  if (!delegateSearch.value) return;
  try {
    const all = await fetchUsers(token.value);
    userSearchResults.value = all.filter(u =>
      (u.username && u.username.toLowerCase().includes(delegateSearch.value.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(delegateSearch.value.toLowerCase()))
    );
  } catch (e: any) {
    delegateError.value = e?.message || 'Failed to search users.';
  }
};

const handleAddDelegate = async () => {
  delegateError.value = '';
  delegateSuccess.value = '';
  if (!selectedDelegateId.value) {
    delegateError.value = 'Please select a user.';
    return;
  }
  try {
    await addDelegate(selectedDelegateId.value, {
      can_manage_schedule: addPerms.value.manage,
      can_view_data: addPerms.value.view,
      can_act_as_user: addPerms.value.act,
    });
    delegateSuccess.value = 'Delegate added!';
    delegateSearch.value = '';
    userSearchResults.value = [];
    selectedDelegateId.value = null;
    addPerms.value = { manage: false, view: true, act: false };
    await loadDelegates();
  } catch (e: any) {
    delegateError.value = e?.message || 'Failed to add delegate.';
  }
};

const handleRevokeDelegate = async (id: number) => {
  delegateError.value = '';
  try {
    await revokeDelegate(id);
    await loadDelegates();
  } catch (e: any) {
    delegateError.value = e?.message || 'Failed to revoke delegate.';
  }
};

const loadOrganizations = async () => {
  orgError.value = '';
  try {
    organizations.value = await fetchOrganizations();
    myMemberships.value = await fetchMyMemberships();
    if (!activeOrgId.value && myMemberships.value.length) {
      selectedOrgId.value = myMemberships.value[0].organization;
      switchOrganization(selectedOrgId.value);
    } else {
      selectedOrgId.value = activeOrgId.value;
    }
    if (selectedOrgId.value) await loadOrgMembers();
  } catch (e: any) {
    orgError.value = e?.message || 'Failed to load organizations.';
  }
};

const loadOrgMembers = async () => {
  orgMembers.value = [];
  if (!selectedOrgId.value) return;
  try {
    orgMembers.value = await fetchOrganizationMembers(selectedOrgId.value);
  } catch (e: any) {
    orgMembers.value = [];
  }
};

const handleSwitchOrg = async () => {
  if (!selectedOrgId.value) return;
  switchOrganization(selectedOrgId.value);
  await loadOrgMembers();
};

const handleJoinOrg = async () => {
  orgError.value = '';
  orgSuccess.value = '';
  if (!joinOrgId.value) return;
  try {
    await joinOrganization(joinOrgId.value);
    orgSuccess.value = 'Joined organization!';
    joinOrgId.value = null;
    await loadOrganizations();
  } catch (e: any) {
    orgError.value = e?.message || 'Failed to join organization.';
  }
};

const handleLeaveOrg = async () => {
  orgError.value = '';
  orgSuccess.value = '';
  if (!activeMembership.value) return;
  try {
    await leaveOrganization(activeMembership.value.id);
    orgSuccess.value = 'Left organization.';
    await loadOrganizations();
  } catch (e: any) {
    orgError.value = e?.message || 'Failed to leave organization.';
  }
};

const handleCreateOrg = async () => {
  orgError.value = '';
  orgSuccess.value = '';
  if (!newOrgName.value) return;
  try {
    await createOrganization({ name: newOrgName.value, description: newOrgDesc.value });
    orgSuccess.value = 'Organization created!';
    newOrgName.value = '';
    newOrgDesc.value = '';
    await loadOrganizations();
  } catch (e: any) {
    orgError.value = e?.message || 'Failed to create organization.';
  }
};

const makeAdmin = async (membershipId: number) => {
  orgError.value = '';
  try {
    await updateOrganizationMember(membershipId, { is_admin: true });
    await loadOrgMembers();
  } catch (e: any) {
    orgError.value = e?.message || 'Failed to update member.';
  }
};

const removeMember = async (membershipId: number) => {
  orgError.value = '';
  try {
    await leaveOrganization(membershipId);
    await loadOrgMembers();
  } catch (e: any) {
    orgError.value = e?.message || 'Failed to remove member.';
  }
};

const getOrgName = (orgId: number) => organizations.value.find(o => o.id === orgId)?.name || orgId;
const getUserName = (userId: number) => {
  // Try to get from store.state.users if available, else fallback to userId
  const user = store.state.users?.find?.((u: any) => u.id === userId);
  return user ? (user.first_name + ' ' + user.last_name) : userId;
};
const isSelf = (userId: number) => user.value?.id === userId;

onMounted(() => {
  fetchProfile();
  loadThemePreference();
  loadLoginActivity();
  loadApiKeys();
  loadDelegates();
  loadOrganizations();
});
</script>

<style scoped>
.settings-view {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 6px 24px rgba(37,99,235,0.10), 0 1.5px 6px rgba(30,58,92,0.10);
  padding: 2.5rem 2rem;
}
.settings-view form, .organization-section form, .delegate-section form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.98rem;
}
.input, .form-group input, .form-group select, .form-group textarea {
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
  background: #f9fafb;
  color: #222;
  margin-bottom: 0.2rem;
  transition: border 0.18s;
}
.input:focus {
  border-color: #2563eb;
  outline: none;
}
.submit-btn, .settings-save-btn {
  background: var(--primary-blue, #2563eb);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}
.submit-btn:hover, .settings-save-btn:hover {
  background: var(--teal, #20bfa9);
}
.cancel-btn {
  background: #ccc;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s;
}
.cancel-btn:hover {
  background: #b0b0b0;
}
.close-btn {
  background: #6c757d;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s;
}
.close-btn:hover {
  background: #5a6268;
}
.theme-toggle-btn {
  background: #f3f4f6;
  color: #222;
  border: 1px solid #d1d5db;
  border-radius: 1.5rem;
  padding: 0.4rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  outline: none;
}
.theme-toggle-btn[aria-pressed="true"] {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
.theme-toggle-btn:hover {
  background: #e0e7ef;
}
.appearance-section {
  margin-top: 2rem;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.5rem;
}
@media (max-width: 700px) {
  .modal-content {
    min-width: 95vw;
    max-width: 99vw;
    padding: 1rem 0.5rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
.login-activity-section {
  margin-top: 2rem;
}
.api-keys-section {
  margin-top: 2rem;
}
.feedback-section {
  margin-top: 2rem;
}
.account-section {
  margin-top: 2rem;
}
.delete-confirm-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.modal-content {
  background: #fff;
  color: #111;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
  max-width: 480px;
  width: 100%;
}
.delegate-section {
  margin-top: 2rem;
}
.organization-section {
  margin-top: 2rem;
}
</style>
