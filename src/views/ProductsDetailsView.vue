<template>
  <div class="product-details-container" v-if="product">
    <div class="product-header">
      <h2>{{ product.productName }} - {{ product.productModel }}</h2>
      <button class="back-button" @click="$router.go(-1)">Back</button>
    </div>

    <div class="product-content">
      <div class="product-image">
        <img :src="getProductImage(product.productId)" :alt="product.productName">
      </div>

      <div class="product-info">
        <h3>Specifications</h3>
        <div class="specs-grid">
          <div class="spec-item">
            <span class="label">Width:</span>
            <span>{{ product.width }}</span>
          </div>
          <div class="spec-item">
            <span class="label">Aspect Ratio:</span>
            <span>{{ product.aspectRatio }}</span>
          </div>
          <div class="spec-item">
            <span class="label">Rim Diameter:</span>
            <span>{{ product.rimDiameter }}</span>
          </div>
          <div class="spec-item">
            <span class="label">Season:</span>
            <span>{{ product.season }}</span>
          </div>
          <div class="spec-item">
            <span class="label">Vehicle Type:</span>
            <span>{{ product.vehicleType }}</span>
          </div>
          <div class="spec-item">
            <span class="label">Price:</span>
            <span>${{ product.productPrice }}</span>
          </div>
          <div class="spec-item">
            <span class="label">Stock:</span>
            <span>{{ product.stockQuantity }}</span>
          </div>
        </div>

        <div class="description">
          <h3>Description</h3>
          <p>{{ product.description }}</p>
        </div>

        <div class="fitments" v-if="product.fitments && product.fitments.length">
          <h3>Compatible Vehicles</h3>
          <ul>
            <li v-for="(fitment, index) in product.fitments" :key="index">
              {{ fitment.make }} {{ fitment.model }} {{ fitment.year }} {{ fitment.trim }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'ProductDetailsView',
  data() {
    return {
      product: null
    }
  },
  methods: {
    async fetchProduct() {
      try {
        const productId = this.$route.params.id
        this.product = await api.getProduct(productId)
      } catch (error) {
        console.error('Error fetching product:', error)
        alert('Failed to load product details')
      }
    },
    getProductImage(productId) {
      return `http://localhost:8080/tymelesstyre/api/products/${productId}/image`
    }
  },
  created() {
    this.fetchProduct()
  }
}
</script>

<style scoped>
.product-details-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.back-button {
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 32px;
}

.product-image img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin: 20px 0;
}

.spec-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.label {
  font-weight: 600;
  margin-right: 8px;
}

.description, .fitments {
  margin-top: 24px;
}

.fitments ul {
  list-style: none;
  padding: 0;
}

.fitments li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
</style>
