'use client'

import { useEffect, useState } from 'react'
import { CircularGallery } from './circular-gallery'
import type { GalleryItem } from './circular-gallery'
import { getSupabaseBrowserClient } from '@/lib/supabase/browserClient'

const HOME_MEMORIES_KEY = 'home.memories'

const CircularGalleryDemo = () => {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [fit, setFit] = useState<'cover' | 'contain'>('cover')

  useEffect(() => {
    let cancelled = false

    const applySetting = (raw: unknown, versionFromRow: unknown) => {
      const versionFromValue = typeof raw === 'object' && raw ? (raw as { version?: unknown }).version : undefined
      const version =
        typeof versionFromValue === 'string' || typeof versionFromValue === 'number'
          ? String(versionFromValue)
          : typeof versionFromRow === 'string' || typeof versionFromRow === 'number'
            ? String(versionFromRow)
            : String(Date.now())

      const nextFit =
        typeof raw === 'object' && raw && (raw as { fit?: unknown }).fit === 'contain' ? 'contain' : 'cover'

      const candidate = Array.isArray(raw)
        ? raw
        : typeof raw === 'object' && raw && Array.isArray((raw as { items?: unknown }).items)
          ? ((raw as { items: unknown[] }).items as unknown[])
          : []

      const normalizeUrl = (url: string) => {
        const trimmed = url.trim()
        if (trimmed.length === 0) return ''
        const base = trimmed.split('?')[0]
        return `${base}?v=${encodeURIComponent(version)}`
      }

      const mapped = candidate
        .map((row) => {
          const obj = typeof row === 'object' && row ? (row as Record<string, unknown>) : null
          const common = typeof obj?.common === 'string' ? obj.common.trim() : typeof obj?.title === 'string' ? obj.title.trim() : ''
          const binomial =
            typeof obj?.binomial === 'string'
              ? obj.binomial.trim()
              : typeof obj?.subtitle === 'string'
                ? obj.subtitle.trim()
                : ''
          const photoObj = typeof obj?.photo === 'object' && obj.photo ? (obj.photo as Record<string, unknown>) : null
          const urlRaw =
            typeof photoObj?.url === 'string'
              ? photoObj.url
              : typeof obj?.image === 'string'
                ? (obj.image as string)
                : ''
          const text =
            typeof photoObj?.text === 'string'
              ? photoObj.text
              : typeof obj?.text === 'string'
                ? (obj.text as string)
                : common
          const pos = typeof photoObj?.pos === 'string' ? photoObj.pos : typeof obj?.pos === 'string' ? (obj.pos as string) : '50% 50%'
          const by =
            typeof photoObj?.by === 'string'
              ? photoObj.by
              : typeof obj?.by === 'string'
                ? (obj.by as string)
                : ''
          const url = normalizeUrl(urlRaw)
          return {
            common,
            binomial,
            photo: { url, text, pos, by },
          } satisfies GalleryItem
        })
        .filter((it) => it.photo.url.trim().length > 0)

      if (cancelled) return
      setFit(nextFit)
      setItems(mapped)
    }

    const load = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('site_settings')
          .select('value, updated_at')
          .eq('key', HOME_MEMORIES_KEY)
          .maybeSingle()
        if (cancelled || error || !data?.value) return
        applySetting(data.value as unknown, String(data.updated_at ?? Date.now()))
      } catch {
        return
      }
    }

    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel('home-memories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings', filter: `key=eq.${HOME_MEMORIES_KEY}` }, (payload) => {
        if (cancelled) return
        const row = (payload as { new?: { value?: unknown; updated_at?: unknown } }).new
        const commitTimestamp = (payload as { commit_timestamp?: unknown }).commit_timestamp
        applySetting(row?.value, (row?.value as { version?: unknown } | null)?.version ?? commitTimestamp ?? row?.updated_at ?? Date.now())
      })
      .subscribe()

    load()
    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  if (items.length === 0) return null

  return (
    <section className="w-full bg-school-dark text-white relative py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center relative z-10 mb-10">
        <span className="inline-block bg-school-gold/20 text-school-gold text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
          Gallery
        </span>
			  <h2 className="text-3xl lg:text-4xl font-heading font-black text-white">Memories at Growwell</h2>
			<br />
        <p className="text-gray-400 mt-2"></p>
      </div>

      <div className="w-full h-[500px] flex items-center justify-center">
        <CircularGallery items={items} radius={600} fit={fit} />
      </div>
    </section>
  )
};

export default CircularGalleryDemo;
