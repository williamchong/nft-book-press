import { defineStore, storeToRefs } from 'pinia'
import * as jwt from 'jsonwebtoken'
import { useWalletStore } from './wallet'
import { LIKE_CO_API } from '~/constant'

export const useBookStoreApiStore = defineStore('book-api', () => {
  const walletStore = useWalletStore()
  const { wallet: storeWallet } = storeToRefs(walletStore)
  const token = ref('')
  const sessionWallet = ref('')

  const isAuthenticated = computed(() => {
    const isWalletMatch = storeWallet.value === sessionWallet.value
    const tokenExists = !!token.value
    if (!isWalletMatch || !tokenExists) { return false }
    const decoded = jwt.decode(token.value) as jwt.JwtPayload
    if (!decoded) { return false }
    return decoded.exp && (decoded.exp > (Date.now() / 1000))
  })

  function restoreSession (inputWallet: string, inputToken: string) {
    token.value = inputToken
    sessionWallet.value = inputWallet
  }

  async function authenticate (inputWallet: string, signature: any) {
    const { error, data } = await useFetch(`${LIKE_CO_API}/wallet/authorize`, {
      method: 'POST',
      body: signature
    })
    if (error.value) { throw error.value }
    if ((!data?.value as any)?.token) { throw new Error('INVALID_SIGNATURE') }
    token.value = (data.value as any).token
    sessionWallet.value = inputWallet
  }

  async function newBookListing (classId: string, payload: any) {
    const { error, data } = await useFetch(`${LIKE_CO_API}/likernft/book/store/${classId}/new`, {
      method: 'POST',
      body: payload,
      headers: {
        authorization: `Bearer ${token.value}`
      }
    })
    if (error.value) {
      throw error.value
    }
    return data
  }

  async function updateBookListingSetting (classId: string, payload: any) {
    const { error, data } = await useFetch(`${LIKE_CO_API}/likernft/book/store/${classId}/settings`, {
      method: 'POST',
      body: payload,
      headers: {
        authorization: `Bearer ${token.value}`
      }
    })
    if (error.value) {
      throw error.value
    }
    return data
  }

  async function updateEditionPrice (classId: string, priceIndex:any, payload: any) {
    const { error, data } = await useFetch(`${LIKE_CO_API}/likernft/book/store/${classId}/price/${priceIndex}`, {
      method: 'PUT',
      body: payload,
      headers: {
        authorization: `Bearer ${token.value}`
      }
    })
    if (error.value) {
      throw error.value
    }
    return data
  }

  async function addEditionPrice (classId: string, priceIndex: any, payload: any) {
    const { error, data } = await useFetch(`${LIKE_CO_API}/likernft/book/store/${classId}/price/${priceIndex}`, {
      method: 'POST',
      body: payload,
      headers: {
        authorization: `Bearer ${token.value}`
      }
    })
    if (error.value) {
      throw error.value
    }
    return data
  }

  async function listNFTBookCollections () {
    const { error, data } = await useFetch(`${LIKE_CO_API}/likernft/collections`, {
      query: {
        wallet: sessionWallet.value
      },
      headers: token.value
        ? {
            authorization: `Bearer ${token.value}`
          }
        : undefined
    })
    if (error.value) {
      throw error.value
    }
    return data
  }

  async function getNFTBookCollectionById (collectionId: string) {
    const { error, data } = await useFetch(`${LIKE_CO_API}/likernft/collections/${collectionId}`, {
      headers: token.value
        ? {
            authorization: `Bearer ${token.value}`
          }
        : undefined
    })
    if (error.value) {
      throw error.value
    }
    return data
  }

  async function newNFTBookCollection (payload: any) {
    const { error, data } = await useFetch(`${LIKE_CO_API}/likernft/collections`, {
      method: 'POST',
      body: { type: 'book', ...payload },
      headers: {
        authorization: `Bearer ${token.value}`
      }
    })
    if (error.value) {
      throw error.value
    }
    return data
  }

  async function updateNFTBookCollectionById (collectionId: string, payload: any) {
    const { error, data } = await useFetch(`${LIKE_CO_API}/likernft/collections/${collectionId}`, {
      method: 'PATCH',
      body: payload,
      headers: {
        authorization: `Bearer ${token.value}`
      }
    })
    if (error.value) {
      throw error.value
    }
    return data
  }

  async function deleteNFTBookCollectionById (collectionId: string) {
    const { error, data } = await useFetch(`${LIKE_CO_API}/likernft/collections/${collectionId}`, {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token.value}`
      }
    })
    if (error.value) {
      throw error.value
    }
    return data
  }

  return {
    token,
    wallet: sessionWallet,
    isAuthenticated,
    restoreSession,
    authenticate,
    newBookListing,
    updateBookListingSetting,
    updateEditionPrice,
    addEditionPrice,
    listNFTBookCollections,
    getNFTBookCollectionById,
    newNFTBookCollection,
    updateNFTBookCollectionById,
    deleteNFTBookCollectionById
  }
})
