export interface FetchLikerInfoByIdResult {
  user: string
  displayName: string
  avatar: string
  wallet: string
  cosmosWallet: string
  likeWallet: string
  isSubscribedCivicLiker: boolean
  civicLikerSince: number
  description: string
}

export async function fetchLikerInfoById (likerId: string) {
  const { LIKE_CO_API } = useRuntimeConfig().public
  const url = `${LIKE_CO_API}/users/id/${likerId}/min`
  const result = await useFetch<FetchLikerInfoByIdResult>(url)
  return result
}
