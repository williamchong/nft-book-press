import { useWriteContract } from '@wagmi/vue'
import type { Hash } from 'viem'

import type { SponsoredWriteContractParams } from './useSponsoredTransaction'

export function useContractWrite () {
  const { writeContractAsync: wagmiWriteContract } = useWriteContract()
  const { ensureMagicSession } = useMagicSession()
  const { isSponsoredMode, sponsoredWriteContract } = useSponsoredTransaction()

  async function writeContractAsync (params: SponsoredWriteContractParams): Promise<Hash> {
    await ensureMagicSession()
    if (isSponsoredMode.value) {
      try {
        return await sponsoredWriteContract(params)
      } catch (error) {
        console.warn('[Sponsored TX] Failed, falling back to direct transaction:', error)
      }
    }
    return wagmiWriteContract(params as Parameters<typeof wagmiWriteContract>[0])
  }

  return { writeContractAsync, isSponsoredMode }
}
