import { IS_TESTNET } from '.'

const mainConfig = {
  chainId: 'likecoin-mainnet-2',
  chainName: 'LikeCoin',
  chainSymbolImageUrl:
    'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/likecoin-mainnet/chain.png',
  rpc: 'https://mainnet-node-rpc.like.co',
  rest: 'https://mainnet-node.like.co',
  nodeProvider: {
    name: 'like.co',
    email: 'team@like.co',
    website: 'https://like.co/'
  },
  bip44: {
    coinType: 118
  },
  bech32Config: {
    bech32PrefixAccAddr: 'like',
    bech32PrefixAccPub: 'likepub',
    bech32PrefixValAddr: 'likevaloper',
    bech32PrefixValPub: 'likevaloperpub',
    bech32PrefixConsAddr: 'likevalcons',
    bech32PrefixConsPub: 'likevalconspub'
  },
  currencies: [
    {
      coinDenom: 'LIKE',
      coinMinimalDenom: 'nanolike',
      coinDecimals: 9,
      coinGeckoId: 'likecoin'
    }
  ],
  feeCurrencies: [
    {
      coinDenom: 'LIKE',
      coinMinimalDenom: 'nanolike',
      coinDecimals: 9,
      coinGeckoId: 'likecoin',
      gasPriceStep: {
        low: 1,
        average: 10,
        high: 1000
      }
    }
  ],
  stakeCurrency: {
    coinDenom: 'LIKE',
    coinMinimalDenom: 'nanolike',
    coinDecimals: 9,
    coinGeckoId: 'likecoin'
  },
  features: []
}

const testnetConfig = {
  chainId: 'likecoin-public-testnet-5',
  chainName: 'LikeCoin public test chain',
  rest: 'https://node.testnet.like.co',
  rpc: 'https://node.testnet.like.co/rpc/',
  currencies: [
    {
      coinDenom: 'EKIL',
      coinMinimalDenom: 'nanoekil',
      coinDecimals: 9,
      coinGeckoId: undefined
    }
  ],
  feeCurrencies: [
    {
      coinDenom: 'EKIL',
      coinMinimalDenom: 'nanoekil',
      coinDecimals: 9,
      coinGeckoId: undefined,
      gasPriceStep: {
        low: 1,
        average: 10,
        high: 1000
      }
    }
  ],
  stakeCurrency: {
    coinDenom: 'EKIL',
    coinMinimalDenom: 'nanoekil',
    coinDecimals: 9,
    coinGeckoId: undefined
  }
}

const combinedConfig = {
  ...mainConfig,
  ...(IS_TESTNET ? testnetConfig : {})
}

export default combinedConfig
