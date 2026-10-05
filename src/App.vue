<script setup>
import { ref, onMounted } from 'vue'
import Header from './components/Header.vue'
import HomeView from './views/HomeView.vue'
import AuthModal from './components/AuthModal.vue'
import { apiService } from './services/api'

const searchQuery = ref('')
const lugares = ref([])
const isAuthModalOpen = ref(false)

onMounted(async () => {
  lugares.value = await apiService.getLugares()
})

const handleLogin = (credentials) => {
  alert(`Bienvenido, inicio de sesión exitoso como ${credentials.rol}`)
  isAuthModalOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
    <!-- Header con evento para abrir AuthModal -->
    <Header 
      v-model:searchQuery="searchQuery" 
      @open-auth="isAuthModalOpen = true"
    />

    <!-- Contenido Principal -->
    <div class="w-full max-w-7xl mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-6">
      <HomeView :searchQuery="searchQuery" :lugares="lugares" />
    </div>

    <!-- Modal de Autenticación -->
    <AuthModal 
      v-if="isAuthModalOpen" 
      @close="isAuthModalOpen = false" 
      @login="handleLogin" 
    />

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
      <p>© 2026 <strong>GuiaPC</strong> — La guía comercial y turística de Puerto Cabello, Venezuela 🇻🇪</p>
    </footer>
  </div>
</template>