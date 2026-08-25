/** True when the given element is a text-input surface — global keyboard
 * shortcuts (question navigation, rating-scale number keys) must not fire
 * while the respondent is typing into an open-response field. */
export function isEditingText(el: Element | null): boolean {
  if (!el) return false
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return true
  return el instanceof HTMLElement && el.isContentEditable
}
