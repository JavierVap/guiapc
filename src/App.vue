<script setup>
import { ref, onMounted } from 'vue'
import Header from './components/Header.vue'
import HomeView from './views/HomeView.vue'
import AuthModal from './components/AuthModal.vue'
import AliadoDashboard from './views/AliadoDashboard.vue'
import { apiService } from './services/api'

const searchQuery = ref('')
const lugares = ref([])
const events = ref([])
const isAuthModalOpen = ref(false)
const currentUser = ref(null)
const favoriteIds = ref([])
const currentView = ref('home')
const pageError = ref('')
const reviewError = ref('')
const reviewSuccess = ref('')
const isLoading = ref(true)
const authError = ref('')
const isAuthSubmitting = ref(false)

async function loadPublicData() {
  pageError.value = ''
  isLoading.value = true
  try {
    const [loadedPlaces, loadedEvents] = await Promise.all([
      apiService.getLugares(),
      apiService.getEvents(),
    ])
    lugares.value = loadedPlaces
    events.value = loadedEvents
  } catch (error) {
    pageError.value = error.message
  } finally {
    isLoading.value = false
  }
}

async function loadFavorites() {
  if (!currentUser.value) {
    favoriteIds.value = []
    return
  }
  try {
    favoriteIds.value = await apiService.getFavorites()
  } catch (error) {
    pageError.value = error.message
  }
}

async function handleAuth({ mode, name, email, password }) {
  authError.value = ''
  isAuthSubmitting.value = true
  try {
    currentUser.value = mode === 'register'
      ? await apiService.register({ name, email, password })
      : await apiService.login({ email, password })
    isAuthModalOpen.value = false
    await loadFavorites()
  } catch (error) {
    authError.value = error.message
  } finally {
    isAuthSubmitting.value = false
  }
}

function handleLogout() {
  apiService.logout()
  currentUser.value = null
  favoriteIds.value = []
  currentView.value = 'home'
}

function openDashboard() {
  currentView.value = 'dashboard'
}

function openAuth() {
  authError.value = ''
  isAuthModalOpen.value = true
}

function closeAuth() {
  authError.value = ''
  isAuthModalOpen.value = false
}

async function toggleFavorite(place) {
  if (!currentUser.value) {
    openAuth()
    return
  }
  const isFavorite = favoriteIds.value.includes(place.id)
  try {
    await apiService.setFavorite(place.id, !isFavorite)
    favoriteIds.value = isFavorite
      ? favoriteIds.value.filter((id) => id !== place.id)
      : [...favoriteIds.value, place.id]
  } catch (error) {
    pageError.value = error.message
  }
}

async function submitReview({ place, review }) {
  reviewError.value = ''
  reviewSuccess.value = ''
  try {
    await apiService.addReview(place.id, review)
    reviewSuccess.value = 'Opinión enviada. Se publicará después de la moderación.'
  } catch (error) {
    reviewError.value = error.message
  }
}

async function sharePlace(place) {
  const url = new URL(window.location.href)
  url.searchParams.set('lugar', place.id)
  const shareData = { title: place.nombre, text: `Descubre ${place.nombre} en GuiaPC`, url: url.toString() }
  try {
    if (navigator.share) await navigator.share(shareData)
    else {
      await navigator.clipboard.writeText(shareData.url)
      pageError.value = 'Enlace del lugar copiado.'
      window.setTimeout(() => { pageError.value = '' }, 3000)
    }
  } catch (error) {
    if (error.name !== 'AbortError') pageError.value = `No se pudo compartir: ${error.message}`
  }
}

onMounted(async () => {
  try {
    currentUser.value = await apiService.getCurrentUser()
  } catch (error) {
    pageError.value = error.message
  }
  await loadFavorites()
  await loadPublicData()
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
    <!-- Header con evento para abrir AuthModal -->
    <Header 
      v-model:searchQuery="searchQuery" 
      @open-auth="openAuth"
      :current-user="currentUser"
      :current-view="currentView"
      @open-dashboard="openDashboard"
      @open-home="currentView = 'home'"
      @logout="handleLogout"
    />

    <!-- Contenido Principal -->
    <div class="w-full max-w-7xl mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-6">
      <div v-if="pageError" role="alert" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ pageError }}
        <button v-if="!lugares.length" @click="loadPublicData" class="ml-2 font-bold underline">Reintentar</button>
      </div>
      <p v-if="isLoading" class="py-12 text-center text-sm text-slate-500">Cargando lugares...</p>
      <HomeView
        v-else-if="currentView === 'home'"
        :search-query="searchQuery"
        :lugares="lugares"
        :events="events"
        :current-user="currentUser"
        :favorite-ids="favoriteIds"
        :review-error="reviewError"
        :review-success="reviewSuccess"
        @toggle-favorite="toggleFavorite"
        @open-auth="openAuth"
        @share-place="sharePlace"
        @submit-review="submitReview"
      />
      <AliadoDashboard
        v-else
        :current-user="currentUser"
        @places-changed="loadPublicData"
      />
    </div>

    <!-- Modal de Autenticación -->
    <AuthModal 
      v-if="isAuthModalOpen" 
      @close="closeAuth"
      @submit="handleAuth"
      :error-message="authError"
      :is-submitting="isAuthSubmitting"
    />

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
      <p>© 2026 <strong>GuiaPC</strong> — La guía comercial y turística de Puerto Cabello, Venezuela 🇻🇪</p>
    </footer>
  </div>
</template>