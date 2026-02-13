<template>
  <div class="address-manager">
    <div class="address-header">
      <h3>Your Delivery Addresses</h3>
      <button
        class="btn-primary btn-add"
        @click="showAddForm = true"
        :disabled="loading"
      >
        <PlusIcon class="icon" />
        Add New Address
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading addresses...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <AlertCircle class="error-icon" />
      <p>{{ error }}</p>
      <button class="btn-secondary" @click="loadAddresses">Try Again</button>
    </div>

    <!-- No Addresses State -->
    <div v-if="!loading && !error && addresses.length === 0" class="empty-state">
      <MapPinIcon class="empty-icon" />
      <h4>No addresses found</h4>
      <p>Add your first delivery address to use the delivery option</p>
      <button class="btn-primary" @click="showAddForm = true">
        Add Address
      </button>
    </div>

    <!-- Address List -->
    <div v-if="!loading && !error && addresses.length > 0" class="address-list">
      <div
        v-for="address in addresses"
        :key="address.addressId"
        class="address-item"
        :class="{ 'address-selected': selectedAddressId === address.addressId }"
      >
        <label class="address-option">
          <input
            type="radio"
            :name="radioGroupName"
            :value="address.addressId"
            :checked="selectedAddressId === address.addressId"
            @change="$emit('address-selected', address.addressId)"
          />
          <div class="address-content">
            <div class="address-type-badge" :class="getBadgeClass(address.addressType)">
              {{ address.addressType }}
            </div>
            <div class="address-details">
              <p class="address-street">{{ address.street }}</p>
              <p class="address-city">{{ address.city }}, {{ address.state }} {{ address.postalCode }}</p>
              <p class="address-country">{{ address.country }}</p>
            </div>
          </div>
          <div class="address-actions" @click.stop>
            <button
              class="btn-icon btn-edit"
              @click="editAddress(address)"
              :disabled="actionLoading === address.addressId"
              title="Edit address"
            >
              <EditIcon class="icon" />
            </button>
            <button
              class="btn-icon btn-delete"
              @click="confirmDeleteAddress(address)"
              :disabled="actionLoading === address.addressId"
              title="Delete address"
            >
              <TrashIcon class="icon" />
            </button>
          </div>
        </label>
      </div>
    </div>

    <!-- Add/Edit Address Form -->
    <AddressForm
      v-if="showAddForm || showEditForm"
      :address="editingAddress"
      :address-types="addressTypes"
      :loading="formLoading"
      @save="handleSaveAddress"
      @cancel="cancelForm"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteConfirm"
      title="Delete Address"
      :message="`Are you sure you want to delete this address?\n\n${deletingAddress?.street}\n${deletingAddress?.city}, ${deletingAddress?.state}`"
      confirm-text="Delete"
      confirm-class="btn-danger"
      @confirm="handleDeleteAddress"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { PlusIcon, MapPinIcon, EditIcon, TrashIcon, AlertCircle } from 'lucide-vue-next'
import AddressForm from './AddressForm.vue'
import ConfirmModal from './ConfirmModal.vue'
import api from '@/services/api'

const props = defineProps({
  userId: {
    type: Number,
    required: true
  },
  selectedAddressId: {
    type: Number,
    default: null
  },
  radioGroupName: {
    type: String,
    default: 'delivery-address'
  }
})

const emit = defineEmits(['address-selected', 'addresses-loaded', 'address-added', 'address-updated', 'address-deleted'])

// Reactive data
const addresses = ref([])
const addressTypes = ref([])
const loading = ref(false)
const formLoading = ref(false)
const actionLoading = ref(null)
const error = ref('')

// Form states
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingAddress = ref(null)

// Delete confirmation
const showDeleteConfirm = ref(false)
const deletingAddress = ref(null)

