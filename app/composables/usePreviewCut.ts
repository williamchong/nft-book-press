import type { EpubSpineItem } from '~/types'
import { PREVIEW_PERCENTAGE_MIN, PREVIEW_PERCENTAGE_MAX } from '~/constant'

export interface PreviewCutResult {
  includedItems: EpubSpineItem[]
  effectivePercent: number
}

export function clampPreviewPercentage(value: number): number {
  if (!Number.isFinite(value)) { return PREVIEW_PERCENTAGE_MIN }
  return Math.min(PREVIEW_PERCENTAGE_MAX, Math.max(PREVIEW_PERCENTAGE_MIN, Math.round(value)))
}

// Free-preview cut over an EPUB spine; the server applies the same formula.
// Spine item i is included iff its start offset (sum of preceding sizes) is
// below (percent/100) x total, so the chapter straddling the mark stays whole.
export function computePreviewCut(
  spineTable: EpubSpineItem[],
  percent: number,
): PreviewCutResult {
  const total = spineTable.reduce((sum, item) => sum + item.sizeBytes, 0)
  if (!total || percent <= 0) {
    return { includedItems: [], effectivePercent: 0 }
  }
  const threshold = (percent / 100) * total
  const includedItems: EpubSpineItem[] = []
  let startOffset = 0
  let includedSize = 0
  for (const item of spineTable) {
    if (startOffset < threshold) {
      includedItems.push(item)
      includedSize += item.sizeBytes
    }
    startOffset += item.sizeBytes
  }
  return {
    includedItems,
    effectivePercent: (includedSize / total) * 100,
  }
}
