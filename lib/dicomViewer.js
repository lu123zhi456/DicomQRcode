let cs
let wado
let initialized = false

async function init() {
  if (initialized && cs) return cs
  const csm = await import("cornerstone-core")
  const wadom = await import("cornerstone-wado-image-loader")
  const dpm = await import("dicom-parser")
  cs = csm.default || csm
  wado = wadom.default || wadom
  const dp = dpm.default || dpm
  wado.external.cornerstone = cs
  wado.external.dicomParser = dp
  wado.configure({ useWebWorkers: false })
  initialized = true
  return cs
}

export async function enable(element) {
  const c = await init()
  c.enable(element)
}

export async function loadAndDisplay(element, imageIds, viewport) {
  const c = await init()
  const firstId = imageIds[0]
  const image = await c.loadAndCacheImage(firstId)
  c.displayImage(element, image)
  if (viewport) c.setViewport(element, viewport)
  element.dataset.stack = JSON.stringify(imageIds)
}

export async function stackScroll(element, index) {
  const c = await init()
  const imageIds = JSON.parse(element.dataset.stack || "[]")
  if (!imageIds.length) return
  const i = Math.max(0, Math.min(imageIds.length - 1, index))
  c.loadAndCacheImage(imageIds[i]).then(img => c.displayImage(element, img))
}

export async function setWindowLevel(element, ww, wc) {
  const c = await init()
  const vp = c.getViewport(element)
  vp.voi.windowWidth = ww
  vp.voi.windowCenter = wc
  c.setViewport(element, vp)
}

export async function setZoom(element, scale) {
  const c = await init()
  const vp = c.getViewport(element)
  vp.scale = scale
  c.setViewport(element, vp)
}
