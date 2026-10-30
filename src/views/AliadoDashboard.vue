<script setup>
import { computed, onMounted, ref } from 'vue'
import { CalendarDays, Check, Lock, PlusCircle, RefreshCw, Sparkles, Star, X } from 'lucide-vue-next'
import { apiService } from '../services/api'

const props = defineProps({
  currentUser: { type: Object, required: true },
})
const emit = defineEmits(['places-changed'])

const isAdmin = computed(() => props.currentUser.role === 'ADMIN')
const places = ref([])
const pendingPlaces = ref([])
const pendingEvents = ref([])
const pendingReviews = ref([])
const users = ref([])
const events = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const editingPlaceId = ref(null)
const editingEventId = ref(null)
const photosText = ref('')
const eventForm = ref({ title: '', description: '', startsAt: '', endsAt: '', venue: '', address: '', priceInfo: '', image: '' })
const createEmptyForm = () => ({
  nombre: '',
  categoria: 'comida',
  zona: '',
  direccion: '',
  horario: '',
  hasDelivery: false,
  descripcion: '',
  descripcionLarga: '',
  image: '',
  whatsapp: '',
  parkingInfo: '',
  accessibilityInfo: '',
  paymentMethods: '',
  photos: [],
})
const form = ref(createEmptyForm())

async function loadDashboard() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const tasks = [apiService.getMyPlaces(), apiService.getMyEvents()]
    if (isAdmin.value) tasks.push(
      apiService.getPendingPlaces(),
      apiService.getUsers(),
      apiService.getPendingEvents(),
      apiService.getPendingReviews(),
    )
    const [mine, myEvents, pending = [], allUsers = [], waitingEvents = [], waitingReviews = []] = await Promise.all(tasks)
    places.value = mine
    events.value = myEvents
    pendingPlaces.value = pending
    users.value = allUsers
    pendingEvents.value = waitingEvents
    pendingReviews.value = waitingReviews
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

async function submitPlace() {
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const payload = { ...form.value }
    payload.photos = photosText.value.split(/\r?\n/).map((photo) => photo.trim()).filter(Boolean)
    for (const key of ['horario', 'descripcionLarga', 'image', 'whatsapp', 'parkingInfo', 'accessibilityInfo', 'paymentMethods']) {
      if (!payload[key]) delete payload[key]
    }
    if (!payload.photos.length) delete payload.photos
    if (editingPlaceId.value) {
      await apiService.updatePlace(editingPlaceId.value, payload)
      successMessage.value = isAdmin.value
        ? 'Negocio actualizado.'
        : 'Negocio actualizado y enviado nuevamente para aprobación.'
    } else {
      await apiService.createPlace(payload)
      successMessage.value = 'Negocio enviado. Aparecerá en la guía después de su aprobación.'
    }
    cancelEdit()
    await loadDashboard()
    emit('places-changed')
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isSubmitting.value = false
  }
}

function startEdit(place) {
  editingPlaceId.value = place.id
  form.value = {
    nombre: place.nombre,
    categoria: place.categoria,
    zona: place.zona,
    direccion: place.direccion,
    horario: place.horario ?? '',
    hasDelivery: place.hasDelivery,
    descripcion: place.descripcion,
    descripcionLarga: place.descripcionLarga ?? '',
    image: place.image ?? '',
    whatsapp: place.whatsapp ?? '',
    parkingInfo: place.parkingInfo ?? '',
    accessibilityInfo: place.accessibilityInfo ?? '',
    paymentMethods: place.paymentMethods ?? '',
    photos: place.photos ?? [],
  }
  photosText.value = (place.photos ?? []).join('\n')
  errorMessage.value = ''
  successMessage.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editingPlaceId.value = null
  form.value = createEmptyForm()
  photosText.value = ''
}

function dateInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

