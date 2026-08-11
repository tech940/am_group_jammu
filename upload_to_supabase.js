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

const mediaMappings = [
  { file: "showroom-hyundai.webp", path: "branches/jammu-hyundai/exterior.webp" },
  { file: "banner-hyundai.jpg", path: "branches/jammu-hyundai/banner.jpg" },
  { file: "showroom-kia.jpg", path: "branches/jammu-kia/exterior.jpg" },
  { file: "banner-kia.jpg", path: "branches/jammu-kia/banner.jpg" },
  { file: "showroom-tata.jpg", path: "branches/srinagar-hyundai/exterior.jpg" },
  { file: "banner-tata.jpg", path: "branches/srinagar-hyundai/banner.jpg" },
  { file: "facility-1.webp", path: "branches/central-workshop/workshop-1.webp" },
  { file: "facility-2.webp", path: "branches/central-workshop/workshop-2.webp" },
  { file: "facility-3.webp", path: "branches/central-workshop/workshop-3.webp" },
  { file: "petroleum-hp.webp", path: "branches/petroleum/station-1.webp" },
  { file: "petroleum-iocl.webp", path: "branches/petroleum/station-2.webp" },
  { file: "petroleum-hp-iocl.jpg", path: "branches/petroleum/station-3.jpg" },
  { file: "retail-smegamart.jpg", path: "branches/smegamart/storefront.jpg" },
  { file: "realestate-1.jpg", path: "branches/real-estate/complex-1.jpg" },
  { file: "realestate-2.jpg", path: "branches/real-estate/complex-2.jpg" },
  { file: "realestate-3.jpg", path: "branches/real-estate/complex-3.jpg" },
  { file: "awards.png", path: "corporate/awards/trophies.png" },
  { file: "showroom-mg.jpg", path: "branches/luxury-showrooms/mg-showroom.jpg" },
  { file: "banner-mg.jpg", path: "branches/luxury-showrooms/mg-banner.jpg" },
  { file: "showroom-honda.jpg", path: "branches/two-wheelers/honda.jpg" },
  { file: "showroom-bajaj.jpg", path: "branches/two-wheelers/bajaj.jpg" },
  { file: "showroom-ktm.jpg", path: "branches/two-wheelers/ktm.jpg" },
]

async function uploadMedia() {
  console.log("Uploading media files to Supabase bucket 'am_group_files'...")
  const uploadedUrls = {}

  for (const m of mediaMappings) {
    const localPath = path.join(__dirname, "public", "media", m.file)
    if (!fs.existsSync(localPath)) {
      console.log(`Skip: ${m.file} not found locally`)
      continue
    }

    const fileBuffer = fs.readFileSync(localPath)
    const ext = path.extname(m.file).toLowerCase()
    let contentType = "image/jpeg"
    if (ext === ".webp") contentType = "image/webp"
    else if (ext === ".png") contentType = "image/png"

    const { data, error } = await supabase.storage
      .from("am_group_files")
      .upload(m.path, fileBuffer, { contentType, upsert: true })

    if (error) {
      console.log(`Failed to upload ${m.path}: ${error.message}`)
    } else {
      const publicUrl = supabase.storage.from("am_group_files").getPublicUrl(m.path).data.publicUrl
      console.log(`Uploaded ${m.path} -> ${publicUrl}`)
      uploadedUrls[m.path] = publicUrl
    }
  }

  fs.writeFileSync(path.join(__dirname, "uploaded_media.json"), JSON.stringify(uploadedUrls, null, 2))
  console.log("\nDone uploading all media to Supabase!")
}

uploadMedia()
