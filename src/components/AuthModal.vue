<script setup>
import { ref } from 'vue'
import { X } from 'lucide-vue-next'

const emit = defineEmits(['close', 'login'])

const selectedRole = ref('cliente')
const authEmail = ref('')
const authPassword = ref('')

const submit = () => {
  emit('login', {
    email: authEmail.value,
    password: authPassword.value,
    rol: selectedRole.value
  })
}
</script>

<template>
  <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end justify-center">
    <div class="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-4">
      <div class="flex justify-between items-center border-b pb-3">
        <h3 class="font-bold text-slate-800 text-base">Acceso a la Plataforma</h3>
        <button @click="$emit('close')" class="text-slate-400"><X class="w-5 h-5" /></button>
      </div>

      <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
        <button @click="selectedRole = 'cliente'" :class="['py-2 text-xs font-bold rounded-xl transition', selectedRole === 'cliente' ? 'bg-white shadow text-sky-600' : 'text-slate-500']">
          👤 Soy Cliente
        </button>
        <button @click="selectedRole = 'aliado'" :class="['py-2 text-xs font-bold rounded-xl transition', selectedRole === 'aliado' ? 'bg-white shadow text-sky-600' : 'text-slate-500']">
          🏪 Soy Aliado
        </button>
      </div>

      <form @submit.prevent="submit" class="space-y-3">
        <div>
          <label class="text-xs text-slate-500 font-semibold">Correo Electrónico</label>
          <input type="email" v-model="authEmail" required placeholder="correo@ejemplo.com" class="w-full border rounded-xl p-2.5 text-xs mt-1">
        </div>
        <div>
          <label class="text-xs text-slate-500 font-semibold">Contraseña</label>
          <input type="password" v-model="authPassword" required placeholder="••••••••" class="w-full border rounded-xl p-2.5 text-xs mt-1">
        </div>

        <button type="submit" class="w-full bg-sky-600 text-white font-bold text-xs py-3 rounded-xl shadow-md hover:bg-sky-700 transition">
          Entrar como {{ selectedRole === 'cliente' ? 'Cliente' : 'Aliado / Comercio' }}
        </button>
      </form>
    </div>
  </div>
</template>