<template>
  <div class="confirm-modal-overlay" @click="$emit('cancel')">
    <div class="confirm-modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
      </div>

      <div class="modal-body">
        <p class="modal-message">{{ message }}</p>
      </div>

      <div class="modal-actions">
        <button
          type="button"
          class="btn-secondary"
          @click="$emit('cancel')"
          :disabled="loading"
        >
          {{ cancelText }}
        </button>
        <button
          type="button"
          class="btn-confirm"
          :class="confirmClass"
          @click="$emit('confirm')"
          :disabled="loading"
        >
          <div v-if="loading" class="loading-spinner"></div>
          {{ loading ? 'Processing...' : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  confirmClass: {
    type: String,
    default: 'btn-primary'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.confirm-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
}

.confirm-modal {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 400px;
  width: 100%;
}

.modal-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
}

.modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.modal-body {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.modal-message {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
  white-space: pre-line;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  flex: 1;
  background-color: white;
  color: #374151;
  padding: 0.75rem 1rem;
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

.btn-confirm {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c;
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
@media (max-width: 480px) {
  .modal-actions {
    flex-direction: column;
  }
}
</style>
