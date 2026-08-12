/**
 * Same-origin proxy for Supabase Storage objects.
 *
 * WHY THIS EXISTS
 * next/image fetches upstream images from the Next server, and Next refuses any
 * host whose DNS resolution includes a private or reserved address. On a network
 * running DNS64/NAT64 — IPv6-only, and some mobile and corporate networks —
 * every external hostname ALSO resolves to a synthesised `64:ff9b::/96`
 * address. Next inspects every address DNS returns, not just the one it would
 * connect to, so the request dies with:
 *
 *   ⨯ upstream image … resolved to private ip ["64:ff9b::…"]
 *
 * Things that do not fix it, tested:
 *   - `--dns-result-order=ipv4first` — reorders, but the synthesised addresses
 *     are still in the list, and Next checks all of them.
 *   - Supabase's own transform CDN (`/render/image/...`) — returns
 *     `FeatureNotEnabled` on this tenant; it is a paid add-on.
 *
 * Serving the object from our own origin means the check never runs, and
 * next/image still resizes and re-encodes it normally. That last part is the
 * point: originals here reach 4229x2506 and ~5.8MB, and a browser must never be
 * sent one.
 *
 * WHY PATH SEGMENTS AND NOT ?src=
 * Next's default `images.localPatterns` only permits local images whose search
 * string is empty, so `/api/media?src=…` is rejected by the optimiser. Encoding
 * the object path as route segments keeps the URL query-free and needs no
 * loosening of that setting — the docs specifically warn that omitting `search`
 * lets an attacker optimise URLs you did not intend.
 *
 * SECURITY
 * A proxy that forwards whatever it is handed is an open SSRF hole. This one is
 * bounded: the project must be one of two known Supabase tenants, the upstream
 * path is always rebuilt as a PUBLIC storage object (never taken verbatim), no
 * headers or credentials are forwarded, and only image content types return.
 */

const PROJECTS: Record<string, string> = {
  // Media library — the client's photography.
  m: "ehcmjypfxucvcvuofozx.supabase.co",
  // Lead-data project, which also holds the legacy branch photography.
  l: "nhceknbaslqdqofefyla.supabase.co",
}

const BUCKET = "am_group_files"

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
])

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ project: string; path: string[] }> },
) {
  const { project, path } = await params

  const host = PROJECTS[project]
  if (!host) return new Response("Unknown project", { status: 404 })

  // Rebuild the object path from segments rather than trusting a supplied URL.
  // Reject traversal and empty segments outright.
  if (!path?.length || path.some((s) => !s || s === "." || s === ".." || s.includes("\\"))) {
    return new Response("Invalid path", { status: 400 })
  }

  const objectPath = path.map(encodeURIComponent).join("/")
  const upstreamUrl = `https://${host}/storage/v1/object/public/${BUCKET}/${objectPath}`

  let upstream: Response
  try {
    // No headers forwarded — this is an anonymous read of a public object.
    //
    // Deliberately NOT `force-cache`: Next's data cache refuses entries over
    // 2MB, and these originals are up to ~6MB, so it only produced a "Failed to
    // set fetch cache" warning per request and cached nothing. What actually
    // matters is downstream — next/image caches each optimised variant for
    // `minimumCacheTTL` (30 days), so this handler is hit once per source, not
    // once per view.
    upstream = await fetch(upstreamUrl)
  } catch {
    return new Response("Upstream unreachable", { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: upstream.status === 404 ? 404 : 502 })
  }

  const type = upstream.headers.get("content-type")?.split(";")[0]?.trim() ?? ""
  if (!ALLOWED_TYPES.has(type)) {
    return new Response("Unsupported media type", { status: 415 })
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
