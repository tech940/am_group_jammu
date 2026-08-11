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

console.log("Supabase URL:", url)

const supabase = createClient(url, serviceKey)

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  console.log("Existing buckets:", buckets.map(b => b.name))

  if (!buckets.some(b => b.name === "am_group_files")) {
    console.log("Creating bucket 'am_group_files'...")
    const { data, error } = await supabase.storage.createBucket("am_group_files", { public: true })
    if (error) console.log("Create bucket error:", error.message)
    else console.log("Bucket created successfully!")
  } else {
    console.log("Bucket 'am_group_files' already exists.")
  }

  const publicUrl = supabase.storage.from("am_group_files").getPublicUrl("test.jpg").data.publicUrl
  console.log("Public URL format:", publicUrl)
}

ensureBucket()
