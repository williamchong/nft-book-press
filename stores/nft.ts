import { defineStore } from 'pinia'

export const useNftStore = defineStore('nft', () => {
  const { LCD_URL, LIKE_CO_API } = useRuntimeConfig().public
  const classMetadataByIdMap = ref({} as Record<string, any>)
  const classListingInfoByIdMap = ref({} as Record<string, any>)

  const getClassMetadataById = computed(() => (classId: string) => classMetadataByIdMap.value[classId])

  const getClassListingInfoById = computed(() => (classId: string) => classListingInfoByIdMap.value[classId])

  async function fetchClassMetadataById (classId: string) {
    const { error, data } = await useFetch(`${LCD_URL}/cosmos/nft/v1beta1/classes/${classId}`)
    if (error.value) { throw error.value }
    const { class: classData } = data.value as any
    classMetadataByIdMap.value[classId] = classData
    return classData
  }

  function lazyFetchClassMetadataById (classId: string) {
    if (getClassMetadataById.value(classId)) { return getClassMetadataById.value(classId) }
    return fetchClassMetadataById(classId)
  }

  async function fetchClassListingInfoById (classId: string) {
    const { error, data } = await useFetch(`${LIKE_CO_API}/likernft/book/store/${classId}`)
    if (error.value) { throw error.value }
    const listingInfo = data.value as any
    classListingInfoByIdMap.value[classId] = listingInfo
    return listingInfo
  }

  function lazyFetchClassListingInfoById (classId: string) {
    if (classListingInfoByIdMap.value[classId]) { return classListingInfoByIdMap.value[classId] }
    return fetchClassListingInfoById(classId)
  }

  return {
    classMetadataByIdMap,
    classStoreDataByIdMap: classListingInfoByIdMap,
    getClassMetadataById,
    getClassListingInfoById,
    fetchClassMetadataById,
    lazyFetchClassMetadataById,
    fetchClassListingInfoById,
    lazyFetchClassListingInfoById
  }
})