async function submitEvent() {
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const payload = {
      ...eventForm.value,
      startsAt: new Date(eventForm.value.startsAt).toISOString(),
      ...(eventForm.value.endsAt ? { endsAt: new Date(eventForm.value.endsAt).toISOString() } : {}),
    }
    delete payload.endsAt
    if (eventForm.value.endsAt) payload.endsAt = new Date(eventForm.value.endsAt).toISOString()
    if (!payload.priceInfo) delete payload.priceInfo
    if (!payload.image) delete payload.image
    if (editingEventId.value) {
      await apiService.updateEvent(editingEventId.value, payload)
      successMessage.value = isAdmin.value ? 'Evento actualizado.' : 'Evento actualizado y enviado a revisión.'
    } else {
      await apiService.createEvent(payload)
      successMessage.value = 'Evento enviado para aprobación.'
    }
    cancelEventEdit()
    await loadDashboard()
    emit('places-changed')
  } catch (error) {
    errorMessage.value = error.message
  }
}

function startEventEdit(event) {
  editingEventId.value = event.id
  eventForm.value = {
    title: event.title,
    description: event.description,
    startsAt: dateInputValue(event.startsAt),
    endsAt: dateInputValue(event.endsAt),
    venue: event.venue,
    address: event.address,
    priceInfo: event.priceInfo ?? '',
    image: event.image ?? '',
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEventEdit() {
  editingEventId.value = null
  eventForm.value = { title: '', description: '', startsAt: '', endsAt: '', venue: '', address: '', priceInfo: '', image: '' }
}

async function moderate(place, status) {
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await apiService.moderatePlace(place.id, status)
    successMessage.value = status === 'APPROVED' ? 'Negocio aprobado.' : 'Negocio rechazado.'
    await loadDashboard()
    emit('places-changed')
  } catch (error) {
    errorMessage.value = error.message
  }
}

async function moderateEvent(event, status) {
  errorMessage.value = ''
  try {
    await apiService.moderateEvent(event.id, status)
    successMessage.value = status === 'APPROVED' ? 'Evento aprobado.' : 'Evento rechazado.'
    await loadDashboard()
    emit('places-changed')
  } catch (error) {
    errorMessage.value = error.message
  }
}

async function moderateReview(review, status) {
  errorMessage.value = ''
  try {
    await apiService.moderateReview(review.id, status)
    successMessage.value = status === 'APPROVED' ? 'Opinión publicada.' : 'Opinión rechazada.'
    await loadDashboard()
    emit('places-changed')
  } catch (error) {
    errorMessage.value = error.message
  }
}

async function toggleFeatured(place) {
  errorMessage.value = ''
  try {
    await apiService.togglePlaceFeatured(place.id, !place.isFeatured)
    await loadDashboard()
    emit('places-changed')
    emit('places-changed')
  } catch (error) {
    errorMessage.value = error.message
  }
}

async function toggleEventFeatured(event) {
  errorMessage.value = ''
  try {
    await apiService.toggleEventFeatured(event.id, !event.isFeatured)
    await loadDashboard()
    emit('places-changed')
    emit('places-changed')
  } catch (error) {
    errorMessage.value = error.message
  }
}

async function toggleRole(user) {
  errorMessage.value = ''
  successMessage.value = ''
  const role = user.role === 'COLLABORATOR' ? 'CLIENT' : 'COLLABORATOR'
  try {
    await apiService.updateUserRole(user.id, role)
    successMessage.value = `Permisos actualizados para ${user.name}.`
    await loadDashboard()
  } catch (error) {
    errorMessage.value = error.message
  }
}

onMounted(loadDashboard)
</script>

<template>
  <main class="space-y-6">
    <div class="rounded-2xl border border-sky-200 bg-sky-50 p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-slate-800">{{ isAdmin ? 'Panel de administración' : 'Panel de colaborador' }}</h1>
          <p class="mt-1 text-sm text-slate-600">Hola, {{ currentUser.name }}. Los negocios y eventos enviados necesitan aprobación para publicarse.</p>
        </div>
        <button @click="loadDashboard" :disabled="isLoading" aria-label="Actualizar panel" class="rounded-lg p-2 text-sky-700 hover:bg-sky-100 disabled:opacity-50">
          <RefreshCw class="h-5 w-5" />
        </button>
      </div>
    </div>

    <p v-if="errorMessage" role="alert" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>
    <p v-if="successMessage" role="status" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ successMessage }}</p>
    <p v-if="isLoading" class="text-sm text-slate-500">Cargando panel...</p>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 class="mb-4 text-base font-bold text-slate-800">
        {{ editingPlaceId ? 'Editar negocio' : 'Proponer un negocio o emprendimiento' }}
      </h2>
      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="submitPlace">
        <label class="text-xs font-semibold text-slate-600">
          Nombre del negocio
          <input v-model.trim="form.nombre" required minlength="2" maxlength="150" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <label class="text-xs font-semibold text-slate-600">
          Categoría
          <select v-model="form.categoria" required class="mt-1 w-full rounded-xl border bg-white p-3 text-sm font-normal">
            <option value="comida">Gastronomía</option>
            <option value="playa">Playas y turismo</option>
            <option value="eventos">Eventos y cultura</option>
            <option value="comercio">Comercios y servicios</option>
            <option value="hotel">Hoteles y posadas</option>
          </select>
        </label>
        <label class="text-xs font-semibold text-slate-600">
          Zona
          <input v-model.trim="form.zona" required maxlength="120" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <label class="text-xs font-semibold text-slate-600">
          Dirección
          <input v-model.trim="form.direccion" required maxlength="255" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <label class="text-xs font-semibold text-slate-600">
          Horario
          <input v-model.trim="form.horario" maxlength="255" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <label class="text-xs font-semibold text-slate-600">
          WhatsApp (código de país + número)
          <input v-model.trim="form.whatsapp" maxlength="30" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <label class="text-xs font-semibold text-slate-600 sm:col-span-2">
          Descripción breve
          <textarea v-model.trim="form.descripcion" required minlength="5" maxlength="2000" rows="2" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal"></textarea>
        </label>
        <label class="text-xs font-semibold text-slate-600 sm:col-span-2">
          Descripción completa
          <textarea v-model.trim="form.descripcionLarga" maxlength="10000" rows="3" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal"></textarea>
        </label>
        <label class="text-xs font-semibold text-slate-600 sm:col-span-2">
          URL de imagen (opcional)
          <input v-model.trim="form.image" type="url" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <label class="text-xs font-semibold text-slate-600">
          Estacionamiento
          <input v-model.trim="form.parkingInfo" maxlength="1000" placeholder="Indica si está confirmado" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <label class="text-xs font-semibold text-slate-600">
          Accesibilidad
          <input v-model.trim="form.accessibilityInfo" maxlength="1000" placeholder="Indica si está confirmado" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <label class="text-xs font-semibold text-slate-600 sm:col-span-2">
          Métodos de pago
          <input v-model.trim="form.paymentMethods" maxlength="500" placeholder="Solo métodos confirmados por el establecimiento" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <label class="text-xs font-semibold text-slate-600 sm:col-span-2">
          Fotos adicionales (una URL pública por línea, máximo 8)
          <textarea v-model="photosText" rows="3" placeholder="https://..." class="mt-1 w-full rounded-xl border p-3 text-sm font-normal"></textarea>
        </label>
        <label class="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
          <input v-model="form.hasDelivery" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-sky-600">
          Ofrece delivery
        </label>
        <button type="submit" :disabled="isSubmitting" class="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-50 sm:col-span-2">
          <PlusCircle class="h-4 w-4" /> {{ isSubmitting ? 'Guardando...' : editingPlaceId ? 'Guardar cambios' : 'Enviar para aprobación' }}
        </button>
        <button v-if="editingPlaceId" type="button" @click="cancelEdit" class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 sm:col-span-2">
          Cancelar edición
        </button>
      </form>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 class="mb-4 flex items-center gap-2 text-base font-bold text-slate-800"><CalendarDays class="h-5 w-5 text-sky-600" />{{ editingEventId ? 'Editar evento' : 'Publicar un evento' }}</h2>
      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="submitEvent">
        <label class="text-xs font-semibold text-slate-600">Nombre del evento
          <input v-model.trim="eventForm.title" required minlength="3" maxlength="150" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <label class="text-xs font-semibold text-slate-600">Lugar
          <input v-model.trim="eventForm.venue" required maxlength="150" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <label class="text-xs font-semibold text-slate-600">Dirección
          <input v-model.trim="eventForm.address" required maxlength="255" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <label class="text-xs font-semibold text-slate-600">Fecha y hora de inicio
          <input v-model="eventForm.startsAt" type="datetime-local" required class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <label class="text-xs font-semibold text-slate-600">Fecha y hora de cierre (opcional)
          <input v-model="eventForm.endsAt" type="datetime-local" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <label class="text-xs font-semibold text-slate-600">Precio o entrada
          <input v-model.trim="eventForm.priceInfo" maxlength="191" placeholder="Gratis, consultar..." class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <label class="text-xs font-semibold text-slate-600 sm:col-span-2">Descripción
          <textarea v-model.trim="eventForm.description" required minlength="10" maxlength="3000" rows="3" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal"></textarea>
        </label>
        <label class="text-xs font-semibold text-slate-600 sm:col-span-2">URL de imagen opcional
          <input v-model.trim="eventForm.image" type="url" class="mt-1 w-full rounded-xl border p-3 text-sm font-normal">
        </label>
        <button type="submit" class="rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white hover:bg-sky-700 sm:col-span-2">
          {{ editingEventId ? 'Guardar evento' : 'Enviar evento para aprobación' }}
        </button>
        <button v-if="editingEventId" type="button" @click="cancelEventEdit" class="rounded-xl border px-4 py-3 text-sm font-bold text-slate-600 sm:col-span-2">Cancelar edición</button>
      </form>
    </section>

    <section v-if="isAdmin" class="space-y-3">
      <h2 class="text-base font-bold text-slate-800">Negocios pendientes ({{ pendingPlaces.length }})</h2>
      <p v-if="!pendingPlaces.length && !isLoading" class="rounded-xl bg-white p-4 text-sm text-slate-500">No hay negocios por revisar.</p>
      <article v-for="place in pendingPlaces" :key="place.id" class="rounded-2xl border border-amber-200 bg-white p-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="font-bold text-slate-800">{{ place.nombre }}</h3>
            <p class="text-xs text-slate-500">{{ place.categoria }} · {{ place.zona }} · Enviado por {{ place.createdBy?.name }}</p>
            <p class="mt-2 text-sm text-slate-600">{{ place.descripcion }}</p>
          </div>
          <div class="flex gap-2">
            <button @click="moderate(place, 'APPROVED')" class="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><Check class="h-4 w-4" /> Aprobar</button>
            <button @click="moderate(place, 'REJECTED')" class="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white"><X class="h-4 w-4" /> Rechazar</button>
          </div>
        </div>
      </article>
    </section>

    <section v-if="isAdmin" class="space-y-3">
      <h2 class="flex items-center gap-2 text-base font-bold text-slate-800"><CalendarDays class="h-5 w-5 text-sky-600" />Eventos pendientes ({{ pendingEvents.length }})</h2>
      <p v-if="!pendingEvents.length && !isLoading" class="rounded-xl bg-white p-4 text-sm text-slate-500">No hay eventos pendientes.</p>
      <article v-for="event in pendingEvents" :key="event.id" class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white p-4">
        <div><h3 class="font-bold">{{ event.title }}</h3><p class="text-xs text-slate-500">{{ event.venue }} · {{ new Date(event.startsAt).toLocaleString('es-VE') }} · {{ event.createdBy?.name }}</p></div>
        <div class="flex gap-2">
          <button @click="moderateEvent(event, 'APPROVED')" class="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Aprobar</button>
          <button @click="moderateEvent(event, 'REJECTED')" class="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">Rechazar</button>
        </div>
      </article>
    </section>

    <section v-if="isAdmin" class="space-y-3">
      <h2 class="flex items-center gap-2 text-base font-bold text-slate-800"><Star class="h-5 w-5 text-amber-500" />Opiniones pendientes ({{ pendingReviews.length }})</h2>
      <p v-if="!pendingReviews.length && !isLoading" class="rounded-xl bg-white p-4 text-sm text-slate-500">No hay opiniones por moderar.</p>
      <article v-for="review in pendingReviews" :key="review.id" class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white p-4">
        <div><p class="font-bold">{{ review.place.nombre }} · {{ review.rating }}/5 estrellas</p><p class="text-sm">{{ review.comment }}</p><p class="text-xs text-slate-500">{{ review.user.name }} · {{ review.user.email }}</p></div>
        <div class="flex gap-2">
          <button @click="moderateReview(review, 'APPROVED')" class="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Publicar</button>
          <button @click="moderateReview(review, 'REJECTED')" class="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">Rechazar</button>
        </div>
      </article>
    </section>

    <section v-if="isAdmin" class="space-y-3">
      <h2 class="text-base font-bold text-slate-800">Gestión de colaboradores</h2>
      <div v-if="users.length" class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th class="p-3">Usuario</th><th class="p-3">Correo</th><th class="p-3">Rol</th><th class="p-3">Acción</th></tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-t border-slate-100">
              <td class="p-3 font-medium">{{ user.name }}</td>
              <td class="p-3">{{ user.email }}</td>
              <td class="p-3">{{ user.role }}</td>
              <td class="p-3">
                <button v-if="user.role !== 'ADMIN'" @click="toggleRole(user)" class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">
                  {{ user.role === 'COLLABORATOR' ? 'Quitar colaborador' : 'Hacer colaborador' }}
                </button>
                <span v-else class="flex items-center gap-1 text-xs text-slate-400"><Lock class="h-3 w-3" /> Administrador</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else-if="!isLoading" class="rounded-xl bg-white p-4 text-sm text-slate-500">No hay usuarios registrados.</p>
    </section>

    <section class="space-y-3">
      <h2 class="text-base font-bold text-slate-800">{{ isAdmin ? 'Todos los negocios' : 'Tus negocios' }}</h2>
      <p v-if="!places.length && !isLoading" class="rounded-xl bg-white p-4 text-sm text-slate-500">Todavía no hay negocios para mostrar.</p>
      <article v-for="place in places" :key="place.id" class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <h3 class="font-bold text-slate-800">{{ place.nombre }}</h3>
          <p class="text-xs text-slate-500">{{ place.zona }} · {{ place.status }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{{ place.status }}</span>
          <button v-if="isAdmin && place.status === 'APPROVED'" @click="toggleFeatured(place)" class="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100">
            {{ place.isFeatured ? 'Quitar recomendado' : 'Destacar' }}
          </button>
          <button @click="startEdit(place)" class="rounded-lg bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100">Editar</button>
        </div>
      </article>
    </section>

    <section class="space-y-3">
      <h2 class="text-base font-bold text-slate-800">Eventos</h2>
      <p v-if="!events.length && !isLoading" class="rounded-xl bg-white p-4 text-sm text-slate-500">Todavía no hay eventos enviados.</p>
      <article v-for="event in events" :key="event.id" class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div><h3 class="font-bold text-slate-800">{{ event.title }}</h3><p class="text-xs text-slate-500">{{ new Date(event.startsAt).toLocaleString('es-VE') }} · {{ event.status }}</p></div>
        <div class="flex flex-wrap gap-2">
          <button v-if="isAdmin && event.status === 'APPROVED'" @click="toggleEventFeatured(event)" class="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">{{ event.isFeatured ? 'Quitar recomendado' : 'Destacar' }}</button>
          <button @click="startEventEdit(event)" class="rounded-lg bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">Editar</button>
        </div>
      </article>
    </section>
  </main>
</template>
