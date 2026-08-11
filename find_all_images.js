const fs = require("fs")
const path = require("path")

function findImages(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const filePath = path.join(dir, file)
      try {
        const stat = fs.statSync(filePath)
        if (stat.isDirectory()) {
          if (!file.startsWith(".") && file !== "node_modules" && file !== ".next") {
            findImages(filePath, fileList)
          }
        } else {
          const ext = path.extname(file).toLowerCase()
          if ([".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"].includes(ext)) {
            fileList.push({ name: file, path: filePath, size: stat.size })
          }
        }
      } catch (e) {}
    }
  } catch (e) {}
  return fileList
}

console.log("--- PROJECT IMAGES ---")
const projectImages = findImages("c:\\Users\\sahil\\Downloads\\am_group_jammu")
projectImages.forEach(img => console.log(`${img.name} (${img.path})`))

console.log("\n--- ARTIFACT & USER UPLOADED IMAGES ---")
const artifactDir = "C:\\Users\\sahil\\.gemini\\antigravity\\brain\\2e89f17f-f908-48c8-99e1-34ec89902c1f"
const artifactImages = findImages(artifactDir)
artifactImages.forEach(img => console.log(`${img.name} (${img.path})`))
