import { defineStore, storeToRefs } from 'pinia'

import { useBookStoreApiStore } from './book-store-api'

export const useUserStore = defineStore('user', () => {
  const { LIKE_CO_API } = useRuntimeConfig().public

  const bookStoreApiStore = useBookStoreApiStore()
  const { token, isAuthenticated, wallet } = storeToRefs(bookStoreApiStore)

  const bookUser = ref<any>(null)
  const isUpdatingBookUserProfile = ref(false)
  const likerInfo = ref<any>(null)
  const isFetchingUserLikerInfo = ref(false)

  async function fetchBookUserProfile () {
    const { error, data } = await useFetch(
      `${LIKE_CO_API}/likernft/book/user/profile`,
      {
        headers: {
          authorization: `Bearer ${token.value}`
        }
      }
    )
    if (error.value) {
      throw error.value
    }
    bookUser.value = data.value
    return bookUser.value
  }

  function lazyFetchBookUserProfile () {
    if (bookUser.value) {
      return bookUser.value
    }
    return fetchBookUserProfile()
  }

  async function updateBookUserProfile (payload: any) {
    try {
      isUpdatingBookUserProfile.value = true
      const { error } = await useFetch(`${LIKE_CO_API}/likernft/book/user/profile`, {
        method: 'POST',
        body: payload,
        headers: {
          authorization: `Bearer ${token.value}`
        }
      })
      if (error.value) {
        throw error.value
      }
      bookUser.value = { ...bookUser.value, ...payload }
      return bookUser.value
    } finally {
      isUpdatingBookUserProfile.value = false
    }
  }

  async function fetchUserLikerInfo ({ nocache = false } = {}) {
    try {
      isFetchingUserLikerInfo.value = true
      const timestamp = nocache ? `?ts=${Math.round(new Date().getTime() / 1000)}` : ''
      const url = `${LIKE_CO_API}/users/addr/${wallet.value}/min${timestamp}`
      const { data, error: fetchError } = await useFetch(url)

      if (fetchError.value && fetchError.value?.statusCode !== 404) {
        throw new Error(fetchError.value.toString())
      }
      likerInfo.value = (data.value as any) || null
      return likerInfo.value
    } finally {
      isFetchingUserLikerInfo.value = false
    }
  }

  async function lazyFetchUserLikerInfo () {
    if (isAuthenticated.value && !likerInfo.value) {
      await fetchUserLikerInfo()
    }
    return likerInfo.value
  }

  watch(isAuthenticated, () => {
    if (isAuthenticated.value) {
      lazyFetchUserLikerInfo()
      lazyFetchBookUserProfile()
    } else {
      bookUser.value = null
      likerInfo.value = null
    }
  })

  return {
    bookUser,
    isUpdatingBookUserProfile,
    likerInfo,
    isFetchingUserLikerInfo,
    fetchBookUserProfile,
    lazyFetchBookUserProfile,
    updateBookUserProfile,
    fetchUserLikerInfo,
    lazyFetchUserLikerInfo
  }
})
