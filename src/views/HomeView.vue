<script setup>
import { ref, computed } from 'vue'
import LugarCard from '../components/LugarCard.vue'
import LugarDetailModal from '../components/LugarDetailModal.vue'
import { Search, Sparkles, Anchor, Flame, ArrowRight } from 'lucide-vue-next'

const props = defineProps({
  searchQuery: String,
  lugares: Array
})

const activeCategory = ref('todos')
const selectedLugar = ref(null)
const internalSearch = ref('')

const categories = ref([
  { id: 'todos', name: 'Todos los Sitios', icon: '✨' },
  { id: 'comida', name: 'Gastronomía & Bares', icon: '🍤' },
  { id: 'playa', name: 'Playas & Islas', icon: '🏖️' },
  { id: 'eventos', name: 'Casco Histórico & Cultura', icon: '🏛️' },
  { id: 'comercio', name: 'Comercios & Servicios', icon: '🛍️' }
])

// Tags rápidos de búsqueda porteña
const quickTags = ['Isla Larga', 'Patanemo', 'Malecón', 'Empanadas']

const setQuickSearch = (tag) => {
  internalSearch.value = tag
}

const filteredLugares = computed(() => {
  const query = (props.searchQuery || internalSearch.value).toLowerCase()
  return props.lugares.filter(lugar => {
    const matchesCategory = activeCategory.value === 'todos' || lugar.categoria === activeCategory.value
    const matchesQuery = lugar.nombre.toLowerCase().includes(query) || 
                         lugar.descripcion.toLowerCase().includes(query) ||
                         (lugar.zona && lugar.zona.toLowerCase().includes(query))
    return matchesCategory && matchesQuery
  })
})
</script>

<template>
  <div class="space-y-8">
    
    <!-- ⚓ HERO BANNER / PROPAGINA ESTILO PORTEÑO -->
    <section class="relative rounded-3xl overflow-hidden bg-slate-950 text-white shadow-2xl border border-slate-800/80">
      
      <!-- Fondo con imagen costera y degradados multicapa estilo atardecer/Caribe -->
      <div 
        class="absolute inset-0 z-0 bg-cover bg-center scale-105 transform transition duration-1000"
        style="background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80');"
      ></div>
      
      <!-- Overlays para calidez y contraste óptimo -->
      <div class="absolute inset-0 z-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-sky-950/40"></div>
      <div class="absolute inset-0 z-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
      
      <!-- Destellos decorativos (Glow) -->
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Contenido de la Landing -->
      <div class="relative z-10 p-6 sm:p-10 lg:p-14 max-w-3xl space-y-6">
        
        <!-- Badge Identidad Porteña -->
        <div class="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-sky-500/20 text-amber-300 border border-amber-400/30 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-inner">
          <Anchor class="w-4 h-4 text-amber-400 animate-pulse" /> 
          <span>¡Bienvenido a la Ciudad Cordial! ⚓</span>
        </div>

        <!-- Título Principal -->
        <div class="space-y-2">
          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Descubre lo mejor de <br class="hidden sm:block" />
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-300">
              Puerto Cabello
            </span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed font-medium">
            Restaurantes en el Malecón, playas paradisíacas como Patanemo e Isla Larga, posadas y comercios locales con atención directa por WhatsApp.
          </p>
        </div>

        <!-- 🔍 BUSCADOR ESTILO GLASSMORPHISM -->
        <div class="space-y-3 pt-2">
          <div class="p-1.5 sm:p-2 bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/40 flex flex-col sm:flex-row items-center gap-2 transition focus-within:ring-4 focus-within:ring-sky-500/30">
            
            <div class="flex items-center w-full px-3 gap-3">
              <div class="p-2 bg-sky-100 text-sky-600 rounded-xl shrink-0">
                <Search class="w-5 h-5" />
              </div>
              <input 
                type="text" 
                v-model="internalSearch" 
                placeholder="¿Qué buscas? Ej: Patanemo, Empanadas, Pescado, Isla Larga..." 
                class="w-full py-2 bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-semibold focus:outline-none"
              />
            </div>

            <button 
              @click="internalSearch = internalSearch"
              class="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black px-7 py-3 rounded-xl sm:rounded-2xl text-xs tracking-wide shadow-lg shadow-sky-500/30 transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shrink-0"
            >
              <span>Explorar</span>
              <ArrowRight class="w-4 h-4" />
            </button>

          </div>

          <!-- Tags Rápidos: "Lo más buscado en el Puerto" -->
          <div class="flex items-center gap-2 flex-wrap text-xs pt-1">
            <span class="text-slate-400 font-bold text-[11px] flex items-center gap-1">
              <Flame class="w-3.5 h-3.5 text-amber-400" /> Lo más buscado:
            </span>
            <button 
              v-for="tag in quickTags" 
              :key="tag"
              @click="setQuickSearch(tag)"
              class="bg-white/10 hover:bg-sky-500/30 text-slate-200 hover:text-white border border-white/15 px-3 py-1 rounded-lg text-[11px] font-semibold backdrop-blur-md transition"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <!-- Badges Informativos -->
        <div class="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 border-t border-slate-800/80">
          <span class="flex items-center gap-1.5"><span class="text-emerald-400">⚡</span> Delivery directo</span>
          <span class="flex items-center gap-1.5"><span class="text-sky-400">📍</span> Zonas & Playas de la ciudad</span>
          <span class="flex items-center gap-1.5"><span class="text-amber-400">💬</span> Menús y WhatsApp directo</span>
        </div>

      </div>
    </section>

    <!-- 🏷️ NAVEGACIÓN POR CATEGORÍAS -->
    <section class="space-y-3">
      <div class="flex justify-between items-center">
        <h2 class="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles class="w-4 h-4 text-sky-600" /> Explorar por Categoría
        </h2>
        <span class="text-xs font-semibold text-slate-500">{{ filteredLugares.length }} sitios encontrados</span>
      </div>

      <div class="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap">
        <button 
          v-for="cat in categories" 
          :key="cat.id" 
          @click="activeCategory = cat.id" 
          :class="[
            'px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2',
            activeCategory === cat.id 
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 scale-105' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          ]"
        >
          <span>{{ cat.icon }}</span>
          <span>{{ cat.name }}</span>
        </button>
      </div>
    </section>

    <!-- 🏬 GRID RESPONSIVO DE TARJETAS -->
    <section>
      <div v-if="filteredLugares.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <LugarCard 
          v-for="lugar in filteredLugares" 
          :key="lugar.id" 
          :lugar="lugar" 
          @select="selectedLugar = $event"
        />
      </div>

      <!-- Estado sin resultados -->
      <div v-else class="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
        <div class="text-4xl">🔍</div>
        <h3 class="font-bold text-slate-800 text-base">No encontramos resultados para tu búsqueda</h3>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">Intenta buscando lugares como "Patanemo", "Isla Larga", "Pescado", "Empanadas" o limpia el filtro de búsqueda.</p>
        <button @click="activeCategory = 'todos'; internalSearch = ''" class="mt-2 text-xs font-bold text-sky-600 underline">
          Ver todos los locales
        </button>
      </div>
    </section>

    <!-- Modal de Detalle al seleccionar un sitio -->
    <LugarDetailModal 
      :lugar="selectedLugar" 
      @close="selectedLugar = null" 
    />
  </div>
</template>