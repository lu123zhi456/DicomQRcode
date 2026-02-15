"use client"
import { useState, useRef } from "react"
import JSZip from "jszip"
import QRCode from "qrcode"
import { uploadDicomFile, saveManifest } from "../lib/storage"

export default function UploadPage() {
  const [zipName, setZipName] = useState("")
  const [uploading, setUploading] = useState(false)
  const [studyId, setStudyId] = useState("")
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [link, setLink] = useState("")
  const canvasRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setZipName(file.name.replace(/\.zip$/i, ""))
    setUploading(true)
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    const zip = await JSZip.loadAsync(file)
    const entries = []
    const tasks = []
    zip.forEach((relativePath, entry) => {
      if (entry.dir) return
      const isDicom = /\.dcm$/i.test(relativePath) || !/\.(jpg|png|jpeg|gif|bmp|txt|json|csv|pdf|xml)$/i.test(relativePath)
      if (!isDicom) return
      tasks.push(entry.async("uint8array").then(async content => {
        const blob = new Blob([content], { type: "application/dicom" })
        const filename = relativePath.split("/").pop()
        const uploaded = await uploadDicomFile(id, filename, blob)
        entries.push(uploaded)
      }))
    })
    await Promise.all(tasks)
    const manifest = { studyId: id, name: zipName || file.name, files: entries.sort((a, b) => a.path.localeCompare(b.path)) }
    await saveManifest(manifest)
    const url = `${location.origin}/view/${id}`
    setLink(url)
    setStudyId(id)
    const dataUrl = await QRCode.toDataURL(url, { width: 512 })
    setQrDataUrl(dataUrl)
    const ctx = canvasRef.current?.getContext?.("2d")
    if (ctx) {
      const img = new Image()
      img.onload = () => {
        canvasRef.current.width = img.width
        canvasRef.current.height = img.height
        ctx.drawImage(img, 0, 0)
      }
      img.src = dataUrl
    }
    setUploading(false)
  }

  function downloadQr() {
    const a = document.createElement("a")
    a.href = qrDataUrl
    a.download = `${zipName || studyId}.png`
    a.click()
  }

  return (
    <div className="container">
      <div className="card">
        <h2>上传DICOM压缩包</h2>
        <div className="row">
          <input className="input" type="file" accept=".zip" onChange={handleFile} />
          <button className="button" disabled={uploading} onClick={() => document.querySelector('input[type="file"]').click()}>
            {uploading ? "上传中..." : "选择文件"}
          </button>
        </div>
      </div>
      {link && (
        <div className="grid" style={{ marginTop: 16 }}>
          <div className="card">
            <h3>访问链接</h3>
            <p><a href={link} target="_blank" rel="noreferrer">{link}</a></p>
            <div className="row">
              <button className="button" onClick={() => navigator.clipboard.writeText(link)}>复制链接</button>
              <button className="button secondary" onClick={downloadQr}>下载二维码</button>
            </div>
          </div>
          <div className="card">
            <h3>二维码</h3>
            <div className="qr">
              {qrDataUrl ? <img src={qrDataUrl} alt="QR" style={{ width: "100%" }} /> : null}
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
