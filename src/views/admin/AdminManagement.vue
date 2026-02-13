<template>
  <div class="admin-management">
    <div class="admin-header">
      <h1>Admin Management</h1>
      <p>Manage admin users and permissions</p>
    </div>

    <!-- Status & Instructions -->
    <div v-if="setupStatus" class="status-section">
      <div class="status-card" :class="setupStatus.hasAdmins ? 'status-active' : 'status-warning'">
        <div class="status-icon">
          {{ setupStatus.hasAdmins ? '✅' : '⚠️' }}
        </div>
        <div class="status-content">
          <h3>{{ setupStatus.hasAdmins ? 'Admin System Active' : 'Admin Setup Required' }}</h3>
          <p>{{ setupStatus.message }}</p>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="message.text" class="message" :class="message.type">
      <div class="message-content">
        <span class="message-icon">
          {{ message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : 'ℹ️' }}
        </span>
        <span>{{ message.text }}</span>
      </div>
      <button @click="clearMessage" class="message-close">×</button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ loadingText }}</p>
    </div>

    <!-- Create Admin Section -->
    <div class="create-admin-section">
      <div class="section-header">
        <h2>Create New Admin</h2>
        <p>Add a new admin user to the system</p>
      </div>

      <form @submit.prevent="handleCreateAdmin" class="admin-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="name" class="form-label">First Name <span class="required">*</span></label>
            <input
              type="text"
              id="name"
              v-model="formData.name"
              class="form-input"
              required
              :disabled="loading"
              placeholder="Enter first name"
            />
          </div>

          <div class="form-group">
            <label for="surname" class="form-label">Last Name <span class="required">*</span></label>
            <input
              type="text"
              id="surname"
              v-model="formData.surname"
              class="form-input"
              required
              :disabled="loading"
              placeholder="Enter last name"
            />
          </div>

          <div class="form-group">
            <label for="username" class="form-label">Username <span class="required">*</span></label>
            <input
              type="text"
              id="username"
              v-model="formData.username"
              class="form-input"
              required
              :disabled="loading"
              placeholder="Enter unique username"
              pattern="[a-zA-Z0-9_]+"
              title="Username can only contain letters, numbers, and underscores"
            />
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email Address <span class="required">*</span></label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              class="form-input"
              required
              :disabled="loading"
              placeholder="admin@tymelesstyre.com"
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password <span class="required">*</span></label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              class="form-input"
              required
              :disabled="loading"
              minlength="8"
              placeholder="Enter secure password"
            />
            <small class="form-hint">Minimum 8 characters required</small>
          </div>

          <div class="form-group">
            <label for="phoneNumber" class="form-label">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              v-model="formData.phoneNumber"
              class="form-input"
              :disabled="loading"
              placeholder="0123456789"
            />
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            @click="resetForm"
            class="btn btn-secondary"
            :disabled="loading"
          >
            Reset Form
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading" class="btn-spinner"></span>
            {{ loading ? 'Creating...' : 'Create Admin' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Admin List Section -->
    <div class="admin-list-section">
      <div class="section-header">
        <h2>Existing Admins ({{ admins.length }})</h2>
        <button
          @click="loadAdmins"
          class="btn btn-outline"
          :disabled="loading"
        >
          <span class="btn-icon">🔄</span>
          Refresh
        </button>
      </div>

      <div v-if="admins.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>No Admin Users Found</h3>
        <p>Create the first admin user to get started.</p>
      </div>

      <div v-else class="admin-grid">
        <div
          v-for="admin in admins"
          :key="admin.userId"
          class="admin-card"
        >
          <div class="admin-avatar">
            {{ getInitials(admin.name, admin.surname) }}
          </div>
          <div class="admin-info">
            <h4 class="admin-name">{{ admin.name }} {{ admin.surname }}</h4>
            <div class="admin-details">
              <div class="detail-item">
                <span class="detail-label">Username:</span>
                <span class="detail-value">{{ admin.username }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ admin.email }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">{{ admin.phoneNumber || 'Not provided' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Role:</span>
                <span class="role-badge">{{ admin.role }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Created:</span>
                <span class="detail-value">{{ formatDate(admin.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

// Reactive data
const admins = ref([])
const setupStatus = ref(null)
const loading = ref(false)
const loadingText = ref('Loading...')

const message = ref({
  text: '',
  type: '' // 'success', 'error', 'info'
})

const formData = ref({
  name: '',
  surname: '',
  username: '',
  email: '',
  password: '',
  phoneNumber: ''
})

// Computed properties
const isFormValid = computed(() => {
  return formData.value.name &&
         formData.value.surname &&
         formData.value.username &&
         formData.value.email &&
         formData.value.password &&
         formData.value.password.length >= 8
})

// Methods
const showMessage = (text, type = 'info') => {
  message.value = { text, type }

  // Auto-clear success messages after 5 seconds
  if (type === 'success') {
    setTimeout(clearMessage, 5000)
  }
}

const clearMessage = () => {
  message.value = { text: '', type: '' }
}

const resetForm = () => {
  formData.value = {
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: ''
  }
  clearMessage()
}

const getInitials = (firstName, lastName) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Invalid date format:', error)
    return 'Invalid date'
  }
}

const checkAdminSetupStatus = async () => {
  try {
    loadingText.value = 'Checking admin setup status...'
    const status = await api.checkAdminSetupStatus()
    setupStatus.value = status
    console.log('Admin setup status:', status)
  } catch (error) {
    console.error('Error checking admin setup status:', error)
    showMessage('Failed to check admin setup status', 'error')
  }
}

const loadAdmins = async () => {
  try {
    loading.value = true
    loadingText.value = 'Loading admin users...'
    clearMessage()

    const response = await api.fetchAdmins()
    admins.value = Array.isArray(response.admins) ? response.admins : []

    console.log('Loaded admins:', admins.value.length)

    if (admins.value.length === 0) {
      showMessage('No admin users found', 'info')
    }
  } catch (error) {
    console.error('Error loading admins:', error)

    // Handle specific error types
    const errorMessage = error.response?.data?.error || error.message

    if (error.response?.status === 401) {
      showMessage('Authentication required. Please log in again.', 'error')
    } else if (error.response?.status === 403) {
      showMessage('Access denied. Admin privileges required.', 'error')
    } else {
      showMessage(`Failed to load admin users: ${errorMessage}`, 'error')
    }
  } finally {
    loading.value = false
  }
}

const handleCreateAdmin = async () => {
  try {
    loading.value = true
    loadingText.value = 'Creating admin user...'
    clearMessage()

    console.log('Creating admin with data:', {
      ...formData.value,
      password: '[REDACTED]'
    })

    const result = await api.createAdmin(formData.value)

    console.log('Admin created successfully:', result)

    showMessage(
      `Admin user '${result.admin.username}' created successfully!`,
      'success'
    )

    // Reset form and reload admin list
    resetForm()
    await loadAdmins()

  } catch (error) {
    console.error('Error creating admin:', error)

    // Handle specific error types
    const errorMessage = error.response?.data?.error || error.message

    if (error.response?.status === 400) {
      if (errorMessage.includes('Username')) {
        showMessage('Username already exists. Please choose a different username.', 'error')
      } else if (errorMessage.includes('Email')) {
        showMessage('Email already registered. Please use a different email address.', 'error')
      } else {
        showMessage(`Invalid input: ${errorMessage}`, 'error')
      }
    } else if (error.response?.status === 401) {
      showMessage('Authentication required. Please log in again.', 'error')
    } else if (error.response?.status === 403) {
      showMessage('Access denied. Only admin users can create other admins.', 'error')
    } else {
      showMessage(`Failed to create admin: ${errorMessage}`, 'error')
    }
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  console.log('AdminManagement component mounted')

  // Check setup status first
  await checkAdminSetupStatus()

  // Then load existing admins
  await loadAdmins()
})
</script>

<style scoped>
.admin-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.admin-header {
  text-align: center;
  margin-bottom: 2rem;
}

.admin-header h1 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 2.5rem;
  font-weight: 700;
}

.admin-header p {
  margin: 0;
  color: #6b7280;
  font-size: 1.125rem;
}

/* Status Section */
.status-section {
  margin-bottom: 2rem;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid;
  background: white;
}

.status-active {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.status-warning {
  border-color: #f59e0b;
  background-color: #fffbeb;
}

.status-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.status-content h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.status-content p {
  margin: 0;
  color: #6b7280;
}

/* Messages */
.message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid;
}

.message.success {
  background-color: #f0fdf4;
  border-color: #10b981;
  color: #065f46;
}

.message.error {
  background-color: #fef2f2;
  border-color: #ef4444;
  color: #991b1b;
}

.message.info {
  background-color: #eff6ff;
  border-color: #3b82f6;
  color: #1e40af;
}

.message-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.message-icon {
  font-size: 1.25rem;
}

.message-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  color: inherit;
  opacity: 0.7;
}

.message-close:hover {
  opacity: 1;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

/* Create Admin Section */
.create-admin-section {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.admin-form {
  max-width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.form-hint {
  margin-top: 0.25rem;
  color: #6b7280;
  font-size: 0.75rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.btn-secondary {
  background-color: white;
  border-color: #d1d5db;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn-outline {
  background-color: transparent;
  border-color: #d1d5db;
  color: #374151;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.btn-icon {
  font-size: 1rem;
}

/* Admin List */
.admin-list-section {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.admin-card {
  display: flex;
  gap: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: box-shadow 0.2s ease;
}

.admin-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.admin-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.admin-info {
  flex: 1;
  min-width: 0;
}

.admin-name {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
}

.admin-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.detail-label {
  color: #6b7280;
  font-weight: 500;
  min-width: 4rem;
}

.detail-value {
  color: #374151;
  word-break: break-word;
}

.role-badge {
  background-color: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-management {
    padding: 1rem;
  }

  .admin-header h1 {
    font-size: 2rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .admin-grid {
    grid-template-columns: 1fr;
  }

  .admin-card {
    flex-direction: column;
    text-align: center;
  }

  .admin-avatar {
    align-self: center;
  }
}

@media (max-width: 480px) {
  .admin-management {
    padding: 0.75rem;
  }

  .create-admin-section,
  .admin-list-section {
    padding: 1.5rem;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
