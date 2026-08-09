import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 pt-24">
      <div className="text-center max-w-lg">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-[#E31837] mb-4">
          404 — Page Not Found
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-[#023468] mb-6">
          This page has driven off
        </h1>
        <p className="text-black/60 mb-10">
          The page you are looking for does not exist or may have been moved.
          Explore our latest inventory or head back to the homepage.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-full bg-[#023468] px-8 text-sm font-bold uppercase tracking-widest text-white hover:bg-[#01254a] transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/inventory"
            className="inline-flex h-12 items-center rounded-full border border-black/15 px-8 text-sm font-bold uppercase tracking-widest text-[#023468] hover:bg-zinc-50 transition-colors"
          >
            Browse Inventory
          </Link>
        </div>
      </div>
    </div>
  )
}
