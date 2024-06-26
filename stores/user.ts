import { defineStore, storeToRefs } from 'pinia'
import { useBookStoreApiStore } from './book-store-api'
import { LIKE_CO_API } from '~/constant'

export const useUserStore = defineStore('user', () => {
  const bookStoreApiStore = useBookStoreApiStore()
  const { token } = storeToRefs(bookStoreApiStore)

  const bookUser = ref(null as any)

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
  }

  return {
    bookUser,
    fetchBookUserProfile,
    lazyFetchBookUserProfile,
    updateBookUserProfile
  }
})
