<script setup>
import { X, MapPin, Clock, Truck, Utensils, MessageCircle, AlertCircle } from 'lucide-vue-next'

defineProps({
  lugar: Object
})

defineEmits(['close'])
</script>

<template>
  <div v-if="lugar" class="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
      
      <!-- Imagen y Botón Cerrar -->
      <div class="relative h-48 sm:h-56 w-full shrink-0">
        <img :src="lugar.image" :alt="lugar.nombre" class="w-full h-full object-cover">
        <button 
          @click="$emit('close')" 
          class="absolute top-4 right-4 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md transition"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="absolute bottom-3 left-3 flex gap-2">
          <span class="bg-slate-900/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
            <MapPin class="w-3 h-3 text-sky-400" /> {{ lugar.zona }}
          </span>
          <span 
            :class="[
              'text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1',
              lugar.hasDelivery ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            ]"
          >
            <Truck class="w-3 h-3" /> {{ lugar.hasDelivery ? 'Delivery Disponible' : 'Solo en Sitio' }}
          </span>
        </div>
      </div>

      <!-- Contenido de Información -->
      <div class="p-5 space-y-5 flex-1">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900">{{ lugar.nombre }}</h2>
          <p class="text-xs text-slate-600 mt-2 leading-relaxed">{{ lugar.descripcionLarga }}</p>
        </div>

        <!-- Dirección y Horario -->
        <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
          <div class="flex items-start gap-2 text-slate-700">
            <MapPin class="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span><strong>Ubicación:</strong> {{ lugar.direccion }}</span>
          </div>
          <div class="flex items-center gap-2 text-slate-700">
            <Clock class="w-4 h-4 text-amber-500 shrink-0" />
            <span><strong>Horario:</strong> {{ lugar.horario }}</span>
          </div>
        </div>

        <!-- Menú / Catálogo Completo -->
        <div>
          <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Utensils class="w-4 h-4 text-sky-600" /> Catálogo / Menú de Servicios
          </h3>

          <div v-if="lugar.menu && lugar.menu.length > 0" class="space-y-2.5">
            <div 
              v-for="item in lugar.menu" 
              :key="item.id" 
              class="bg-white border border-slate-200 p-3 rounded-2xl flex justify-between items-start gap-3 shadow-sm"
            >
              <div>
                <p class="text-xs font-bold text-slate-800">{{ item.nombre }}</p>
                <p v-if="item.descripcion" class="text-[11px] text-slate-500 mt-0.5">{{ item.descripcion }}</p>
              </div>
              <span class="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 shrink-0">
                ${{ item.precio }}
              </span>
            </div>
          </div>

          <div v-else class="text-xs text-slate-400 py-2 flex items-center gap-1">
            <AlertCircle class="w-4 h-4" /> No hay menú registrado aún.
          </div>
        </div>

        <!-- Botón Directo a WhatsApp -->
        <a 
          :href="'https://wa.me/' + lugar.whatsapp + '?text=Hola,%20vi%20su%20local%20en%20GuiaPC%20y%20deseo%20más%20información.'" 
          target="_blank" 
          class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition"
        >
          <MessageCircle class="w-4 h-4" /> Escribir al WhatsApp Oficial
        </a>
      </div>

    </div>
  </div>
</template>