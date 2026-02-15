import { supabase, DICOM_BUCKET, MANIFEST_PREFIX } from "./supabase"

export async function uploadDicomFile(studyId, filename, file) {
  const path = `${studyId}/${filename}`
  const { data, error } = await supabase.storage.from(DICOM_BUCKET).upload(path, file, { upsert: true, contentType: "application/dicom" })
  if (error) throw error
  const { data: pub } = supabase.storage.from(DICOM_BUCKET).getPublicUrl(path)
  return { path, url: pub.publicUrl }
}

export async function saveManifest(manifest) {
  const body = new Blob([JSON.stringify(manifest)], { type: "application/json" })
  const path = `${MANIFEST_PREFIX}/${manifest.studyId}.json`
  const { error } = await supabase.storage.from(DICOM_BUCKET).upload(path, body, { upsert: true, contentType: "application/json" })
  if (error) throw error
  const { data } = supabase.storage.from(DICOM_BUCKET).getPublicUrl(path)
  return { path, url: data.publicUrl }
}

export async function fetchManifest(studyId) {
  const { data } = supabase.storage.from(DICOM_BUCKET).getPublicUrl(`${MANIFEST_PREFIX}/${studyId}.json`)
  const res = await fetch(data.publicUrl)
  if (!res.ok) throw new Error("manifest not found")
  return res.json()
}
