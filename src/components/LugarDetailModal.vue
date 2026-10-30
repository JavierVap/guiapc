<script setup>
import { ref } from 'vue'
import { X, MapPin, Clock, Truck, Utensils, MessageCircle, AlertCircle, Heart, Star, Share2, ExternalLink } from 'lucide-vue-next'

const props = defineProps({
  lugar: Object,
  currentUser: Object,
  isFavorite: Boolean,
  reviewError: String,
  reviewSuccess: String,
})

const emit = defineEmits(['close', 'toggle-favorite', 'submit-review', 'share'])
const rating = ref(5)
const comment = ref('')

function submitReview() {
  emit('submit-review', { rating: rating.value, comment: comment.value })
  comment.value = ''
}
</script>

<template>
  <div v-if="lugar" class="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
      
      <!-- Imagen y Botón Cerrar -->
      <div class="relative h-48 sm:h-56 w-full shrink-0">
        <img :src="lugar.image" :alt="lugar.nombre" class="w-full h-full object-cover">
        <div v-if="lugar.isFeatured" class="absolute bottom-3 left-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950">Recomendado</div>
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
            <Truck v-if="lugar.hasDelivery" class="w-3 h-3" /> {{ lugar.hasDelivery ? 'Delivery disponible' : 'Visita presencial' }}
          </span>
        </div>
      </div>

      <div v-if="lugar.imageCredit" class="flex flex-wrap gap-x-1 px-5 pt-3 text-[11px] text-slate-500">
        <a :href="lugar.imageSource" target="_blank" rel="noopener noreferrer" class="underline hover:text-sky-700">
          Fotografía: {{ lugar.imageCredit }}
        </a>
        <span>·</span>
        <a :href="lugar.imageLicenseUrl" target="_blank" rel="noopener noreferrer" class="underline hover:text-sky-700">
          {{ lugar.imageLicense }}
        </a>
      </div>

      <!-- Contenido de Información -->
      <div class="p-5 space-y-5 flex-1">
        <div class="flex flex-wrap gap-2">
          <a
            :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lugar.nombre}, ${lugar.direccion}, ${lugar.zona}`)}`"
            target="_blank" rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100"
          ><MapPin class="h-4 w-4" /> Cómo llegar <ExternalLink class="h-3 w-3" /></a>
          <button @click="emit('share')" class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">
            <Share2 class="h-4 w-4" /> Compartir
          </button>
          <button v-if="currentUser" @click="emit('toggle-favorite', lugar)" class="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100">
            <Heart class="h-4 w-4" :fill="isFavorite ? 'currentColor' : 'none'" /> {{ isFavorite ? 'Guardado' : 'Guardar favorito' }}
          </button>
        </div>

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
            <span><strong>Horario:</strong> {{ lugar.horario || 'Consultar con el establecimiento' }}</span>
          </div>
          <p v-if="lugar.parkingInfo" class="text-slate-700"><strong>Estacionamiento:</strong> {{ lugar.parkingInfo }}</p>
          <p v-if="lugar.accessibilityInfo" class="text-slate-700"><strong>Accesibilidad:</strong> {{ lugar.accessibilityInfo }}</p>
          <p v-if="lugar.paymentMethods" class="text-slate-700"><strong>Pagos:</strong> {{ lugar.paymentMethods }}</p>
        </div>

        <div v-if="lugar.photos?.length" class="grid grid-cols-2 gap-2">
          <img v-for="photo in lugar.photos" :key="photo" :src="photo" :alt="`Foto de ${lugar.nombre}`" class="h-32 w-full rounded-xl object-cover">
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

          <section class="space-y-3">
            <h3 class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <Star class="h-4 w-4 text-amber-500" /> Opiniones
              <span v-if="lugar.averageRating" class="normal-case text-amber-600">{{ lugar.averageRating.toFixed(1) }}/5 · {{ lugar.reviewCount }}</span>
            </h3>
            <article v-for="review in lugar.reviews" :key="review.id" class="rounded-xl bg-slate-50 p-3">
              <p class="text-xs font-bold text-amber-600">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</p>
              <p class="mt-1 text-sm text-slate-700">{{ review.comment }}</p>
              <p class="mt-1 text-[11px] text-slate-400">{{ review.user.name }}</p>
            </article>
            <p v-if="!lugar.reviews?.length" class="text-xs text-slate-500">Aún no hay opiniones aprobadas.</p>
            <form v-if="currentUser" @submit.prevent="submitReview" class="space-y-2 rounded-xl border border-slate-200 p-3">
              <label class="block text-xs font-semibold text-slate-600">Tu calificación
                <select v-model.number="rating" class="ml-2 rounded-lg border p-1">
                  <option v-for="score in [5, 4, 3, 2, 1]" :key="score" :value="score">{{ score }} estrellas</option>
                </select>
              </label>
              <textarea v-model.trim="comment" required minlength="10" maxlength="1000" rows="3" placeholder="Comparte una opinión útil y respetuosa..." class="w-full rounded-xl border p-3 text-sm"></textarea>
              <p v-if="reviewError" role="alert" class="text-xs text-red-600">{{ reviewError }}</p>
              <p v-if="reviewSuccess" role="status" class="text-xs text-emerald-700">{{ reviewSuccess }}</p>
              <button type="submit" class="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white">Enviar para moderación</button>
              <p class="text-[11px] text-slate-400">Tu opinión se publica cuando sea revisada.</p>
            </form>
            <button v-else type="button" @click="emit('open-auth')" class="text-xs font-semibold text-sky-700 underline">Inicia sesión para dejar una opinión.</button>
          </section>
        </div>

        <!-- Botón Directo a WhatsApp -->
        <a
          v-if="lugar.whatsapp"
          :href="'https://wa.me/' + lugar.whatsapp + '?text=Hola,%20vi%20su%20local%20en%20GuiaPC%20y%20deseo%20más%20información.'" 
          target="_blank" 
          rel="noopener noreferrer"
          class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition"
        >
          <MessageCircle class="w-4 h-4" /> Escribir al WhatsApp Oficial
        </a>
        <p v-else class="text-center text-xs text-slate-500">Este negocio aún no ha registrado su WhatsApp.</p>
      </div>

    </div>
  </div>
</template>