import { defineStore } from 'pinia'
import { useAccount, useConnect, useDisconnect, useSignMessage } from '@wagmi/vue'
import { optimism, optimismSepolia } from '@wagmi/vue/chains'

export const useWalletStore = defineStore('wallet', () => {
  const { connectors, connectAsync: wagmiConnect } = useConnect()
  const { disconnectAsync: wagmiDisconnect } = useDisconnect()
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const wallet = computed(() => address.value)

  async function initIfNecessary () {
    if (!isConnected.value) {
      await connect()
    }
  }

  async function connect () {
    const { IS_TESTNET } = useRuntimeConfig().public
    const chainId = IS_TESTNET ? optimismSepolia.id : optimism.id
    const connector = connectors[0]
    await wagmiConnect({ connector, chainId })
  }

  async function signMessageMemo (action: string, permissions?: string[]) {
    if (!wallet.value) {
      await connect()
    }
    if (!wallet.value) {
      throw new Error('WALLET_NOT_INITED')
    }
    const ts = Date.now()
    const payload = JSON.stringify({
      action,
      permissions,
      evmWallet: wallet.value,
      ts
    })
    const signed = await signMessageAsync({ message: payload })
    return {
      signature: signed,
      message: payload,
      wallet: wallet.value,
      signMethod: 'personal_sign',
      expiresIn: '7d'
    }
  }

  function disconnect () {
    return wagmiDisconnect()
  }

  return {
    wallet,
    signer: ref({}),
    isConnected,
    initIfNecessary,
    connect,
    disconnect,
    signMessageMemo
  }
})
