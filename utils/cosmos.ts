export function shortenWalletAddress (address: string) {
  if (!address) { return '-' }
  return `${address.slice(0, 10)}...${address.slice(-6)}`
}
