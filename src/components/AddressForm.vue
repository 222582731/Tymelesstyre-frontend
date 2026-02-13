<template>
  <div class="address-form-overlay" @click="handleOverlayClick">
    <div class="address-form-modal" @click.stop>
      <div class="form-header">
        <h3>{{ address ? 'Edit Address' : 'Add New Address' }}</h3>
        <button class="btn-close" @click="$emit('cancel')" :disabled="loading">
          <XIcon class="icon" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="address-form">
        <div class="form-grid">
          <!-- Address Type -->
          <div class="form-group span-full">
            <label for="addressType" class="form-label required">Address Type</label>
            <select
              id="addressType"
              v-model="formData.addressType"
              class="form-select"
              :class="{ 'form-error': errors.addressType }"
              required
            >
              <option value="">Select address type</option>
              <option v-for="type in addressTypes" :key="type" :value="type">
                {{ formatAddressType(type) }}
              </option>
            </select>
            <span v-if="errors.addressType" class="error-message">{{ errors.addressType }}</span>
          </div>

          <!-- Street Address -->
          <div class="form-group span-full">
            <label for="street" class="form-label required">Street Address</label>
            <input
              id="street"
              v-model="formData.street"
              type="text"
              class="form-input"
              :class="{ 'form-error': errors.street }"
              placeholder="e.g., 123 Main Street, Apartment 2B"
              required
              maxlength="255"
            />
            <span v-if="errors.street" class="error-message">{{ errors.street }}</span>
          </div>

          <!-- City -->
          <div class="form-group">
            <label for="city" class="form-label required">City</label>
            <input
              id="city"
              v-model="formData.city"
              type="text"
              class="form-input"
              :class="{ 'form-error': errors.city }"
              placeholder="e.g., Cape Town"
              required
              maxlength="100"
            />
            <span v-if="errors.city" class="error-message">{{ errors.city }}</span>
          </div>

          <!-- State/Province -->
          <div class="form-group">
            <label for="state" class="form-label">State/Province</label>
            <input
              id="state"
              v-model="formData.state"
              type="text"
              class="form-input"
              :class="{ 'form-error': errors.state }"
              placeholder="e.g., Western Cape"
              maxlength="100"
            />
            <span v-if="errors.state" class="error-message">{{ errors.state }}</span>
          </div>

          <!-- Postal Code -->
          <div class="form-group">
            <label for="postalCode" class="form-label required">Postal Code</label>
            <input
              id="postalCode"
              v-model="formData.postalCode"
              type="number"
              class="form-input"
              :class="{ 'form-error': errors.postalCode }"
              placeholder="e.g., 8001"
              required
              min="1000"
              max="9999"
            />
            <span v-if="errors.postalCode" class="error-message">{{ errors.postalCode }}</span>
          </div>

          <!-- Country -->
          <div class="form-group">
            <label for="country" class="form-label required">Country</label>
            <input
              id="country"
              v-model="formData.country"
              type="text"
              class="form-input"
              :class="{ 'form-error': errors.country }"
              placeholder="e.g., South Africa"
              required
              maxlength="100"
            />
            <span v-if="errors.country" class="error-message">{{ errors.country }}</span>
          </div>
        </div>

        <!-- General Error -->
        <div v-if="generalError" class="general-error">
          <AlertCircle class="error-icon" />
          <span>{{ generalError }}</span>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button
            type="button"
            class="btn-secondary"
            @click="$emit('cancel')"
            :disabled="loading"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="loading || !isFormValid"
          >
            <div v-if="loading" class="loading-spinner"></div>
            {{ loading ? 'Saving...' : (address ? 'Update Address' : 'Save Address') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineEmits, defineProps } from 'vue'
import { XIcon, AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  address: {
    type: Object,
    default: null
  },
  addressTypes: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel'])

// Form data
const formData = ref({
  addressType: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'South Africa'
})

// Validation
const errors = ref({})
const generalError = ref('')

// Computed
const isFormValid = computed(() => {
  return formData.value.addressType &&
         formData.value.street.trim() &&
         formData.value.city.trim() &&
         formData.value.postalCode &&
         formData.value.country.trim() &&
         Object.keys(errors.value).length === 0
})

// Methods
const formatAddressType = (type) => {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

const validateField = (field, value) => {
  const fieldErrors = { ...errors.value }

  switch (field) {
    case 'addressType':
      if (!value) {
        fieldErrors.addressType = 'Address type is required'
      } else {
        delete fieldErrors.addressType
      }
      break

    case 'street':
      if (!value || !value.trim()) {
        fieldErrors.street = 'Street address is required'
      } else if (value.trim().length < 5) {
        fieldErrors.street = 'Street address must be at least 5 characters'
      } else if (value.length > 255) {
        fieldErrors.street = 'Street address must be less than 255 characters'
      } else {
        delete fieldErrors.street
      }
      break

    case 'city':
      if (!value || !value.trim()) {
        fieldErrors.city = 'City is required'
      } else if (value.trim().length < 2) {
        fieldErrors.city = 'City must be at least 2 characters'
      } else if (value.length > 100) {
        fieldErrors.city = 'City must be less than 100 characters'
      } else {
        delete fieldErrors.city
      }
      break

    case 'state':
      if (value && value.length > 100) {
        fieldErrors.state = 'State must be less than 100 characters'
      } else {
        delete fieldErrors.state
      }
      break

    case 'postalCode':
      if (!value) {
        fieldErrors.postalCode = 'Postal code is required'
      } else if (!/^\d{4}$/.test(value.toString())) {
        fieldErrors.postalCode = 'Postal code must be exactly 4 digits'
      } else {
        delete fieldErrors.postalCode
      }
      break

    case 'country':
      if (!value || !value.trim()) {
        fieldErrors.country = 'Country is required'
      } else if (value.trim().length < 2) {
        fieldErrors.country = 'Country must be at least 2 characters'
      } else if (value.length > 100) {
        fieldErrors.country = 'Country must be less than 100 characters'
      } else {
        delete fieldErrors.country
      }
      break
  }

  errors.value = fieldErrors
}

const validateForm = () => {
  Object.keys(formData.value).forEach(field => {
    validateField(field, formData.value[field])
  })
}

const handleSubmit = async () => {
  validateForm()

  if (!isFormValid.value) {
    return
  }

  generalError.value = ''

  try {
    const addressData = { ...formData.value }

    // Convert postalCode to number
    addressData.postalCode = parseInt(addressData.postalCode)

    // Trim string fields
    addressData.street = addressData.street.trim()
    addressData.city = addressData.city.trim()
    addressData.state = addressData.state.trim()
    addressData.country = addressData.country.trim()

    // If editing, include the address ID
    if (props.address) {
      addressData.addressId = props.address.addressId
    }

    await emit('save', addressData)

  } catch (error) {
    console.error('Form submission error:', error)

    if (error.response?.status === 400) {
      generalError.value = error.response.data?.message || 'Please check your input and try again'
    } else if (error.response?.status === 409) {
      generalError.value = 'An address with these details already exists'
    } else {
      generalError.value = error.message || 'Failed to save address. Please try again.'
    }
  }
}

const handleOverlayClick = () => {
  if (!props.loading) {
    emit('cancel')
  }
}

// Watchers for real-time validation
watch(() => formData.value.addressType, (value) => validateField('addressType', value))
watch(() => formData.value.street, (value) => validateField('street', value))
watch(() => formData.value.city, (value) => validateField('city', value))
watch(() => formData.value.state, (value) => validateField('state', value))
watch(() => formData.value.postalCode, (value) => validateField('postalCode', value))
watch(() => formData.value.country, (value) => validateField('country', value))

// Initialize form data
onMounted(() => {
  if (props.address) {
    formData.value = {
      addressType: props.address.addressType || '',
      street: props.address.street || '',
      city: props.address.city || '',
      state: props.address.state || '',
      postalCode: props.address.postalCode?.toString() || '',
      country: props.address.country || 'South Africa'
    }
  }
})
</script>

<style scoped>
.address-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.address-form-modal {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.form-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  width: 1rem;
  height: 1rem;
}

.address-form {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.span-full {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.required::after {
  content: ' *';
  color: #dc2626;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-error {
  border-color: #dc2626;
}

.form-error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.error-message {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.general-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.error-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-width: 120px;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .address-form-overlay {
    padding: 0.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
