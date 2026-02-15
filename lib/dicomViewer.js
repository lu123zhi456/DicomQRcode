import cornerstone from "cornerstone-core"
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader"
import dicomParser from "dicom-parser"

cornerstoneWADOImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.dicomParser = dicomParser
cornerstoneWADOImageLoader.configure({ useWebWorkers: false })

export function enable(element) {
  cornerstone.enable(element)
}

export async function loadAndDisplay(element, imageIds, viewport) {
  const firstId = imageIds[0]
  const image = await cornerstone.loadAndCacheImage(firstId)
  cornerstone.displayImage(element, image)
  if (viewport) cornerstone.setViewport(element, viewport)
  element.dataset.stack = JSON.stringify(imageIds)
}

export function stackScroll(element, index) {
  const imageIds = JSON.parse(element.dataset.stack || "[]")
  if (!imageIds.length) return
  const i = Math.max(0, Math.min(imageIds.length - 1, index))
  cornerstone.loadAndCacheImage(imageIds[i]).then(img => cornerstone.displayImage(element, img))
}

export function setWindowLevel(element, ww, wc) {
  const vp = cornerstone.getViewport(element)
  vp.voi.windowWidth = ww
  vp.voi.windowCenter = wc
  cornerstone.setViewport(element, vp)
}

export function setZoom(element, scale) {
  const vp = cornerstone.getViewport(element)
  vp.scale = scale
  cornerstone.setViewport(element, vp)
}
