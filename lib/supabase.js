import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

export const DICOM_BUCKET = process.env.NEXT_PUBLIC_DICOM_BUCKET || "dicom"
export const MANIFEST_PREFIX = "manifests"
