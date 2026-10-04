import { MapPinIcon } from '@heroicons/react/24/solid'

type Loc = { lat: number | null; lng: number | null; query: string }

/**
 * Google Map 埋め込み。APIキー不要の keyless iframe（`output=embed`）を使用。
 * 緯度経度があればそれを、無ければ地名クエリを使う（§9.3）。
 * ※将来、公式 Maps Embed API に切り替える場合は VITE_GOOGLE_MAPS_EMBED_KEY を導入する。
 */
export default function MapEmbed({ location, name }: { location: Loc; name: string }) {
  const q =
    location.lat != null && location.lng != null
      ? `${location.lat},${location.lng}`
      : location.query || name
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=14&output=embed`

  return (
    <div className="relative h-[100px] sm:h-full sm:min-h-[220px] overflow-hidden rounded-2xl border border-line">
      <iframe
        title={`${name}の地図`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0"
      />
      <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-bold text-fg shadow-card">
        <MapPinIcon className="h-3.5 w-3.5 text-aqua" aria-hidden />
        Google Map
      </span>
    </div>
  )
}
