"use client"
import { useEffect, useRef, useState } from "react"
import { fetchManifest } from "../../../lib/storage"
import { enable, loadAndDisplay, stackScroll, setWindowLevel, setZoom } from "../../../lib/dicomViewer"

export default function Viewer({ params }) {
  const { studyId } = params
  const elRef = useRef(null)
  const [files, setFiles] = useState([])
  const [index, setIndex] = useState(0)
  const [ww, setWw] = useState(350)
  const [wc, setWc] = useState(50)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    let mounted = true
    fetchManifest(studyId).then(man => {
      if (!mounted) return
      const imageIds = man.files.map(f => `wadouri:${f.url}`)
      setFiles(imageIds)
      if (elRef.current) {
        enable(elRef.current)
        loadAndDisplay(elRef.current, imageIds, { voi: { windowWidth: ww, windowCenter: wc }, scale })
      }
    })
    return () => { mounted = false }
  }, [studyId])

  function onScroll(e) {
    const i = Number(e.target.value)
    setIndex(i)
    stackScroll(elRef.current, i)
  }

  function onWw(e) {
    const v = Number(e.target.value)
    setWw(v)
    setWindowLevel(elRef.current, v, wc)
  }
  function onWc(e) {
    const v = Number(e.target.value)
    setWc(v)
    setWindowLevel(elRef.current, ww, v)
  }
  function onScale(e) {
    const v = Number(e.target.value)
    setScale(v)
    setZoom(elRef.current, v)
  }

  return (
    <div className="container">
      <div className="card">
        <h2>影像查看</h2>
        <p>序列总数：{files.length}</p>
      </div>
      <div className="viewer" ref={elRef} />
      {files.length > 0 && (
        <div className="card">
          <div className="toolbar">
            <label>图像索引</label>
            <input className="slider" type="range" min="0" max={files.length - 1} value={index} onChange={onScroll} />
          </div>
          <div className="toolbar">
            <label>WW</label>
            <input className="slider" type="range" min="1" max="2000" value={ww} onChange={onWw} />
          </div>
          <div className="toolbar">
            <label>WC</label>
            <input className="slider" type="range" min="-1000" max="1000" value={wc} onChange={onWc} />
          </div>
          <div className="toolbar">
            <label>缩放</label>
            <input className="slider" type="range" min="0.2" max="3" step="0.1" value={scale} onChange={onScale} />
          </div>
        </div>
      )}
    </div>
  )
}
