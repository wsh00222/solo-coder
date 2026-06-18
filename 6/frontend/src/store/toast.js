import { reactive } from 'vue'

export function createToastStore() {
  const state = reactive({
    toasts: []
  })

  let idCounter = 0

  const show = (message, type = 'info', duration = 3000) => {
    const id = ++idCounter
    const toast = { id, message, type }
    state.toasts.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  const remove = (id) => {
    const index = state.toasts.findIndex(t => t.id === id)
    if (index > -1) {
      state.toasts.splice(index, 1)
    }
  }

  return {
    state,
    show,
    remove,
    success: (msg, duration) => show(msg, 'success', duration),
    error: (msg, duration) => show(msg, 'error', duration),
    info: (msg, duration) => show(msg, 'info', duration),
    warning: (msg, duration) => show(msg, 'warning', duration)
  }
}
