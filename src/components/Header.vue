<script setup>
import { Search, User, LogOut, Home } from 'lucide-vue-next'

defineProps({
  searchQuery: String,
  currentUser: Object,
  currentView: String,
})

defineEmits(['update:searchQuery', 'open-auth', 'open-dashboard', 'open-home', 'logout'])
</script>

<template>
  <header class="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      
      <!-- Logo -->
      <div class="flex items-center gap-2 cursor-pointer">
        <div class="flex items-center cursor-pointer">
        <!-- Ajusta la ruta (src) dependiendo de dónde guardes la imagen -->
        <img 
          src="../assets/img/logoverutas.jpg" 
          alt="VeRutas Guía Digital de Venezuela" 
          class="h-10 w-auto object-contain bg-white/90 p-1 rounded-lg" 
        />
      </div>
      </div>

      <!-- Buscador rápido en Header -->
      <div class="flex-1 max-w-md hidden md:block">
        <div class="relative flex items-center">
          <Search class="w-4 h-4 absolute left-3 text-slate-400" />
          <input 
            type="text" 
            :value="searchQuery" 
            @input="$emit('update:searchQuery', $event.target.value)" 
            placeholder="Buscar locales, playas o zonas..." 
            class="w-full bg-slate-800 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-700 focus:outline-none focus:border-sky-500 transition"
          />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <template v-if="currentUser">
          <button
            v-if="currentView !== 'home'"
            @click="$emit('open-home')"
            class="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-2.5 rounded-xl flex items-center gap-2 transition"
          >
            <Home class="w-4 h-4" /><span>Guía</span>
          </button>
          <button
            v-if="['ADMIN', 'COLLABORATOR'].includes(currentUser.role)"
            @click="$emit('open-dashboard')"
            class="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3 py-2.5 rounded-xl transition"
          >
            Panel
          </button>
          <span class="hidden sm:inline text-xs text-slate-300">{{ currentUser.name }}</span>
          <button @click="$emit('logout')" aria-label="Cerrar sesión" class="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-xl">
            <LogOut class="w-4 h-4" />
          </button>
        </template>
        <button
          v-else
          @click="$emit('open-auth')"
          class="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md"
        >
          <User class="w-4 h-4" /><span>Ingresar</span>
        </button>
      </div>
    </div>
  </header>
</template>