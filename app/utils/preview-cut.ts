// Pure preview-cut rules, kept dependency-free and copied verbatim from the
// ebook-cors server (likecoin-cloud-functions preview/plan.js) so this UI can
// show authors the cut the server will actually ship. Both copies run against
// test/fixtures/preview-cut.golden.json; a rule only changes on the server, and
// the fixture must be re-copied here with it, or the two drift.

export const PREVIEW_PERCENTAGE_MIN = 1
export const PREVIEW_PERCENTAGE_MAX = 50
export const PREVIEW_PERCENTAGE_DEFAULT = 10
// How far past the requested percentage a straddling chapter may push the cut.
export const PREVIEW_OVERSHOOT_FACTOR = 2

export type PreviewUnavailableReason
  = | 'INVALID_PERCENTAGE'
    | 'NOT_ENOUGH_SPINE'
    | 'EMPTY_SPINE'
    | 'FIRST_ITEM_TOO_LARGE'
    | 'NOT_ENOUGH_PAGES'

export type PreviewPlan
  = | { ok: false, reason: PreviewUnavailableReason }
    | { ok: true, includedCount: number, effectivePercentage: number }

export function clampPreviewPercentage(value: unknown): number {
  const percentage = Number(value)
  if (!Number.isFinite(percentage) || percentage <= 0) { return PREVIEW_PERCENTAGE_DEFAULT }
  return Math.min(
    PREVIEW_PERCENTAGE_MAX,
    Math.max(PREVIEW_PERCENTAGE_MIN, Math.round(percentage)),
  )
}

const unavailable = (reason: PreviewUnavailableReason): PreviewPlan => ({ ok: false, reason })

// `sizes` is the uncompressed byte size of each spine document, in reading
// order. `percentage` must already be clamped — the ceiling below assumes it.
export function planEpubPreviewCut(sizes: number[], percentage: number): PreviewPlan {
  if (!Number.isFinite(percentage) || percentage <= 0) { return unavailable('INVALID_PERCENTAGE') }
  if (sizes.length < 2) { return unavailable('NOT_ENOUGH_SPINE') }
  const totalBytes = sizes.reduce((sum, size) => sum + size, 0)
  if (!totalBytes) { return unavailable('EMPTY_SPINE') }

  const threshold = (percentage / 100) * totalBytes
  // Generous by design: an item that starts before the mark is included whole,
  // so a preview never stops mid-chapter.
  let includedCount = 0
  let includedBytes = 0
  for (let i = 0; i < sizes.length; i += 1) {
    if (includedBytes >= threshold) { break }
    includedCount = i + 1
    includedBytes += sizes[i]!
  }
  // A preview must always cut something, even when the generous cut would
  // otherwise cover the whole book.
  includedCount = Math.min(includedCount, sizes.length - 1)

  const percentageOf = (count: number) => (sizes
    .slice(0, count)
    .reduce((sum, size) => sum + size, 0) / totalBytes) * 100

  // Guard the extreme case: a huge chapter straddling the mark would otherwise
  // hand over most of the book (a 10% cut of [1%, 98%, 1%] serves 99%). Dropping
  // it is always safe — every item before it starts below the mark, so the
  // shorter cut is under the requested percentage by construction. The first
  // item is exempt: it is the smallest cut the spine allows, so a 1% ask on a
  // book of 5% chapters should still get chapter one.
  const ceiling = Math.min(PREVIEW_PERCENTAGE_MAX, percentage * PREVIEW_OVERSHOOT_FACTOR)
  if (includedCount > 1 && percentageOf(includedCount) > ceiling) { includedCount -= 1 }

  // No cut of a book whose first item is most of it can withhold half the book.
  const effectivePercentage = percentageOf(includedCount)
  if (effectivePercentage > PREVIEW_PERCENTAGE_MAX) { return unavailable('FIRST_ITEM_TOO_LARGE') }

  return { ok: true, includedCount, effectivePercentage }
}

// PDF pages are uniform enough that rounding up to a whole page overshoots by
// at most one page, so the EPUB ceiling has nothing to protect against here.
export function planPdfPreviewCut(pageCount: number, percentage: number): PreviewPlan {
  if (!Number.isFinite(percentage) || percentage <= 0) { return unavailable('INVALID_PERCENTAGE') }
  if (!Number.isFinite(pageCount) || pageCount <= 1) { return unavailable('NOT_ENOUGH_PAGES') }
  const includedCount = Math.min(
    Math.max(Math.ceil((percentage / 100) * pageCount), 1),
    pageCount - 1,
  )
  return {
    ok: true,
    includedCount,
    effectivePercentage: (includedCount / pageCount) * 100,
  }
}
