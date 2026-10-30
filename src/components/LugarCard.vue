<script setup>
import { MapPin, Truck, ChevronRight, Heart, Star, Sparkles } from 'lucide-vue-next'

defineProps({
  lugar: Object,
  isFavorite: Boolean,
  canFavorite: Boolean,
})

defineEmits(['select', 'toggle-favorite'])
</script>

<template>
  <div 
    @click="$emit('select', lugar)" 
    class="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer flex flex-col justify-between group"
  >
    <div>
      <div class="relative h-48 w-full overflow-hidden">
        <img :src="lugar.image" :alt="lugar.nombre" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
        
        <span v-if="lugar.zona" class="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <MapPin class="w-3 h-3 text-sky-400" /> {{ lugar.zona }}
        </span>

        <span v-if="lugar.isFeatured" class="absolute bottom-3 left-3 bg-amber-400 text-amber-950 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Sparkles class="h-3 w-3" /> Recomendado
        </span>
        <button
          v-if="canFavorite"
          @click.stop="$emit('toggle-favorite', lugar)"
          :aria-label="isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'"
          class="absolute top-3 right-3 z-10 rounded-full bg-white/95 p-2 text-rose-600 shadow hover:bg-white"
        >
          <Heart class="h-4 w-4" :fill="isFavorite ? 'currentColor' : 'none'" />
        </button>
        <span 
          :class="[
            'absolute text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1',
            canFavorite ? 'bottom-3 right-3' : 'top-3 right-3',
            lugar.hasDelivery ? 'bg-emerald-600/90 text-white' : 'bg-slate-800/80 text-slate-200'
          ]"
        >
          <Truck v-if="lugar.hasDelivery" class="w-3 h-3" />
          {{ lugar.hasDelivery ? 'Delivery' : 'Visita presencial' }}
        </span>
      </div>

      <div v-if="lugar.imageCredit" class="flex flex-wrap gap-x-1 px-4 pt-2 text-[10px] text-slate-400">
        <a :href="lugar.imageSource" target="_blank" rel="noopener noreferrer" @click.stop class="underline hover:text-sky-700">
          Foto: {{ lugar.imageCredit }}
        </a>
        <span>·</span>
        <a :href="lugar.imageLicenseUrl" target="_blank" rel="noopener noreferrer" @click.stop class="underline hover:text-sky-700">
          {{ lugar.imageLicense }}
        </a>
      </div>

      <div class="p-4 space-y-1.5">
        <h3 class="font-bold text-slate-900 text-base group-hover:text-sky-600 transition line-clamp-1">{{ lugar.nombre }}</h3>
        <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">{{ lugar.descripcion }}</p>
        <p v-if="lugar.averageRating" class="flex items-center gap-1 pt-1 text-xs font-semibold text-amber-600">
          <Star class="h-3.5 w-3.5" fill="currentColor" /> {{ lugar.averageRating.toFixed(1) }} <span class="font-normal text-slate-400">({{ lugar.reviewCount }} opiniones)</span>
        </p>
      </div>
    </div>

    <div class="p-4 pt-0">
      <div class="pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-sky-600">
        <span>Ver detalles</span>
        <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition" />
      </div>
    </div>
  </div>
</template>