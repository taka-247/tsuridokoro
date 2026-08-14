import { useEffect, useState } from 'react'
import myAxios from '../api/myAxios'

// 都道府県 → 市区町村 の一覧。
// Source: geolonia/japanese-addresses（無料・APIキー不要・全47都道府県）
// https://github.com/geolonia/japanese-addresses
const REGIONS_URL = 'https://geolonia.github.io/japanese-addresses/api/ja.json'

export type RegionMap = Record<string, string[]>

let cache: Promise<RegionMap> | null = null

/** Fetch the prefecture→cities map once and reuse it for the session. */
export function loadRegions(): Promise<RegionMap> {
  if (!cache) {
    cache = myAxios
      .get<RegionMap>(REGIONS_URL)
      .then((res) => res.data)
      .catch((err) => {
        cache = null // allow a retry on next call after a failure
        throw err
      })
  }
  return cache
}

/** Loads the map once. Returns null while loading, {} on failure. */
export function useRegions(): RegionMap | null {
  const [regions, setRegions] = useState<RegionMap | null>(null)

  useEffect(() => {
    let active = true
    loadRegions()
      .then((map) => {
        if (active) setRegions(map)
      })
      .catch(() => {
        if (active) setRegions({}) // fail soft: empty map
      })
    return () => {
      active = false
    }
  }, [])

  return regions
}