// Methods
const loadAddresses = async () => {
  loading.value = true
  error.value = ''

  try {
    const [addressData, typeData] = await Promise.all([
      api.getUserAddresses(props.userId),
      api.getAddressTypes()
    ])

    addresses.value = addressData || []
    addressTypes.value = typeData || []
    emit('addresses-loaded', addresses.value)

  } catch (err) {
    console.error('Error loading addresses:', err)
    error.value = 'Failed to load addresses. Please try again.'
  } finally {
    loading.value = false
  }
}

const getBadgeClass = (type) => {
  const typeClasses = {
    'HOME': 'badge-home',
    'WORK': 'badge-work',
    'BILLING': 'badge-billing',
    'SHIPPING': 'badge-shipping',
    'OTHER': 'badge-other'
  }
  return typeClasses[type] || 'badge-other'
}

const editAddress = (address) => {
  editingAddress.value = { ...address }
  showEditForm.value = true
}

const confirmDeleteAddress = (address) => {
  deletingAddress.value = address
  showDeleteConfirm.value = true
}

const handleSaveAddress = async (addressData) => {
  formLoading.value = true

  try {
    if (editingAddress.value) {
      // Update existing address
      await api.updateAddress(editingAddress.value.addressId, addressData)
      emit('address-updated', addressData)
    } else {
      // Create new address
      const newAddress = await api.createAddress({ ...addressData, userId: props.userId })
      emit('address-added', newAddress)
    }

    await loadAddresses()
    cancelForm()

  } catch (err) {
    console.error('Error saving address:', err)
    throw err // Let AddressForm handle the error display
  } finally {
    formLoading.value = false
  }
}

const handleDeleteAddress = async () => {
  if (!deletingAddress.value) return

  actionLoading.value = deletingAddress.value.addressId

  try {
    await api.deleteAddress(deletingAddress.value.addressId, props.userId)
    emit('address-deleted', deletingAddress.value)
    await loadAddresses()

    // If deleted address was selected, clear selection
    if (props.selectedAddressId === deletingAddress.value.addressId) {
      emit('address-selected', null)
    }

  } catch (err) {
    console.error('Error deleting address:', err)
    error.value = 'Failed to delete address. Please try again.'
  } finally {
    actionLoading.value = null
    showDeleteConfirm.value = false
    deletingAddress.value = null
  }
}

const cancelForm = () => {
  showAddForm.value = false
  showEditForm.value = false
  editingAddress.value = null
}

// Lifecycle
onMounted(() => {
  if (props.userId) {
    loadAddresses()
  }
})
</script>

<style scoped>
.address-manager {
  width: 100%;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.address-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.icon {
  width: 1rem;
  height: 1rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  text-align: center;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  text-align: center;
  color: #dc2626;
}

.error-icon {
  width: 2rem;
  height: 2rem;
  margin-bottom: 1rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
}

/* Address List */
.address-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.address-item {
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.address-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.address-selected {
  border-color: #3b82f6 !important;
  background-color: rgba(59, 130, 246, 0.05);
}

.address-option {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  cursor: pointer;
  width: 100%;
}

.address-option input[type="radio"] {
  margin-top: 0.25rem;
  cursor: pointer;
}

.address-content {
  flex: 1;
}

.address-type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.badge-home { background-color: #dbeafe; color: #1e40af; }
.badge-work { background-color: #f3e8ff; color: #7c2d12; }
.badge-billing { background-color: #ecfdf5; color: #065f46; }
.badge-shipping { background-color: #fef3c7; color: #92400e; }
.badge-other { background-color: #f3f4f6; color: #374151; }

.address-details p {
  margin: 0 0 0.25rem 0;
  color: #374151;
}

.address-street {
  font-weight: 500;
  font-size: 1rem;
}

.address-city {
  font-size: 0.875rem;
  color: #6b7280;
}

.address-country {
  font-size: 0.875rem;
  color: #9ca3af;
}

.address-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.btn-delete:hover {
  background-color: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Common Button Styles */
.btn-primary {
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
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

.btn-secondary:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .address-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .address-option {
    flex-direction: column;
    gap: 0.75rem;
  }

  .address-actions {
    align-self: flex-end;
  }

  .empty-state {
    padding: 2rem 1rem;
  }
}
</style>
