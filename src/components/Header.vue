<script setup>
import { Search, User, Compass } from 'lucide-vue-next'

defineProps({
  searchQuery: String
})

defineEmits(['update:searchQuery', 'open-auth'])
</script>

<template>
  <header class="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      
      <!-- Logo -->
      <div class="flex items-center gap-2 cursor-pointer">
        <div class="bg-sky-500 text-slate-950 p-2 rounded-xl font-black">
          <Compass class="w-5 h-5" />
        </div>
        <div>
          <span class="font-black text-lg tracking-tight text-white">Guia<span class="text-sky-400">PC</span></span>
          <span class="hidden sm:inline-block text-[10px] text-slate-400 ml-2 font-medium">Puerto Cabello</span>
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

      <!-- Botón de Ingresar que activa el modal -->
      <button 
        @click="$emit('open-auth')" 
        class="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md"
      >
        <User class="w-4 h-4" />
        <span>Ingresar</span>
      </button>
    </div>
  </header>
</template>