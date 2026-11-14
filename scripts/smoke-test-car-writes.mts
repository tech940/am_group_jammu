/**
 * End-to-end check of the write path, against the real database, using a
 * throwaway DRAFT car that is deleted at the end. A draft is never shown on
 * the public site, so this is safe to run at any time.
 *
 *   node scripts/smoke-test-car-writes.mts
 *
 * It exercises exactly what the admin form does: insert, signed photo upload
 * (sent the way the browser sends it — no API key, only the token in the URL),
 * update, shared-photo check, delete, storage clean-up. It also sends the CORS
 * preflight a browser would send before the upload.
 */
import './lib/load-env.mts'


const {
  insertCar,
  updateCar,
  readCar,
  deleteCar,
  createPhotoUpload,
  photosUsedByOtherCars,
  removePhotosByUrl,
} = await import('../lib/cars/store.ts')

const step = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
  if (!ok) process.exitCode = 1
}

// A 1x1 JPEG.
const JPEG = Uint8Array.from(
  atob(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=',
  ),
  (c) => c.charCodeAt(0),
)

let id: number | null = null
let photoUrl: string | null = null
try {
  const car = await insertCar({ title: 'Smoke Test Car', make: 'Smoke', model: 'Test', status: 'draft', year: 2020, price: 123456 })
  id = car.id
  step('insert draft', car.id >= 100000 && car.status === 'draft' && car.source === 'admin', `id ${car.id}`)

  const target = await createPhotoUpload(`${car.id}/smoke-${car.id}.jpg`)
  step('signed upload URL issued', target.signedUrl.includes('token='))

  const origin = 'https://am-group-jammu-delta.vercel.app'
  const preflight = await fetch(target.signedUrl, {
    method: 'OPTIONS',
    headers: { Origin: origin, 'Access-Control-Request-Method': 'PUT', 'Access-Control-Request-Headers': 'x-upsert' },
  })
  const allowOrigin = preflight.headers.get('access-control-allow-origin')
  const allowHeaders = preflight.headers.get('access-control-allow-headers') ?? ''
  step(
    'browser preflight allowed',
    preflight.ok && (allowOrigin === '*' || allowOrigin === origin) && /x-upsert|\*/i.test(allowHeaders),
    `status ${preflight.status}, origin ${allowOrigin}, headers ${allowHeaders.slice(0, 80)}`,
  )

  // Exactly the request app/admin/vehicles/[id]/photo-manager.tsx sends.
  const form = new FormData()
  form.append('cacheControl', '31536000')
  form.append('', new Blob([JPEG], { type: 'image/jpeg' }))
  const put = await fetch(target.signedUrl, { method: 'PUT', headers: { 'x-upsert': 'false' }, body: form })
  step('upload without an API key accepted', put.ok, `status ${put.status}${put.ok ? '' : ` ${(await put.text()).slice(0, 160)}`}`)

  const seen = await fetch(target.publicUrl)
  step('photo is publicly readable', seen.ok && (seen.headers.get('content-type') ?? '').startsWith('image/'), `status ${seen.status}, ${seen.headers.get('content-type')}`)
  photoUrl = target.publicUrl

  const updated = await updateCar(car.id, { images: [target.publicUrl], price: 234567 })
  step('update', updated.price === 234567 && updated.images.length === 1 && updated.updated_at !== car.updated_at)

  const shared = await photosUsedByOtherCars([target.publicUrl], car.id)
  step('shared-photo check', shared.size === 0)

  const wrongType = await createPhotoUpload(`${car.id}/smoke-${car.id}.txt`)
  const bad = new FormData()
  bad.append('', new Blob(['not an image'], { type: 'text/plain' }))
  const refused = await fetch(wrongType.signedUrl, { method: 'PUT', headers: { 'x-upsert': 'false' }, body: bad })
  step('bucket refuses a non-image', !refused.ok, `status ${refused.status}`)
} catch (err) {
  step('unexpected error', false, err instanceof Error ? err.message : String(err))
} finally {
  if (id !== null) {
    await deleteCar(id)
    step('delete', (await readCar(id)) === null)
  }
  if (photoUrl) {
    await removePhotosByUrl([photoUrl])
    // The public URL is served through a CDN, so ask storage itself.
    const gone = await fetch(`${photoUrl}?t=${Date.now()}`)
    step('photo removed from storage', !gone.ok, `status ${gone.status}`)
  }
}
