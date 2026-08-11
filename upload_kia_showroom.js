const { createClient } = require("@supabase/supabase-js")
const path = require("path")
const fs = require("fs")

let envContent = ""
try { envContent = fs.readFileSync(path.join(__dirname, ".env.local"), "utf8") } catch (e) {}
try { envContent += "\n" + fs.readFileSync(path.join(__dirname, ".env"), "utf8") } catch (e) {}

const env = {}
envContent.split("\n").forEach(line => {
  const parts = line.split("=")
  if (parts.length >= 2) {
    const key = parts[0].trim()
    const val = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "")
    env[key] = val
  }
})

const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(url, serviceKey)

async function uploadKiaShowroom() {
  const localImage = "C:\\Users\\sahil\\.gemini\\antigravity\\brain\\2e89f17f-f908-48c8-99e1-34ec89902c1f\\am_kia_showroom_jammu_1786431451707.jpg"
  const buffer = fs.readFileSync(localImage)

  const remotePath = "branches/jammu-kia/hero-showroom.jpg"

  console.log(`Uploading ${localImage} to Supabase bucket 'am_group_files' at ${remotePath}...`)
  const { data, error } = await supabase.storage
    .from("am_group_files")
    .upload(remotePath, buffer, { contentType: "image/jpeg", upsert: true })

  if (error) {
    console.log("Upload error:", error.message)
  } else {
    const publicUrl = supabase.storage.from("am_group_files").getPublicUrl(remotePath).data.publicUrl
    console.log("Uploaded successfully! Public Supabase Storage URL:")
    console.log(publicUrl)
  }
}

uploadKiaShowroom()
