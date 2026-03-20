"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

import {
  HERO_FOLDER,
  HOME_HERO_IMAGES_KEY,
  SITE_SETTINGS_TABLE,
  STORAGE_BUCKET,
  type HeroImageFit,
} from "../constants";

export function HeroImagesEditor() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [serverImages, setServerImages] = useState<string[]>(["", "", ""]);
  const [images, setImages] = useState<string[]>(["", "", ""]);
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);
  const [fit, setFit] = useState<HeroImageFit>("cover");
  const [serverFit, setServerFit] = useState<HeroImageFit>("cover");
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [displayVersion, setDisplayVersion] = useState(() => Date.now());

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
      });
    };
  }, [previews]);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from(SITE_SETTINGS_TABLE)
        .select("value")
        .eq("key", HOME_HERO_IMAGES_KEY)
        .maybeSingle();

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      const raw = data?.value as unknown;
      const candidate = Array.isArray(raw)
        ? raw
        : typeof raw === "object" && raw && Array.isArray((raw as { images?: unknown }).images)
          ? (raw as { images: unknown[] }).images
          : null;

      const urls = [0, 1, 2].map((i) => {
        const value = candidate?.[i];
        if (typeof value !== "string") return "";
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed.split("?")[0] : "";
      });

      const loadedFit =
        typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";

      setServerImages([urls[0] ?? "", urls[1] ?? "", urls[2] ?? ""]);
      setImages([urls[0] ?? "", urls[1] ?? "", urls[2] ?? ""]);
      setFit(loadedFit);
      setServerFit(loadedFit);
      setDisplayVersion(Date.now());
      setFiles([null, null, null]);
      setPreviews((prev) => {
        prev.forEach((p) => {
          if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return [null, null, null];
      });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load hero images" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = files.some(Boolean) || fit !== serverFit || images.join("|") !== serverImages.join("|");

  const onPickFile = (index: number, file: File | null) => {
    setMessage(null);

    setFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });

    setPreviews((prev) => {
      const next = [...prev];
      if (next[index]?.startsWith("blob:")) URL.revokeObjectURL(next[index] ?? "");
      next[index] = file ? URL.createObjectURL(file) : null;
      return next;
    });
  };

  const removeImage = (index: number) => {
    setMessage(null);

    setFiles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });

    setPreviews((prev) => {
      const next = [...prev];
      if (next[index]?.startsWith("blob:")) URL.revokeObjectURL(next[index] ?? "");
      next[index] = null;
      return next;
    });

    setImages((prev) => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
  };

  const onDropFile = (index: number, file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    onPickFile(index, file);
  };

  const save = async () => {
    if (!dirty) return;

    setSaving(true);
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const nextUrls = [...images];
      const { data: folderItems } = await supabase.storage.from(STORAGE_BUCKET).list(HERO_FOLDER, { limit: 100 });

      for (let i = 0; i < 3; i += 1) {
        const file = files[i];
        const isRemoving = images[i].trim().length === 0 && serverImages[i].trim().length > 0;
        const shouldTouchStorage = Boolean(file) || isRemoving;
        if (!shouldTouchStorage) continue;

        const base = `slide-${i + 1}`;
        const toDelete =
          folderItems
            ?.filter((item) => item.name === base || item.name.startsWith(`${base}.`))
            .map((item) => `${HERO_FOLDER}/${item.name}`) ?? [];
        if (toDelete.length > 0) {
          await supabase.storage.from(STORAGE_BUCKET).remove(toDelete);
        }
      }

      for (let i = 0; i < 3; i += 1) {
        const file = files[i];
        if (!file) continue;

        const path = `${HERO_FOLDER}/slide-${i + 1}`;
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
          upsert: true,
          contentType: file.type,
        });
        if (uploadError) {
          setMessage({ type: "error", text: uploadError.message });
          return;
        }

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        nextUrls[i] = data.publicUrl;
      }

      const { error: upsertError } = await supabase
        .from(SITE_SETTINGS_TABLE)
        .upsert({ key: HOME_HERO_IMAGES_KEY, value: { images: nextUrls, fit, version: Date.now() } }, { onConflict: "key" });

      if (upsertError) {
        setMessage({ type: "error", text: upsertError.message });
        return;
      }

      setImages(nextUrls);
      setServerImages(nextUrls);
      setServerFit(fit);
      setDisplayVersion(Date.now());
      setFiles([null, null, null]);
      setPreviews((prev) => {
        prev.forEach((p) => {
          if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return [null, null, null];
      });
      setMessage({ type: "success", text: "Hero images updated" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save hero images" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="font-bold text-lg">Hero Images</div>
          <div className="text-sm text-gray-500">Upload exactly 3 images. Changes reflect on the Home page hero slider.</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading || saving}
            className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Reload"}
          </button>
          <button
            onClick={save}
            disabled={!dirty || saving || loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="text-sm font-semibold text-gray-700">Image Fit</div>
        <div className="flex items-center rounded-xl border overflow-hidden">
          <button
            type="button"
            onClick={() => setFit("cover")}
            disabled={saving || loading}
            className={`px-4 py-2 text-sm ${fit === "cover" ? "bg-school-dark text-white" : "bg-white text-gray-700 hover:bg-gray-50"} disabled:opacity-60`}
          >
            Cover
          </button>
          <button
            type="button"
            onClick={() => setFit("contain")}
            disabled={saving || loading}
            className={`px-4 py-2 text-sm ${fit === "contain" ? "bg-school-dark text-white" : "bg-white text-gray-700 hover:bg-gray-50"} disabled:opacity-60`}
          >
            Contain
          </button>
        </div>
      </div>

      {message ? (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm border ${
            message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => {
          const src = previews[i] || (images[i] ? `${images[i]}?v=${displayVersion}` : "");
          const hasAny = Boolean(files[i] || previews[i] || images[i]);
          return (
            <div key={i} className="border rounded-2xl overflow-hidden">
              <div className="relative aspect-[16/10] bg-gray-100">
                {src ? (
                  <Image
                    src={src}
                    alt={`Hero image ${i + 1}`}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className={fit === "contain" ? "object-contain bg-school-dark" : "object-cover"}
                    unoptimized={src.startsWith("blob:")}
                  />
                ) : null}
              </div>

              <div className="p-4">
                <div className="font-semibold mb-2">Image {i + 1}</div>

                <label
                  className={`block border-2 border-dashed rounded-xl px-4 py-4 text-sm cursor-pointer select-none ${
                    dragOverIndex === i ? "border-school-green bg-school-green/5" : "border-gray-200 hover:border-school-green/60"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverIndex(i);
                  }}
                  onDragLeave={() => setDragOverIndex((v) => (v === i ? null : v))}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverIndex(null);
                    onDropFile(i, e.dataTransfer.files?.[0] ?? null);
                  }}
                >
                  <div className="font-semibold text-gray-800">Drag & drop an image here</div>
                  <div className="text-xs text-gray-500 mt-1">or click to upload</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickFile(i, e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center justify-between gap-3 mt-3">
                  <div className="text-xs text-gray-500 truncate">{previews[i] ? "Preview (not saved)" : images[i] ? "Saved" : "Empty"}</div>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    disabled={!hasAny || saving || loading}
                    className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

