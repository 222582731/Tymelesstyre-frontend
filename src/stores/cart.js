import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cartItems')) || [],
    total: 0,
  }),

  actions: {
    addItem(product, quantity = 1) {
      const existingItem = this.items.find((item) => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({
          ...product,
          quantity,
          addedAt: new Date().toISOString(),
        })
      }

      this.saveToLocalStorage()
    },

    removeItem(productId) {
      this.items = this.items.filter((item) => item.id !== productId)
      this.saveToLocalStorage()
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find((item) => item.id === productId)
      if (item) {
        item.quantity = quantity
        this.saveToLocalStorage()
      }
    },

    clearCart() {
      this.items = []
      this.total = 0
      localStorage.removeItem('cartItems')
    },

    calculateTotal() {
      const subtotal = this.items.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0
        const quantity = parseInt(item.quantity) || 0
        return sum + (price * quantity)
      }, 0)

      this.total = subtotal
    },

    saveToLocalStorage() {
      localStorage.setItem('cartItems', JSON.stringify(this.items))
      this.calculateTotal()
    },

    async loadUserCart() {
      try {
        // This would call your backend API to load user's saved cart
        // For now, we'll just log that this functionality would be here
        console.log('Load user cart functionality would go here')
        this.calculateTotal()
      } catch (error) {
        console.error('Failed to load user cart:', error)
      }
    },

    // Initialize cart from localStorage on app start
    initializeCart() {
      const savedItems = localStorage.getItem('cartItems')
      if (savedItems) {
        this.items = JSON.parse(savedItems)
        this.calculateTotal()
      }
    },
  },

  getters: {
    itemCount: (state) => state.items.reduce((count, item) => count + item.quantity, 0),
    cartItems: (state) => state.items,
    cartTotal: (state) => state.total.toFixed(2),
    cartSubtotal: (state) => {
      return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
    },
  },
})
