<script setup>
import { MapPin, Truck, ChevronRight } from 'lucide-vue-next'

defineProps({
  lugar: Object
})

defineEmits(['select'])
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

        <span 
          :class="[
            'absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1',
            lugar.hasDelivery ? 'bg-emerald-600/90 text-white' : 'bg-slate-800/80 text-slate-200'
          ]"
        >
          <Truck class="w-3 h-3" /> {{ lugar.hasDelivery ? 'Delivery' : 'En Sitio' }}
        </span>
      </div>

      <div class="p-4 space-y-1.5">
        <h3 class="font-bold text-slate-900 text-base group-hover:text-sky-600 transition line-clamp-1">{{ lugar.nombre }}</h3>
        <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">{{ lugar.descripcion }}</p>
      </div>
    </div>

    <div class="p-4 pt-0">
      <div class="pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-sky-600">
        <span>Ver Menú y Horarios</span>
        <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition" />
      </div>
    </div>
  </div>
</template>