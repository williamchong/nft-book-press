// from https://github.com/labscommunity/arweavekit/blob/main/src/lib/encryption.ts

function getWebCrypto () {
  let webCrypto: Crypto
  if (typeof window !== 'undefined' && window.crypto) {
    webCrypto = window.crypto
  } else {
    throw new Error('Crypto API is not available.')
  }
  return webCrypto
}

function concatenateArrayBuffers (buffer1: ArrayBuffer, buffer2: ArrayBuffer) {
  const combinedBuffer = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
  combinedBuffer.set(new Uint8Array(buffer1), 0)
  combinedBuffer.set(new Uint8Array(buffer2), buffer1.byteLength)

  return combinedBuffer.buffer
}

function bufferToBase64 (buf: ArrayBuffer) {
  return Buffer.from(buf).toString('base64')
}

export async function encryptDataWithAES (
  params: { data: ArrayBuffer; }
) {
  const webCrypto = getWebCrypto()

  const encryptedDataAESKey = await webCrypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  )

  const iv = webCrypto.getRandomValues(new Uint8Array(12))

  const encryptedData = await webCrypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    encryptedDataAESKey,
    params.data
  )

  const combinedArrayBuffer = concatenateArrayBuffers(iv.buffer, encryptedData)

  const rawEncryptedKey = await webCrypto.subtle.exportKey(
    'raw',
    encryptedDataAESKey
  )

  const rawEncryptedKeyAsBase64 = bufferToBase64(rawEncryptedKey)

  return { rawEncryptedKeyAsBase64, combinedArrayBuffer }
}
