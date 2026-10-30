<script setup>
import { ref } from 'vue'
import { X } from 'lucide-vue-next'

const emit = defineEmits(['close', 'submit'])
const props = defineProps({
  errorMessage: String,
  isSubmitting: Boolean,
})

const mode = ref('login')
const name = ref('')
const email = ref('')
const password = ref('')

const submit = () => {
  emit('submit', {
    mode: mode.value,
    name: name.value,
    email: email.value,
    password: password.value,
  })
}
</script>

<template>
  <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end justify-center">
    <div class="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-4">
      <div class="flex justify-between items-center border-b pb-3">
        <h3 class="font-bold text-slate-800 text-base">{{ mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta de cliente' }}</h3>
        <button type="button" aria-label="Cerrar" @click="emit('close')" class="text-slate-400"><X class="w-5 h-5" /></button>
      </div>

      <p class="text-xs text-slate-500">
        {{ mode === 'login' ? 'Accede a tu cuenta de GuiaPC.' : 'La cuenta nueva tendrá permisos de cliente.' }}
      </p>

      <form @submit.prevent="submit" class="space-y-3">
        <div v-if="mode === 'register'">
          <label for="auth-name" class="text-xs text-slate-500 font-semibold">Nombre</label>
          <input id="auth-name" v-model.trim="name" required minlength="2" maxlength="100" autocomplete="name" class="w-full border rounded-xl p-2.5 text-xs mt-1">
        </div>
        <div>
          <label for="auth-email" class="text-xs text-slate-500 font-semibold">Correo electrónico</label>
          <input id="auth-email" v-model.trim="email" type="email" required maxlength="254" autocomplete="email" placeholder="correo@ejemplo.com" class="w-full border rounded-xl p-2.5 text-xs mt-1">
        </div>
        <div>
          <label for="auth-password" class="text-xs text-slate-500 font-semibold">Contraseña</label>
          <input id="auth-password" v-model="password" type="password" required :minlength="mode === 'register' ? 8 : 1" maxlength="72" :autocomplete="mode === 'register' ? 'new-password' : 'current-password'" placeholder="••••••••" class="w-full border rounded-xl p-2.5 text-xs mt-1">
        </div>
        <p v-if="props.errorMessage" role="alert" class="text-xs text-red-600">{{ props.errorMessage }}</p>
        <button type="submit" :disabled="props.isSubmitting" class="w-full bg-sky-600 disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl shadow-md hover:bg-sky-700 transition">
          {{ props.isSubmitting ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Registrarme' }}
        </button>
      </form>

      <button type="button" :disabled="props.isSubmitting" class="w-full text-xs text-sky-700 font-semibold" @click="mode = mode === 'login' ? 'register' : 'login'">
        {{ mode === 'login' ? '¿No tienes cuenta? Regístrate' : 'Ya tengo cuenta. Iniciar sesión' }}
      </button>
    </div>
  </div>
</template>
