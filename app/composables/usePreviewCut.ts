import type { EpubSpineItem } from '~/types'
import type { PreviewPlan } from '~/utils/preview-cut'
import { planEpubPreviewCut } from '~/utils/preview-cut'

export type PreviewCutResult
  = | Extract<PreviewPlan, { ok: false }>
    | { ok: true, includedItems: EpubSpineItem[], effectivePercentage: number }

// Never re-derive the cut rules here: they must stay in ~/utils/preview-cut, or
// the readout drifts from what the ebook-cors server actually ships.
export function computePreviewCut(
  spineTable: EpubSpineItem[],
  percentage: number,
): PreviewCutResult {
  const plan = planEpubPreviewCut(spineTable.map(item => item.sizeBytes), percentage)
  if (!plan.ok) { return plan }
  return {
    ok: true,
    includedItems: spineTable.slice(0, plan.includedCount),
    effectivePercentage: plan.effectivePercentage,
  }
}
