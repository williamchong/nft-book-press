import { http, createStorage, cookieStorage, createConfig } from '@wagmi/vue'
import { optimism, optimismSepolia } from '@wagmi/vue/chains'
import { injected } from '@wagmi/connectors'
import { dedicatedWalletConnector } from '@magiclabs/wagmi-connector'

export const config = createConfig({
  chains: [optimism, optimismSepolia],
  connectors: [
    dedicatedWalletConnector({
      chains: [optimism, optimismSepolia],
      options: {
        apiKey: 'pk_live_5E14E3184484268D',
        /* If using OAuth, make sure to enable OAuth options from magic dashboard */
        oauthOptions: {
          providers: ['google'],
          callbackUrl: 'http://localhost:3000'
        }
      }
    }),
    injected()
  ],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
  transports: {
    [optimism.id]: http(),
    [optimismSepolia.id]: http()
  }
})

declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}
