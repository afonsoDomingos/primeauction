<template>
  <div class="star-rating-container" :class="[sizeClass, { interactive: isInteractive }]">
    <div class="stars-row">
      <button
        v-for="star in 5"
        :key="star"
        type="button"
        class="star-btn"
        :disabled="!isInteractive"
        @click="selectRating(star)"
        @mouseenter="hoverRating = star"
        @mouseleave="hoverRating = 0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          :fill="getStarFill(star)"
          class="star-icon"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </button>
    </div>
    
    <span v-if="showText && (rating !== undefined || count !== undefined)" class="rating-text">
      <span class="rating-val">{{ displayRating }}</span>
      <span v-if="count !== undefined && count > 0" class="rating-count">({{ count }} {{ count === 1 ? 'avaliação' : 'avaliações' }})</span>
      <span v-else-if="count === 0" class="rating-count">(Sem avaliações)</span>
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  rating: {
    type: Number,
    default: 0
  },
  count: {
    type: Number,
    default: undefined
  },
  isInteractive: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md' // 'sm', 'md', 'lg'
  },
  showText: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:rating', 'select'])
const hoverRating = ref(0)

const displayRating = computed(() => {
  if (hoverRating.value > 0) return hoverRating.value
  return (props.rating || 0).toFixed(1)
})

const sizeClass = computed(() => `size-${props.size}`)

function getStarFill(starIndex) {
  const activeVal = hoverRating.value > 0 ? hoverRating.value : (props.rating || 0)
  if (activeVal >= starIndex) {
    return '#EAB308' // Gold/Yellow
  } else if (activeVal >= starIndex - 0.5) {
    return '#FACC15'
  }
  return '#E5E7EB' // Gray
}

function selectRating(star) {
  if (props.isInteractive) {
    emit('update:rating', star)
    emit('select', star)
  }
}
</script>

<style scoped>
.star-rating-container {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.stars-row {
  display: flex;
  align-items: center;
  gap: 2px;
}

.star-btn {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.interactive .star-btn {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.interactive .star-btn:hover {
  transform: scale(1.2);
}

.star-icon {
  transition: fill 0.2s ease;
}

.size-sm .star-icon {
  width: 1rem;
  height: 1rem;
}

.size-md .star-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.size-lg .star-icon {
  width: 1.75rem;
  height: 1.75rem;
}

.rating-text {
  font-size: 0.875rem;
  color: var(--text-secondary, #6B7280);
  font-weight: 500;
}

.rating-val {
  font-weight: 700;
  color: var(--text-primary, #111827);

}

.rating-count {
  margin-left: 4px;
  font-size: 0.8rem;
  color: #9CA3AF;
}
</style>
