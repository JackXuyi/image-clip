/**
 * 立即阻止事件
 * @param e 事件对象
 */
export function stopImmediatePropagation(e: any) {
  if (e.nativeEvent) {
    e.nativeEvent.stopImmediatePropagation()
  } else {
    e.stopImmediatePropagation()
  }
  e.preventDefault()
  e.stopPropagation()
}
