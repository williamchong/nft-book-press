import { LIKE_CO_API, LIKER_LAND_URL } from '~/constant'

export function addParamToUrl (url: string, params: { [key: string]: string }) {
  const urlObject = new URL(url)
  const urlParams = new URLSearchParams(urlObject.search)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      urlParams.set(key, value)
    }
  })
  urlObject.search = urlParams.toString()
  return urlObject.toString()
}

export function downloadBlob (content: string, filename: string, contentType: string) {
  // Create a blob
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)

  // Create a link to download it
  const pom = document.createElement('a')
  pom.href = url
  pom.setAttribute('download', filename)
  pom.click()
}

export function parseImageURLFromMetadata (image: string): string {
  if (!image) { return '' }
  return image.replace('ar://', 'https://arweave.net/').replace('ipfs://', 'https://ipfs.io/ipfs/')
}

export function downloadFile ({ data, fileName, fileType }:{data:any, fileName:string, fileType:string}) {
  let fileData
  let mimeType
  if (fileType === 'json') {
    fileData = JSON.stringify(data, null, 2)
    mimeType = 'application/json'
  } else if (fileType === 'csv') {
    fileData = convertArrayOfObjectsToCSV(data)
    mimeType = 'text/csv'
  } else {
    throw new Error('Unsupported file type')
  }

  const fileBlob = new Blob([fileData], { type: mimeType })
  const fileUrl = URL.createObjectURL(fileBlob)
  const fileLink = document.createElement('a')
  fileLink.href = fileUrl
  fileLink.download = fileName
  fileLink.style.display = 'none'

  document.body.appendChild(fileLink)
  fileLink.click()
  document.body.removeChild(fileLink)
}

export function sleep (time: number) {
  return new Promise((resolve) => { setTimeout(resolve, time) })
}

export function convertArrayOfObjectsToCSV (data: Record<string, any>[]): string {
  if (data.length === 0) {
    return ''
  }

  const headers: string[] = Array.from(
    new Set(data.flatMap(obj => Object.keys(obj)))
  )

  const csv: string[] = []

  csv.push(headers.join(','))

  data.forEach((obj: Record<string, any>) => {
    const row: string = headers.map((header) => {
      // Convert null or undefined to an empty string
      let value = obj[header] == null ? '' : obj[header].toString()

      // Add double quotes if the value contains a comma, newline or double quote
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        // Escape double quotes with another double quote
        value = value.replace(/"/g, '""')
        value = `"${value}"`
      }

      return value
    }).join(',')

    csv.push(row)
  })

  return csv.join('\n')
}

export function getPortfolioURL (wallet: string) {
  return `${LIKER_LAND_URL}/${wallet}`
}

export const deliverMethodOptions = [
  {
    value: 'auto',
    label: 'Automatic deliver NFT'
  },
  {
    value: 'manual',
    label: 'Sign memo and manually deliver each NFT'
  }
]

export const formatShippingAddress = function (shippingDetails: any) {
  if (!shippingDetails?.address) {
    return ''
  }
  const {
    line1 = '',
    line2 = '',
    city = '',
    state = '',
    postal_code: code = '',
    country = ''
  } = shippingDetails.address
  const parts = [
    line1,
    line2,
    city,
    state,
    code,
    country
  ]
  return parts.filter(p => !!p).join(', ')
}

export function getPurchaseLink ({
  classId,
  collectionId,
  priceIndex = 0,
  channel,
  coupon,
  customLink,
  isUseLikerLandLink
}:{
  classId?: string
  collectionId?: string
  priceIndex?: number
  channel?: string
  coupon?: string
  customLink?: string
  isUseLikerLandLink?: boolean
}) {
  const payload: Record<string, string> = {
    from: channel || ''
  }
  if (classId) {
    payload.price_index = priceIndex.toString()
  }
  if (coupon) { payload.coupon = coupon }
  if (customLink) {
    const url = new URL(customLink)
    Object.entries(payload).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    return url.toString()
  }

  const queryString = `?${new URLSearchParams(payload).toString()}`
  if (collectionId) {
    return isUseLikerLandLink
      ? `${LIKER_LAND_URL}/nft/collection/${collectionId}${queryString}`
      : `${LIKE_CO_API}/likernft/book/collection/purchase/${collectionId}/new${queryString}`
  }
  return isUseLikerLandLink
    ? `${LIKER_LAND_URL}/nft/class/${classId}${queryString}`
    : `${LIKE_CO_API}/likernft/book/purchase/${classId}/new${queryString}`
}
