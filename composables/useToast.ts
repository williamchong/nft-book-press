export const useToastComposable = () => {
  const toast = useToast()

  const showErrorToast = (message: string) => {
    toast.add({
      icon: 'i-heroicons-exclamation-circle',
      title: message,
      duration: 3000,
      color: 'error'
    })
  }

  return {
    showErrorToast
  }
}
