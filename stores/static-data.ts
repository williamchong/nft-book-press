import { defineStore } from 'pinia'

import { FetchLikerInfoByIdResult } from 'utils/api'

export const useStaticDataStore = defineStore('static-data', () => {
  const likerUserInfoMap = ref({} as Record<string, FetchLikerInfoByIdResult>)

  const getLikerUserInfoById = computed(() => (likerId: string) => {
    return likerUserInfoMap.value[likerId]
  })

  const getChannelInfoById = computed(() => (channelId: string) => {
    const likerId = convertChannelIdToLikerId(channelId)
    return getLikerUserInfoById.value(likerId)
  })

  async function lazyFetchLikerUserInfoById (likerId: string) {
    if (likerUserInfoMap.value[likerId]) {
      return likerUserInfoMap.value[likerId]
    }

    try {
      const result = await fetchLikerInfoById(likerId)
      if (result.error.value) {
        throw result.error.value
      }
      const userInfo = result.data.value
      if (!userInfo) {
        throw new Error('Missing data in `fetchLikerInfoById`')
      }
      likerUserInfoMap.value[likerId] = userInfo
      return userInfo
    } catch {
      return null
    }
  }

  async function lazyFetchChannelInfoById (channelId: string) {
    const likerId = convertChannelIdToLikerId(channelId)
    const result = await lazyFetchLikerUserInfoById(likerId)
    return result
  }

  return {
    getLikerUserInfoById,
    getChannelInfoById,
    lazyFetchLikerUserInfoById,
    lazyFetchChannelInfoById
  }
})
