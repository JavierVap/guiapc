<script setup>
import { ref } from 'vue'
import { PlusCircle, Trash2, Lock } from 'lucide-vue-next'

const props = defineProps({
  currentUser: Object,
  aliadoMenu: Array
})

const emit = defineEmits(['addItem', 'removeItem', 'openAuth'])

const newItem = ref({ nombre: '', precio: '' })

const handleAdd = () => {
  if (newItem.value.nombre && newItem.value.precio) {
    emit('addItem', { ...newItem.value })
    newItem.value.nombre = ''
    newItem.value.precio = ''
  }
}
</script>

<template>
  <main class="p-4 flex-1 space-y-4">
    <div v-if="currentUser && currentUser.rol === 'aliado'" class="space-y-4">
      <div class="bg-sky-50 border border-sky-200 p-4 rounded-2xl">
        <h2 class="font-bold text-slate-800 text-sm">Panel de Comercio 🏢</h2>
        <p class="text-xs text-slate-500">Gestiona tus datos y catálogo de productos.</p>
      </div>

      <div class="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
        <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Cargar Nuevo Producto / Plato</h3>
        
        <div>
          <label class="text-xs text-slate-500 font-semibold">Nombre del producto</label>
          <input type="text" v-model="newItem.nombre" placeholder="Ej. Pescado Frito con Tobobanes" class="w-full border rounded-xl p-2 text-xs mt-1">
        </div>

        <div>
          <label class="text-xs text-slate-500 font-semibold">Precio ($ USD)</label>
          <input type="number" v-model="newItem.precio" placeholder="12.00" class="w-full border rounded-xl p-2 text-xs mt-1">
        </div>

        <button @click="handleAdd" class="w-full bg-sky-600 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1 hover:bg-sky-700 transition">
          <PlusCircle class="w-4 h-4" /> Añadir al Menú
        </button>
      </div>

      <div class="bg-white border border-slate-200 p-4 rounded-2xl">
        <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tu Menú Activo</h3>
        <div v-if="aliadoMenu.length === 0" class="text-xs text-slate-400 py-2 text-center">No has cargado platos aún.</div>
        <div v-else class="space-y-2">
          <div v-for="(item, index) in aliadoMenu" :key="index" class="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border text-xs">
            <div>
              <p class="font-bold text-slate-800">{{ item.nombre }}</p>
              <p class="text-emerald-600 font-bold">${{ item.precio }}</p>
            </div>
            <button @click="$emit('removeItem', index)" class="text-red-500 p-1">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <Lock class="w-10 h-10 text-slate-300 mx-auto mb-2" />
      <p class="text-xs text-slate-500">Debes iniciar sesión como **Aliado / Comercio** para acceder.</p>
      <button @click="$emit('openAuth')" class="mt-3 bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Ingresar Ahora</button>
    </div>
  </main>
</template>