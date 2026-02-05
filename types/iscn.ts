export interface ISCNContentMetadata {
  name?: string
  description?: string
  descriptionFull?: string
  alternativeHeadline?: string
  thumbnailUrl?: string
  url?: string
  [key: string]: unknown
}

export interface ISCNData {
  contentMetadata: ISCNContentMetadata
  owner: string
  '@id': string
}
