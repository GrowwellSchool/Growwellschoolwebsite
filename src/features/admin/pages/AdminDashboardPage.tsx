"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Award, BookOpen, Calendar, ChevronLeft, ChevronRight, FileText, Image as ImageIcon, MessageSquare, Star, Users } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { AdminNav } from "@/features/admin/dashboard/components/AdminNav";
import { useAutoMessage } from "@/features/admin/dashboard/hooks/useAutoMessage";
import { MultiImageDropzone, SingleImageDropzone } from "@/features/admin/dashboard/components/Dropzones";
import {
  ABOUT_FOLDER,
  ADMIN_ACTIVE_SECTION_KEY,
  ADMIN_SECTIONS,
  BLOGS_FOLDER,
  BLOGS_PAGE_KEY,
  DESK_FOLDER,
  EVENTS_FOLDER,
  EVENTS_PAGE_KEY,
  GALLERY_FOLDER,
  GALLERY_PAGE_KEY,
  HERO_FOLDER,
  HOME_ABOUT_KEY,
  HOME_DESK_KEY,
  HOME_HERO_IMAGES_KEY,
  HOME_LIFE_KEY,
  HOME_MEMORIES_KEY,
  HOME_NEWS_KEY,
  HOME_NOTIFICATIONS_KEY,
  HOME_PROGRAMS_KEY,
  LIFE_FOLDER,
  MEMORIES_FOLDER,
  NEWS_FOLDER,
  PROGRAMS_FOLDER,
  SITE_SETTINGS_TABLE,
  STORAGE_BUCKET,
  type HeroImageFit,
} from "@/features/admin/dashboard/constants";
import { ContactMessagesViewer } from "@/features/admin/dashboard/sections/ContactMessagesViewer";

import type { AdminNavItem, AdminSectionKey } from "@/features/admin/dashboard/types";
import { capitalizeFirstLetter } from "@/features/admin/dashboard/utils";

// Reusable Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemName = "items",
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemName?: string;
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const showPages = 5;

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t mt-4">
      <div className="text-sm text-gray-500">
        Showing page {currentPage} of {totalPages} ({totalItems} {itemName})
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
        >
          <ChevronLeft size={16} />
        </button>
        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${
                currentPage === page
                  ? "bg-school-green text-white"
                  : "border hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function HeroImagesEditor() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useAutoMessage();
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
        .upsert(
          { key: HOME_HERO_IMAGES_KEY, value: { images: nextUrls, fit, version: Date.now() } },
          { onConflict: "key" },
        );

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
          <div className="text-sm text-gray-500">
            Upload exactly 3 images. Changes reflect on the Home page hero slider.
          </div>
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
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
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
                    dragOverIndex === i
                      ? "border-school-green bg-school-green/5"
                      : "border-gray-200 hover:border-school-green/60"
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
                  <div className="text-xs text-gray-500 truncate">
                    {previews[i] ? "Preview (not saved)" : images[i] ? "Saved" : "Empty"}
                  </div>
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

function HomeNotificationsEditor() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useAutoMessage();
  const [serverText, setServerText] = useState("");
  const [text, setText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from(SITE_SETTINGS_TABLE)
        .select("value")
        .eq("key", HOME_NOTIFICATIONS_KEY)
        .maybeSingle();

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      const raw = data?.value as unknown;
      const candidate = Array.isArray(raw)
        ? raw
        : typeof raw === "object" && raw && Array.isArray((raw as { items?: unknown }).items)
          ? (raw as { items: unknown[] }).items
          : [];

      const nextLines = candidate.map((v) => (typeof v === "string" ? v.trim() : "")).filter((v) => v.length > 0);

      const next = nextLines.join("\n");
      setServerText(next);
      setText(next);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load notifications" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = text.trim() !== serverText.trim();

  const save = async () => {
    if (!dirty) return;

    setSaving(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const items = text
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const { error } = await supabase
        .from(SITE_SETTINGS_TABLE)
        .upsert({ key: HOME_NOTIFICATIONS_KEY, value: { items, version: Date.now() } }, { onConflict: "key" });

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      const next = items.join("\n");
      setServerText(next);
      setText(next);
      setMessage({ type: "success", text: "Notifications updated" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save notifications" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="font-bold text-lg">Notifications</div>
          <div className="text-sm text-gray-500">One notification per line. Appears in the Home page ticker.</div>
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

      {message ? (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="admin-notifications" className="block text-sm font-semibold text-gray-700">
          Notifications (one per line)
        </label>
        <textarea
          id="admin-notifications"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Type notifications here..."
          className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
          disabled={loading || saving}
        />
      </div>
    </div>
  );
}

type ProgramItem = { title: string; details: string; image: string };
type ProgramImageFit = "cover" | "contain";

type AboutFit = "cover" | "contain";

function AboutEditor() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useAutoMessage();
  const [serverImages, setServerImages] = useState<string[]>(["", "", ""]);
  const [images, setImages] = useState<string[]>(["", "", ""]);
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);
  const [fit, setFit] = useState<AboutFit>("cover");
  const [serverFit, setServerFit] = useState<AboutFit>("cover");
  const [details, setDetails] = useState("");
  const [serverDetails, setServerDetails] = useState("");
  const [mission, setMission] = useState("");
  const [serverMission, setServerMission] = useState("");
  const [vision, setVision] = useState("");
  const [serverVision, setServerVision] = useState("");
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
        .eq("key", HOME_ABOUT_KEY)
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
          : [];

      const urls = [0, 1, 2].map((i) => {
        const value = candidate?.[i];
        if (typeof value !== "string") return "";
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed.split("?")[0] : "";
      });

      const loadedFit =
        typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";
      const loadedDetails =
        typeof raw === "object" && raw && typeof (raw as { details?: unknown }).details === "string"
          ? String((raw as { details: string }).details)
          : "";
      const loadedMission =
        typeof raw === "object" && raw && typeof (raw as { mission?: unknown }).mission === "string"
          ? String((raw as { mission: string }).mission)
          : "";
      const loadedVision =
        typeof raw === "object" && raw && typeof (raw as { vision?: unknown }).vision === "string"
          ? String((raw as { vision: string }).vision)
          : "";

      setServerImages([urls[0] ?? "", urls[1] ?? "", urls[2] ?? ""]);
      setImages([urls[0] ?? "", urls[1] ?? "", urls[2] ?? ""]);
      setFit(loadedFit);
      setServerFit(loadedFit);

      setDetails(loadedDetails);
      setServerDetails(loadedDetails);
      setMission(loadedMission);
      setServerMission(loadedMission);
      setVision(loadedVision);
      setServerVision(loadedVision);

      setDisplayVersion(Date.now());
      setFiles([null, null, null]);
      setPreviews((prev) => {
        prev.forEach((p) => {
          if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return [null, null, null];
      });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load about content" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty =
    files.some(Boolean) ||
    fit !== serverFit ||
    images.join("|") !== serverImages.join("|") ||
    details.trim() !== serverDetails.trim() ||
    mission.trim() !== serverMission.trim() ||
    vision.trim() !== serverVision.trim();

  const onPickFile = (index: number, file: File | null) => {
    setMessage(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });

    setPreviews((prev) => {
      const next = [...prev];
      if (next[index]?.startsWith("blob:")) URL.revokeObjectURL(next[index] ?? "");
      next[index] = URL.createObjectURL(file);
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

  const save = async () => {
    if (!dirty) return;

    setSaving(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const nextUrls = [...images];
      const { data: folderItems } = await supabase.storage.from(STORAGE_BUCKET).list(ABOUT_FOLDER, { limit: 100 });

      for (let i = 0; i < 3; i += 1) {
        const file = files[i];
        const isRemoving = images[i].trim().length === 0 && serverImages[i].trim().length > 0;
        const shouldTouchStorage = Boolean(file) || isRemoving;
        if (!shouldTouchStorage) continue;

        const base = `image-${i + 1}`;
        const toDelete =
          folderItems
            ?.filter((item) => item.name === base || item.name.startsWith(`${base}.`))
            .map((item) => `${ABOUT_FOLDER}/${item.name}`) ?? [];
        if (toDelete.length > 0) {
          await supabase.storage.from(STORAGE_BUCKET).remove(toDelete);
        }
      }

      for (let i = 0; i < 3; i += 1) {
        const file = files[i];
        if (!file) continue;

        const path = `${ABOUT_FOLDER}/image-${i + 1}`;
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

      const { error } = await supabase.from(SITE_SETTINGS_TABLE).upsert(
        {
          key: HOME_ABOUT_KEY,
          value: {
            images: nextUrls,
            fit,
            details: details.trim(),
            mission: mission.trim(),
            vision: vision.trim(),
            version: Date.now(),
          },
        },
        { onConflict: "key" },
      );

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      setImages(nextUrls);
      setServerImages(nextUrls);
      setServerFit(fit);
      setServerDetails(details);
      setServerMission(mission);
      setServerVision(vision);
      setDisplayVersion(Date.now());
      setFiles([null, null, null]);
      setPreviews((prev) => {
        prev.forEach((p) => {
          if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return [null, null, null];
      });
      setMessage({ type: "success", text: "About section updated" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save about section" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="font-bold text-lg">About Section</div>
          <div className="text-sm text-gray-500">Upload 3 images and edit details, mission and vision.</div>
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
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((i) => {
          const base = previews[i] || images[i];
          const src = base ? (base.startsWith("blob:") ? base : `${base.split("?")[0]}?v=${displayVersion}`) : "";
          const hasAny = Boolean(files[i] || previews[i] || images[i]);
          return (
            <div key={i} className="border rounded-2xl overflow-hidden">
              <div className="relative aspect-[16/10] bg-gray-100">
                {src ? (
                  fit === "contain" ? (
                    <>
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover scale-110 blur-2xl"
                        aria-hidden
                        unoptimized={src.startsWith("blob:")}
                      />
                      <Image
                        src={src}
                        alt={`About image ${i + 1}`}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-contain"
                        unoptimized={src.startsWith("blob:")}
                      />
                    </>
                  ) : (
                    <Image
                      src={src}
                      alt={`About image ${i + 1}`}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                      unoptimized={src.startsWith("blob:")}
                    />
                  )
                ) : null}
              </div>

              <div className="p-4">
                <div className="font-semibold mb-2">Image {i + 1}</div>

                <label className="block border-2 border-dashed rounded-xl px-4 py-4 text-sm cursor-pointer select-none border-gray-200 hover:border-school-green/60">
                  <div className="font-semibold text-gray-800">Click to upload</div>
                  <div className="text-xs text-gray-500 mt-1">or drag & drop</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickFile(i, e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center justify-between gap-3 mt-3">
                  <div className="text-xs text-gray-500 truncate">
                    {previews[i] ? "Preview" : images[i] ? "Saved" : "Empty"}
                  </div>
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

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label htmlFor="about-details" className="block text-sm font-semibold text-gray-700">
            Details
          </label>
          <textarea
            id="about-details"
            value={details}
            onChange={(e) => setDetails(capitalizeFirstLetter(e.target.value))}
            rows={8}
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
            disabled={saving || loading}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="about-mission" className="block text-sm font-semibold text-gray-700">
              Mission
            </label>
            <textarea
              id="about-mission"
              value={mission}
              onChange={(e) => setMission(capitalizeFirstLetter(e.target.value))}
              rows={4}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
              disabled={saving || loading}
            />
          </div>
          <div className="space-y-3">
            <label htmlFor="about-vision" className="block text-sm font-semibold text-gray-700">
              Vision
            </label>
            <textarea
              id="about-vision"
              value={vision}
              onChange={(e) => setVision(capitalizeFirstLetter(e.target.value))}
              rows={4}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
              disabled={saving || loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgramsActivitiesEditor() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useAutoMessage();
  const [serverItems, setServerItems] = useState<ProgramItem[]>(
    Array.from({ length: 6 }, () => ({ title: "", details: "", image: "" })),
  );
  const [items, setItems] = useState<ProgramItem[]>(
    Array.from({ length: 6 }, () => ({ title: "", details: "", image: "" })),
  );
  const [files, setFiles] = useState<(File | null)[]>(Array.from({ length: 6 }, () => null));
  const [previews, setPreviews] = useState<(string | null)[]>(Array.from({ length: 6 }, () => null));
  const [fit, setFit] = useState<ProgramImageFit>("cover");
  const [serverFit, setServerFit] = useState<ProgramImageFit>("cover");
  const [displayVersion, setDisplayVersion] = useState(() => Date.now());

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
      });
    };
  }, [previews]);

  const normalizeSix = (raw: unknown): ProgramItem[] => {
    const candidate =
      typeof raw === "object" && raw && Array.isArray((raw as { items?: unknown }).items)
        ? ((raw as { items: unknown[] }).items as unknown[])
        : Array.isArray(raw)
          ? (raw as unknown[])
          : [];

    const normalized = candidate.slice(0, 6).map((row) => {
      const obj = typeof row === "object" && row ? (row as Record<string, unknown>) : null;
      const title = typeof obj?.title === "string" ? obj.title.trim() : "";
      const details =
        typeof obj?.details === "string" ? obj.details.trim() : typeof obj?.desc === "string" ? obj.desc.trim() : "";
      const image =
        typeof obj?.image === "string"
          ? obj.image.trim().split("?")[0]
          : typeof obj?.img === "string"
            ? obj.img.trim().split("?")[0]
            : "";
      return { title, details, image };
    });

    return Array.from({ length: 6 }, (_, i) => normalized[i] ?? { title: "", details: "", image: "" });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from(SITE_SETTINGS_TABLE)
        .select("value")
        .eq("key", HOME_PROGRAMS_KEY)
        .maybeSingle();

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      const raw = data?.value as unknown;
      const next = normalizeSix(raw);
      const loadedFit =
        typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";
      setServerItems(next);
      setItems(next);
      setFit(loadedFit);
      setServerFit(loadedFit);
      setFiles(Array.from({ length: 6 }, () => null));
      setPreviews((prev) => {
        prev.forEach((p) => {
          if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return Array.from({ length: 6 }, () => null);
      });
      setDisplayVersion(Date.now());
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load programs" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty =
    files.some(Boolean) ||
    fit !== serverFit ||
    items.some(
      (it, i) =>
        it.title !== serverItems[i]?.title ||
        it.details !== serverItems[i]?.details ||
        it.image !== serverItems[i]?.image,
    );

  const onPickFile = (index: number, file: File | null) => {
    setMessage(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });

    setPreviews((prev) => {
      const next = [...prev];
      if (next[index]?.startsWith("blob:")) URL.revokeObjectURL(next[index] ?? "");
      next[index] = URL.createObjectURL(file);
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

    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], image: "" };
      return next;
    });
  };

  const updateItem = (index: number, patch: Partial<ProgramItem>) => {
    const nextPatch: Partial<ProgramItem> = { ...patch };
    if (typeof nextPatch.title === "string") nextPatch.title = capitalizeFirstLetter(nextPatch.title);
    if (typeof nextPatch.details === "string") nextPatch.details = capitalizeFirstLetter(nextPatch.details);
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...nextPatch };
      return next;
    });
  };

  const save = async () => {
    if (!dirty) return;

    setSaving(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const nextItems: ProgramItem[] = items.map((it) => ({
        title: it.title.trim(),
        details: it.details.trim(),
        image: it.image.trim(),
      }));

      const { data: folderItems } = await supabase.storage.from(STORAGE_BUCKET).list(PROGRAMS_FOLDER, { limit: 200 });

      for (let i = 0; i < 6; i += 1) {
        const file = files[i];
        const isRemoving = nextItems[i].image.length === 0 && serverItems[i]?.image?.trim().length > 0;
        const shouldTouchStorage = Boolean(file) || isRemoving;
        if (!shouldTouchStorage) continue;

        const base = `item-${i + 1}`;
        const toDelete =
          folderItems
            ?.filter((item) => item.name === base || item.name.startsWith(`${base}.`))
            .map((item) => `${PROGRAMS_FOLDER}/${item.name}`) ?? [];
        if (toDelete.length > 0) {
          await supabase.storage.from(STORAGE_BUCKET).remove(toDelete);
        }
      }

      for (let i = 0; i < 6; i += 1) {
        const file = files[i];
        if (!file) continue;

        const path = `${PROGRAMS_FOLDER}/item-${i + 1}`;
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
          upsert: true,
          contentType: file.type,
        });
        if (uploadError) {
          setMessage({ type: "error", text: uploadError.message });
          return;
        }

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        nextItems[i] = { ...nextItems[i], image: data.publicUrl };
      }

      const { error } = await supabase
        .from(SITE_SETTINGS_TABLE)
        .upsert(
          { key: HOME_PROGRAMS_KEY, value: { items: nextItems, fit, version: Date.now() } },
          { onConflict: "key" },
        );

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      setServerItems(nextItems);
      setItems(nextItems);
      setServerFit(fit);
      setFiles(Array.from({ length: 6 }, () => null));
      setPreviews((prev) => {
        prev.forEach((p) => {
          if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return Array.from({ length: 6 }, () => null);
      });
      setDisplayVersion(Date.now());
      setMessage({ type: "success", text: "Programs updated" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save programs" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="font-bold text-lg">Programs & Activities</div>
          <div className="text-sm text-gray-500">Update 6 cards: image, title and details.</div>
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
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it, i) => {
          const src = previews[i] || (it.image ? `${it.image.split("?")[0]}?v=${displayVersion}` : "");
          const hasAny = Boolean(files[i] || previews[i] || it.image);
          const titleId = `admin-program-${i}-title`;
          const detailsId = `admin-program-${i}-details`;
          return (
            <div key={i} className="border rounded-2xl overflow-hidden">
              <div className="relative aspect-[16/10] bg-gray-100">
                {src ? (
                  fit === "contain" ? (
                    <>
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover scale-110 blur-2xl"
                        aria-hidden
                        unoptimized={src.startsWith("blob:")}
                      />
                      <Image
                        src={src}
                        alt={it.title || `Program ${i + 1}`}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-contain"
                        unoptimized={src.startsWith("blob:")}
                      />
                    </>
                  ) : (
                    <Image
                      src={src}
                      alt={it.title || `Program ${i + 1}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                      unoptimized={src.startsWith("blob:")}
                    />
                  )
                ) : null}
              </div>

              <div className="p-4 space-y-3">
                <div className="font-semibold">Item {i + 1}</div>

                <label className="block border-2 border-dashed rounded-xl px-4 py-4 text-sm cursor-pointer select-none border-gray-200 hover:border-school-green/60">
                  <div className="font-semibold text-gray-800">Click to upload image</div>
                  <div className="text-xs text-gray-500 mt-1">Recommended: wide image</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickFile(i, e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-gray-500 truncate">
                    {previews[i] ? "Preview" : it.image ? "Saved" : "Empty"}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    disabled={!hasAny || saving || loading}
                    className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-1">
                  <label htmlFor={titleId} className="block text-xs font-semibold text-gray-700">
                    Title
                  </label>
                  <input
                    id={titleId}
                    value={it.title}
                    onChange={(e) => updateItem(i, { title: e.target.value })}
                    placeholder="Title"
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor={detailsId} className="block text-xs font-semibold text-gray-700">
                    Details
                  </label>
                  <textarea
                    id={detailsId}
                    value={it.details}
                    onChange={(e) => updateItem(i, { details: e.target.value })}
                    placeholder="Details"
                    rows={3}
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type MemoriesFit = "cover" | "contain";
type MemoriesItem = {
  common: string;
  binomial: string;
  url: string;
  text: string;
  pos: string;
  by: string;
};

function MemoriesEditor() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useAutoMessage();
  const emptyItems = useMemo(
    (): MemoriesItem[] =>
      Array.from({ length: 10 }, () => ({
        common: "",
        binomial: "",
        url: "",
        text: "",
        pos: "50% 50%",
        by: "",
      })),
    [],
  );

  const [serverItems, setServerItems] = useState<MemoriesItem[]>(emptyItems);
  const [items, setItems] = useState<MemoriesItem[]>(emptyItems);
  const [files, setFiles] = useState<(File | null)[]>(Array.from({ length: 10 }, () => null));
  const [previews, setPreviews] = useState<(string | null)[]>(Array.from({ length: 10 }, () => null));
  const [fit, setFit] = useState<MemoriesFit>("cover");
  const [serverFit, setServerFit] = useState<MemoriesFit>("cover");
  const [displayVersion, setDisplayVersion] = useState(() => Date.now());

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
      });
    };
  }, [previews]);

  const normalizeTen = useCallback(
    (raw: unknown): { items: MemoriesItem[]; fit: MemoriesFit } => {
      const loadedFit =
        typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";
      const candidate = Array.isArray(raw)
        ? raw
        : typeof raw === "object" && raw && Array.isArray((raw as { items?: unknown }).items)
          ? ((raw as { items: unknown[] }).items as unknown[])
          : [];

      const mapped = candidate.slice(0, 10).map((row) => {
        const obj = typeof row === "object" && row ? (row as Record<string, unknown>) : null;
        const common =
          typeof obj?.common === "string" ? obj.common.trim() : typeof obj?.title === "string" ? obj.title.trim() : "";
        const binomial =
          typeof obj?.binomial === "string"
            ? obj.binomial.trim()
            : typeof obj?.subtitle === "string"
              ? obj.subtitle.trim()
              : "";

        const photo = typeof obj?.photo === "object" && obj.photo ? (obj.photo as Record<string, unknown>) : null;
        const url =
          typeof photo?.url === "string"
            ? String(photo.url).trim().split("?")[0]
            : typeof obj?.url === "string"
              ? String(obj.url).trim().split("?")[0]
              : "";
        const text =
          typeof photo?.text === "string" ? String(photo.text) : typeof obj?.text === "string" ? String(obj.text) : "";
        const pos =
          typeof photo?.pos === "string"
            ? String(photo.pos)
            : typeof obj?.pos === "string"
              ? String(obj.pos)
              : "50% 50%";
        const by = typeof photo?.by === "string" ? String(photo.by) : typeof obj?.by === "string" ? String(obj.by) : "";

        return { common, binomial, url, text, pos, by };
      });

      return {
        fit: loadedFit,
        items: Array.from({ length: 10 }, (_, i) => mapped[i] ?? emptyItems[i]),
      };
    },
    [emptyItems],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from(SITE_SETTINGS_TABLE)
        .select("value")
        .eq("key", HOME_MEMORIES_KEY)
        .maybeSingle();

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      const raw = data?.value as unknown;
      const normalized = normalizeTen(raw);
      setServerItems(normalized.items);
      setItems(normalized.items);
      setFit(normalized.fit);
      setServerFit(normalized.fit);
      setFiles(Array.from({ length: 10 }, () => null));
      setPreviews((prev) => {
        prev.forEach((p) => {
          if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return Array.from({ length: 10 }, () => null);
      });
      setDisplayVersion(Date.now());
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load memories" });
    } finally {
      setLoading(false);
    }
  }, [normalizeTen]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty =
    files.some(Boolean) ||
    fit !== serverFit ||
    items.some((it, i) => {
      const s = serverItems[i];
      return (
        it.common !== s?.common ||
        it.binomial !== s?.binomial ||
        it.url !== s?.url ||
        it.text !== s?.text ||
        it.pos !== s?.pos ||
        it.by !== s?.by
      );
    });

  const updateItem = (index: number, patch: Partial<MemoriesItem>) => {
    const nextPatch: Partial<MemoriesItem> = { ...patch };
    if (typeof nextPatch.common === "string") nextPatch.common = capitalizeFirstLetter(nextPatch.common);
    if (typeof nextPatch.binomial === "string") nextPatch.binomial = capitalizeFirstLetter(nextPatch.binomial);
    if (typeof nextPatch.text === "string") nextPatch.text = capitalizeFirstLetter(nextPatch.text);
    if (typeof nextPatch.by === "string") nextPatch.by = capitalizeFirstLetter(nextPatch.by);
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...nextPatch };
      return next;
    });
  };

  const onPickFile = (index: number, file: File | null) => {
    setMessage(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });

    setPreviews((prev) => {
      const next = [...prev];
      if (next[index]?.startsWith("blob:")) URL.revokeObjectURL(next[index] ?? "");
      next[index] = URL.createObjectURL(file);
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

    updateItem(index, { url: "" });
  };

  const save = async () => {
    if (!dirty) return;

    setSaving(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const nextItems = items.map((it) => ({
        common: it.common.trim(),
        binomial: it.binomial.trim(),
        url: it.url.trim(),
        text: it.text.trim(),
        pos: "50% 50%",
        by: it.by.trim(),
      }));

      const { data: folderItems } = await supabase.storage.from(STORAGE_BUCKET).list(MEMORIES_FOLDER, { limit: 300 });

      for (let i = 0; i < 10; i += 1) {
        const file = files[i];
        const isRemoving = nextItems[i].url.length === 0 && serverItems[i]?.url?.trim().length > 0;
        const shouldTouchStorage = Boolean(file) || isRemoving;
        if (!shouldTouchStorage) continue;

        const base = `item-${i + 1}`;
        const toDelete =
          folderItems
            ?.filter((item) => item.name === base || item.name.startsWith(`${base}.`))
            .map((item) => `${MEMORIES_FOLDER}/${item.name}`) ?? [];
        if (toDelete.length > 0) {
          await supabase.storage.from(STORAGE_BUCKET).remove(toDelete);
        }
      }

      for (let i = 0; i < 10; i += 1) {
        const file = files[i];
        if (!file) continue;

        const path = `${MEMORIES_FOLDER}/item-${i + 1}`;
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
          upsert: true,
          contentType: file.type,
        });
        if (uploadError) {
          setMessage({ type: "error", text: uploadError.message });
          return;
        }

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        nextItems[i] = { ...nextItems[i], url: data.publicUrl };
      }

      const payloadItems = nextItems.map((it) => ({
        common: it.common,
        binomial: it.binomial,
        photo: {
          url: it.url,
          text: it.text || it.common,
          pos: it.pos || "50% 50%",
          by: it.by,
        },
      }));

      const { error } = await supabase
        .from(SITE_SETTINGS_TABLE)
        .upsert(
          { key: HOME_MEMORIES_KEY, value: { items: payloadItems, fit, version: Date.now() } },
          { onConflict: "key" },
        );

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      setServerItems(nextItems);
      setItems(nextItems);
      setServerFit(fit);
      setFiles(Array.from({ length: 10 }, () => null));
      setPreviews((prev) => {
        prev.forEach((p) => {
          if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return Array.from({ length: 10 }, () => null);
      });
      setDisplayVersion(Date.now());
      setMessage({ type: "success", text: "Memories updated" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save memories" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="font-bold text-lg">Memories at Growwell</div>
          <div className="text-sm text-gray-500">Upload up to 10 images for the circular gallery.</div>
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
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it, i) => {
          const base = previews[i] || it.url;
          const src = base ? (base.startsWith("blob:") ? base : `${base.split("?")[0]}?v=${displayVersion}`) : "";
          const hasAny = Boolean(files[i] || previews[i] || it.url);
          const titleId = `admin-memories-${i}-title`;
          const subtitleId = `admin-memories-${i}-subtitle`;
          const textId = `admin-memories-${i}-text`;
          const byId = `admin-memories-${i}-by`;
          const posId = `admin-memories-${i}-pos`;

          return (
            <div key={i} className="border rounded-2xl overflow-hidden">
              <div className="relative aspect-[16/10] bg-gray-100">
                {src ? (
                  fit === "contain" ? (
                    <>
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover scale-110 blur-2xl"
                        aria-hidden
                        unoptimized={src.startsWith("blob:")}
                        style={{ objectPosition: it.pos || "50% 50%" }}
                      />
                      <Image
                        src={src}
                        alt={it.text || it.common || `Memory ${i + 1}`}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-contain"
                        unoptimized={src.startsWith("blob:")}
                        style={{ objectPosition: it.pos || "50% 50%" }}
                      />
                    </>
                  ) : (
                    <Image
                      src={src}
                      alt={it.text || it.common || `Memory ${i + 1}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                      unoptimized={src.startsWith("blob:")}
                      style={{ objectPosition: it.pos || "50% 50%" }}
                    />
                  )
                ) : null}
              </div>

              <div className="p-4 space-y-3">
                <div className="font-semibold">Item {i + 1}</div>

                <label className="block border-2 border-dashed rounded-xl px-4 py-4 text-sm cursor-pointer select-none border-gray-200 hover:border-school-green/60">
                  <div className="font-semibold text-gray-800">Click to upload image</div>
                  <div className="text-xs text-gray-500 mt-1">Required to show this item</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickFile(i, e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-gray-500 truncate">
                    {previews[i] ? "Preview" : it.url ? "Saved" : "Empty"}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    disabled={!hasAny || saving || loading}
                    className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-1">
                  <label htmlFor={titleId} className="block text-xs font-semibold text-gray-700">
                    Title
                  </label>
                  <input
                    id={titleId}
                    value={it.common}
                    onChange={(e) => updateItem(i, { common: e.target.value })}
                    placeholder="Title"
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={subtitleId} className="block text-xs font-semibold text-gray-700">
                    Subtitle
                  </label>
                  <input
                    id={subtitleId}
                    value={it.binomial}
                    onChange={(e) => updateItem(i, { binomial: e.target.value })}
                    placeholder="Subtitle"
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={textId} className="block text-xs font-semibold text-gray-700">
                    Text
                  </label>
                  <textarea
                    id={textId}
                    value={it.text}
                    onChange={(e) => updateItem(i, { text: e.target.value })}
                    placeholder="Text"
                    rows={2}
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={byId} className="block text-xs font-semibold text-gray-700">
                    Photo by
                  </label>
                  <input
                    id={byId}
                    value={it.by}
                    onChange={(e) => updateItem(i, { by: e.target.value })}
                    placeholder="Photo by"
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={posId} className="block text-xs font-semibold text-gray-700">
                    Object position
                  </label>
                  <input
                    id={posId}
                    value="50% 50%"
                    readOnly
                    placeholder="Object Position (e.g. 50% 50%)"
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type LifeFit = "cover" | "contain";
type LifeItem = { label: string; url: string };

type NewsItem = {
  id: string;
  tag: string;
  date: string;
  title: string;
  desc: string;
  href: string;
  image: string;
  path: string;
};

type NewsFit = "cover" | "contain";

function HomeNewsEditor() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useAutoMessage();

  const [serverItems, setServerItems] = useState<NewsItem[]>([]);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [fit, setFit] = useState<NewsFit>("cover");
  const [serverFit, setServerFit] = useState<NewsFit>("cover");

  const [newFiles, setNewFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [displayVersion, setDisplayVersion] = useState(() => Date.now());

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    if (page > Math.ceil(items.length / itemsPerPage)) {
      setPage(Math.max(1, Math.ceil(items.length / itemsPerPage)));
    }
  }, [items.length, page]);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((p) => {
        if (p.startsWith("blob:")) URL.revokeObjectURL(p);
      });
    };
  }, [previews]);

  const normalize = useCallback((raw: unknown): NewsItem[] => {
    const candidate =
      typeof raw === "object" && raw && Array.isArray((raw as { items?: unknown }).items)
        ? ((raw as { items: unknown[] }).items as unknown[])
        : Array.isArray(raw)
          ? raw
          : [];

    return candidate
      .map((row, idx) => {
        const obj = typeof row === "object" && row ? (row as Record<string, unknown>) : null;
        const id =
          typeof obj?.id === "string"
            ? obj.id.trim()
            : typeof obj?.id === "number"
              ? String(obj.id)
              : `news-${idx + 1}`;
        const tag = typeof obj?.tag === "string" ? obj.tag.trim() : "";
        const date = typeof obj?.date === "string" ? obj.date.trim() : "";
        const title = typeof obj?.title === "string" ? obj.title.trim() : "";
        const desc =
          typeof obj?.desc === "string"
            ? obj.desc.trim()
            : typeof obj?.summary === "string"
              ? obj.summary.trim()
              : typeof obj?.details === "string"
                ? obj.details.trim()
                : "";
        const detailHref = `/news/${encodeURIComponent(id)}`;
        const rawHref =
          typeof obj?.href === "string" && obj.href.trim().length > 0
            ? obj.href.trim()
            : typeof obj?.url === "string" && obj.url.trim().length > 0
              ? obj.url.trim()
              : "";
        const href = rawHref.length === 0 || rawHref === "/news" || rawHref === "news" ? detailHref : rawHref;
        const image =
          typeof obj?.image === "string"
            ? obj.image.trim().split("?")[0]
            : typeof obj?.img === "string"
              ? obj.img.trim().split("?")[0]
              : "";
        const path =
          typeof obj?.path === "string" && obj.path.trim().length > 0 ? obj.path.trim() : `${NEWS_FOLDER}/${id}`;
        return { id, tag, date, title, desc, href, image, path } satisfies NewsItem;
      })
      .filter((n) => n.id.trim().length > 0);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const [settingsRes, newsRes] = await Promise.all([
        supabase.from(SITE_SETTINGS_TABLE).select("value").eq("key", HOME_NEWS_KEY).maybeSingle(),
        supabase.from("news").select("*").order("created_at", { ascending: false })
      ]);

      if (settingsRes.error && settingsRes.error.code !== "PGRST116") throw new Error(settingsRes.error.message);
      if (newsRes.error) throw new Error(newsRes.error.message);

      const raw = settingsRes.data?.value as unknown;
      const dbNews = newsRes.data || [];

      const loadedItems = dbNews.map(n => ({
        id: n.id,
        tag: n.tag,
        date: n.date,
        title: n.title,
        desc: n.excerpt || "",
        href: n.href,
        image: n.image,
        path: `${NEWS_FOLDER}/${n.id}`
      }));

      const normalized = normalize(loadedItems);
      const loadedFit =
        typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";
      setServerItems(normalized);
      setItems(normalized);
      setFit(loadedFit);
      setServerFit(loadedFit);

      setPreviews((prev) => {
        Object.values(prev).forEach((p) => {
          if (p.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return {};
      });
      setNewFiles({});
      setDisplayVersion(Date.now());
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load News section" });
    } finally {
      setLoading(false);
    }
  }, [normalize]);

  useEffect(() => {
    load();
  }, [load]);

  const addItem = () => {
    setMessage(null);
    const id = `news-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const next: NewsItem = {
      id,
      tag: "",
      date: "",
      title: "",
      desc: "",
      href: `/news/${encodeURIComponent(id)}`,
      image: "",
      path: `${NEWS_FOLDER}/${id}`,
    };
    setItems((prev) => [next, ...prev]);
  };

  const removeItem = (id: string) => {
    setMessage(null);
    setItems((prev) => prev.filter((x) => x.id !== id));
    setNewFiles((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setPreviews((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      if (existing.startsWith("blob:")) URL.revokeObjectURL(existing);
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const moveItem = (id: string, dir: -1 | 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === id);
      if (idx < 0) return prev;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[nextIdx];
      next[nextIdx] = temp;
      return next;
    });
  };

  const updateItem = (id: string, patch: Partial<NewsItem>) => {
    const nextPatch: Partial<NewsItem> = { ...patch };
    if (typeof nextPatch.tag === "string") nextPatch.tag = capitalizeFirstLetter(nextPatch.tag);
    if (typeof nextPatch.date === "string") nextPatch.date = capitalizeFirstLetter(nextPatch.date);
    if (typeof nextPatch.title === "string") nextPatch.title = capitalizeFirstLetter(nextPatch.title);
    if (typeof nextPatch.desc === "string") nextPatch.desc = capitalizeFirstLetter(nextPatch.desc);
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...nextPatch } : x)));
  };

  const pickImage = (id: string, file: File | null) => {
    setMessage(null);
    if (!file) {
      setNewFiles((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setPreviews((prev) => {
        const existing = prev[id];
        if (!existing) return prev;
        if (existing.startsWith("blob:")) URL.revokeObjectURL(existing);
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    if (!file.type.startsWith("image/")) return;
    const preview = URL.createObjectURL(file);
    setNewFiles((prev) => ({ ...prev, [id]: file }));
    setPreviews((prev) => {
      const existing = prev[id];
      if (existing?.startsWith("blob:")) URL.revokeObjectURL(existing);
      return { ...prev, [id]: preview };
    });
  };

  const dirty = useMemo(() => {
    if (Object.keys(newFiles).length > 0) return true;
    if (fit !== serverFit) return true;
    const a = JSON.stringify(serverItems);
    const b = JSON.stringify(items);
    return a !== b;
  }, [fit, items, newFiles, serverFit, serverItems]);

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();

      const nextItems: NewsItem[] = items.map((n) => ({
        ...n,
        tag: n.tag.trim(),
        date: n.date.trim(),
        title: n.title.trim(),
        desc: n.desc.trim(),
        href: "/news",
        image: n.image.trim(),
        path: n.path.trim() || `${NEWS_FOLDER}/${n.id}`,
      }));

      const serverPaths = new Set(serverItems.map((n) => n.path).filter((p) => p.trim().length > 0));
      const keepPaths = new Set(
        nextItems
          .filter((n) => n.title.trim().length > 0 && (n.image.trim().length > 0 || Boolean(newFiles[n.id])))
          .map((n) => n.path)
          .filter((p) => p.trim().length > 0),
      );
      const toRemove = Array.from(serverPaths).filter((p) => !keepPaths.has(p));
      if (toRemove.length > 0) {
        await supabase.storage.from(STORAGE_BUCKET).remove(toRemove);
      }

      for (let i = 0; i < nextItems.length; i += 1) {
        const item = nextItems[i];
        const file = newFiles[item.id];
        if (!file) continue;
        if (item.title.trim().length === 0) continue;
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(item.path, file, {
          upsert: true,
          contentType: file.type,
        });
        if (uploadError) {
          setMessage({ type: "error", text: uploadError.message });
          return;
        }
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(item.path);
        nextItems[i] = { ...item, image: data.publicUrl };
      }

      const cleaned = nextItems.filter((n) => n.title.trim().length > 0 && n.image.trim().length > 0);

      const { error: settingsError } = await supabase.from(SITE_SETTINGS_TABLE).upsert(
        {
          key: HOME_NEWS_KEY,
          value: {
            fit,
            version: Date.now(),
          },
        },
        { onConflict: "key" },
      );

      if (settingsError) throw new Error(settingsError.message);

      const upsertRows = cleaned.map((n) => ({
        id: n.id,
        tag: n.tag,
        date: n.date,
        title: n.title,
        excerpt: n.desc,
        href: n.href,
        image: n.image,
      }));

      if (upsertRows.length > 0) {
        const { error: upsertError } = await supabase.from("news").upsert(upsertRows);
        if (upsertError) throw new Error(upsertError.message);
      }

      const activeIds = upsertRows.map((r) => r.id);
      if (activeIds.length > 0) {
        // Use properly quoted UUID syntax for .not("id", "in", ...)
        const { error: deleteError } = await supabase
          .from("news")
          .delete()
          .not("id", "in", `(${activeIds.map(id => `"${id}"`).join(",")})`);
        if (deleteError) {
          console.warn("News cleanup delete error:", deleteError.message);
        }
      } else {
        // Wipe everything if no announcements remain
        const { error: deleteAllError } = await supabase.from("news").delete().gte("id", "");
        if (deleteAllError) console.warn("News wipe error:", deleteAllError.message);
      }

      Object.values(previews).forEach((p) => {
        if (p.startsWith("blob:")) URL.revokeObjectURL(p);
      });
      setPreviews({});
      setNewFiles({});
      setDisplayVersion(Date.now());

      const normalized = normalize({ items: cleaned });
      setServerItems(normalized);
      setItems(normalized);
      setServerFit(fit);
      setMessage({ type: "success", text: "News & Announcements updated" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save News section" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="font-bold text-lg">News & Announcements</div>
          <div className="text-sm text-gray-500">Add and reorder announcements shown on the Home slider and /news.</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={addItem}
            disabled={loading || saving}
            className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            Add Announcement
          </button>
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
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="space-y-4">
        {paginatedItems.map((it, idx) => {
          const globalIdx = (page - 1) * itemsPerPage + idx;
          const preview = previews[it.id];
          const src =
            preview || (it.image ? `${it.image.split("?")[0]}?v=${encodeURIComponent(String(displayVersion))}` : "");
          return (
            <div key={it.id} className="border rounded-2xl p-4 bg-white">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="font-semibold">{it.title.trim() || "New Announcement"}</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveItem(it.id, -1)}
                    disabled={saving || loading || globalIdx === 0}
                    className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(it.id, 1)}
                    disabled={saving || loading || globalIdx === items.length - 1}
                    className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    disabled={saving || loading}
                    className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-[260px_1fr] gap-4">
                <div className="border rounded-xl overflow-hidden bg-gray-50">
                  <div className="relative h-44">
                    {src ? (
                      fit === "contain" ? (
                        <>
                          <Image
                            src={src}
                            alt=""
                            fill
                            sizes="260px"
                            className="object-cover blur-2xl scale-110 opacity-40"
                          />
                          <Image
                            src={src}
                            alt={it.title || "Announcement image"}
                            fill
                            sizes="260px"
                            className="object-contain"
                          />
                        </>
                      ) : (
                        <Image
                          src={src}
                          alt={it.title || "Announcement image"}
                          fill
                          sizes="260px"
                          className="object-cover"
                        />
                      )
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-3 bg-white border-t">
                    <SingleImageDropzone disabled={saving || loading} onPick={(file) => pickImage(it.id, file)} />
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-gray-500 truncate">
                        {preview ? "Preview (not saved)" : it.image ? "Saved" : "Empty"}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          pickImage(it.id, null);
                          updateItem(it.id, { image: "" });
                        }}
                        disabled={saving || loading || (!preview && !it.image)}
                        className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-3">
                  <div className="space-y-1 lg:col-span-2">
                    <label htmlFor={`admin-news-${it.id}-title`} className="block text-xs font-semibold text-gray-700">
                      Title
                    </label>
                    <input
                      id={`admin-news-${it.id}-title`}
                      value={it.title}
                      onChange={(e) => updateItem(it.id, { title: e.target.value })}
                      placeholder="Title"
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                      disabled={saving || loading}
                    />
                  </div>
                  <div className="space-y-1 lg:col-span-2">
                    <label htmlFor={`admin-news-${it.id}-desc`} className="block text-xs font-semibold text-gray-700">
                      Description
                    </label>
                    <textarea
                      id={`admin-news-${it.id}-desc`}
                      value={it.desc}
                      onChange={(e) => updateItem(it.id, { desc: e.target.value })}
                      placeholder="Description"
                      rows={4}
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                      disabled={saving || loading}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={`admin-news-${it.id}-tag`} className="block text-xs font-semibold text-gray-700">
                      Tag
                    </label>
                    <input
                      id={`admin-news-${it.id}-tag`}
                      value={it.tag}
                      onChange={(e) => updateItem(it.id, { tag: e.target.value })}
                      placeholder="Tag (e.g., Announcement)"
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                      disabled={saving || loading}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={`admin-news-${it.id}-date`} className="block text-xs font-semibold text-gray-700">
                      Date
                    </label>
                    <input
                      id={`admin-news-${it.id}-date`}
                      type="date"
                      value={it.date}
                      onChange={(e) => updateItem(it.id, { date: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                      disabled={saving || loading}
                    />
                  </div>
                  <div className="space-y-1 lg:col-span-2">
                    <label htmlFor={`admin-news-${it.id}-href`} className="block text-xs font-semibold text-gray-700">
                      Link (read-only)
                    </label>
                    <input
                      id={`admin-news-${it.id}-href`}
                      value="/news"
                      readOnly
                      placeholder="/news"
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                      disabled={saving || loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 ? <div className="text-sm text-gray-500">No announcements yet.</div> : (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={items.length}
            itemName="announcements"
          />
        )}
      </div>
    </div>
  );
}

function LifeEditor() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useAutoMessage();
  const emptyItems = useMemo((): LifeItem[] => Array.from({ length: 6 }, () => ({ label: "", url: "" })), []);
  const [serverItems, setServerItems] = useState<LifeItem[]>(emptyItems);
  const [items, setItems] = useState<LifeItem[]>(emptyItems);
  const [files, setFiles] = useState<(File | null)[]>(Array.from({ length: 6 }, () => null));
  const [previews, setPreviews] = useState<(string | null)[]>(Array.from({ length: 6 }, () => null));
  const [fit, setFit] = useState<LifeFit>("cover");
  const [serverFit, setServerFit] = useState<LifeFit>("cover");
  const [displayVersion, setDisplayVersion] = useState(() => Date.now());

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
      });
    };
  }, [previews]);

  const normalizeSix = useCallback(
    (raw: unknown): { items: LifeItem[]; fit: LifeFit } => {
      const loadedFit =
        typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";
      const candidate = Array.isArray(raw)
        ? raw
        : typeof raw === "object" && raw && Array.isArray((raw as { items?: unknown }).items)
          ? ((raw as { items: unknown[] }).items as unknown[])
          : [];

      const mapped = candidate.slice(0, 6).map((row) => {
        const obj = typeof row === "object" && row ? (row as Record<string, unknown>) : null;
        const url =
          typeof obj?.url === "string"
            ? String(obj.url).trim().split("?")[0]
            : typeof obj?.image === "string"
              ? String(obj.image).trim().split("?")[0]
              : "";
        const label =
          typeof obj?.label === "string"
            ? String(obj.label).trim()
            : typeof obj?.title === "string"
              ? String(obj.title).trim()
              : "";
        return { url, label };
      });

      return { fit: loadedFit, items: Array.from({ length: 6 }, (_, i) => mapped[i] ?? emptyItems[i]) };
    },
    [emptyItems],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from(SITE_SETTINGS_TABLE)
        .select("value")
        .eq("key", HOME_LIFE_KEY)
        .maybeSingle();

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      const raw = data?.value as unknown;
      const normalized = normalizeSix(raw);
      setServerItems(normalized.items);
      setItems(normalized.items);
      setFit(normalized.fit);
      setServerFit(normalized.fit);
      setFiles(Array.from({ length: 6 }, () => null));
      setPreviews((prev) => {
        prev.forEach((p) => {
          if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return Array.from({ length: 6 }, () => null);
      });
      setDisplayVersion(Date.now());
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load Life section" });
    } finally {
      setLoading(false);
    }
  }, [normalizeSix]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty =
    files.some(Boolean) ||
    fit !== serverFit ||
    items.some((it, i) => it.url !== serverItems[i]?.url || it.label !== serverItems[i]?.label);

  const updateItem = (index: number, patch: Partial<LifeItem>) => {
    const nextPatch: Partial<LifeItem> = { ...patch };
    if (typeof nextPatch.label === "string") nextPatch.label = capitalizeFirstLetter(nextPatch.label);
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...nextPatch };
      return next;
    });
  };

  const onPickFile = (index: number, file: File | null) => {
    setMessage(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });

    setPreviews((prev) => {
      const next = [...prev];
      if (next[index]?.startsWith("blob:")) URL.revokeObjectURL(next[index] ?? "");
      next[index] = URL.createObjectURL(file);
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

    updateItem(index, { url: "" });
  };

  const save = async () => {
    if (!dirty) return;

    setSaving(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const nextItems = items.map((it) => ({ url: it.url.trim(), label: it.label.trim() }));
      const { data: folderItems } = await supabase.storage.from(STORAGE_BUCKET).list(LIFE_FOLDER, { limit: 200 });

      for (let i = 0; i < 6; i += 1) {
        const file = files[i];
        const isRemoving = nextItems[i].url.length === 0 && serverItems[i]?.url?.trim().length > 0;
        const shouldTouchStorage = Boolean(file) || isRemoving;
        if (!shouldTouchStorage) continue;

        const base = `item-${i + 1}`;
        const toDelete =
          folderItems
            ?.filter((item) => item.name === base || item.name.startsWith(`${base}.`))
            .map((item) => `${LIFE_FOLDER}/${item.name}`) ?? [];
        if (toDelete.length > 0) {
          await supabase.storage.from(STORAGE_BUCKET).remove(toDelete);
        }
      }

      for (let i = 0; i < 6; i += 1) {
        const file = files[i];
        if (!file) continue;

        const path = `${LIFE_FOLDER}/item-${i + 1}`;
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
          upsert: true,
          contentType: file.type,
        });
        if (uploadError) {
          setMessage({ type: "error", text: uploadError.message });
          return;
        }

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        nextItems[i] = { ...nextItems[i], url: data.publicUrl };
      }

      const payloadItems = nextItems.filter((it) => it.url.trim().length > 0);

      const { error } = await supabase
        .from(SITE_SETTINGS_TABLE)
        .upsert(
          { key: HOME_LIFE_KEY, value: { items: payloadItems, fit, version: Date.now() } },
          { onConflict: "key" },
        );

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      const normalized = normalizeSix({ items: payloadItems, fit });
      setServerItems(normalized.items);
      setItems(normalized.items);
      setServerFit(fit);
      setFiles(Array.from({ length: 6 }, () => null));
      setPreviews((prev) => {
        prev.forEach((p) => {
          if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return Array.from({ length: 6 }, () => null);
      });
      setDisplayVersion(Date.now());
      setMessage({ type: "success", text: "Life section updated" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save Life section" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="font-bold text-lg">Life at Growwell School</div>
          <div className="text-sm text-gray-500">Upload images for the 3D carousel (up to 6).</div>
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
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it, i) => {
          const base = previews[i] || it.url;
          const src = base ? (base.startsWith("blob:") ? base : `${base.split("?")[0]}?v=${displayVersion}`) : "";
          const hasAny = Boolean(files[i] || previews[i] || it.url);

          return (
            <div key={i} className="border rounded-2xl overflow-hidden">
              <div className="relative aspect-[16/10] bg-gray-100">
                {src ? (
                  fit === "contain" ? (
                    <>
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover scale-110 blur-2xl"
                        aria-hidden
                        unoptimized={src.startsWith("blob:")}
                      />
                      <Image
                        src={src}
                        alt={it.label || `Life ${i + 1}`}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-contain"
                        unoptimized={src.startsWith("blob:")}
                      />
                    </>
                  ) : (
                    <Image
                      src={src}
                      alt={it.label || `Life ${i + 1}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                      unoptimized={src.startsWith("blob:")}
                    />
                  )
                ) : null}
              </div>

              <div className="p-4 space-y-3">
                <div className="font-semibold">Item {i + 1}</div>

                <label className="block border-2 border-dashed rounded-xl px-4 py-4 text-sm cursor-pointer select-none border-gray-200 hover:border-school-green/60">
                  <div className="font-semibold text-gray-800">Click to upload image</div>
                  <div className="text-xs text-gray-500 mt-1">Required to show this item</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickFile(i, e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-gray-500 truncate">
                    {previews[i] ? "Preview" : it.url ? "Saved" : "Empty"}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    disabled={!hasAny || saving || loading}
                    className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-1">
                  <label htmlFor={`admin-life-${i}-label`} className="block text-xs font-semibold text-gray-700">
                    Label
                  </label>
                  <input
                    id={`admin-life-${i}-label`}
                    value={it.label}
                    onChange={(e) => updateItem(i, { label: e.target.value })}
                    placeholder="Label"
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type GalleryFit = "cover" | "contain";
type GalleryImage = { id: string; url: string; path: string; title: string; desc: string; w?: number; h?: number };
type GallerySection = {
  id: string;
  title: string;
  subtitle: string;
  details: string;
  fit: GalleryFit;
  images: GalleryImage[];
};

function GalleryEditor() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useAutoMessage();

  const [serverSections, setServerSections] = useState<GallerySection[]>([]);
  const [sections, setSections] = useState<GallerySection[]>([]);

  const [newFiles, setNewFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [displayVersion, setDisplayVersion] = useState(() => Date.now());

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(sections.length / itemsPerPage);
  const paginatedSections = sections.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Reset page when sections change significantly
  useEffect(() => {
    if (page > Math.ceil(sections.length / itemsPerPage)) {
      setPage(Math.max(1, Math.ceil(sections.length / itemsPerPage)));
    }
  }, [sections.length, page]);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((p) => {
        if (p.startsWith("blob:")) URL.revokeObjectURL(p);
      });
    };
  }, [previews]);

  const makeId = () => {
    const cryptoObj = globalThis.crypto as { randomUUID?: () => string } | undefined;
    if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const readImageSize = async (file: File): Promise<{ w: number; h: number } | null> => {
    try {
      if ("createImageBitmap" in globalThis) {
        const bitmap = await createImageBitmap(file);
        const w = bitmap.width;
        const h = bitmap.height;
        bitmap.close();
        if (w > 0 && h > 0) return { w, h };
      }
    } catch {
      return null;
    }

    try {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      const result = await new Promise<{ w: number; h: number } | null>((resolve) => {
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve(null);
        img.src = url;
      });
      URL.revokeObjectURL(url);
      if (result && result.w > 0 && result.h > 0) return result;
      return null;
    } catch {
      return null;
    }
  };

  const normalize = useCallback((raw: unknown): GallerySection[] => {
    const candidate =
      typeof raw === "object" && raw && Array.isArray((raw as { sections?: unknown }).sections)
        ? ((raw as { sections: unknown[] }).sections as unknown[])
        : [];

    const next = candidate
      .map((s) => {
        const obj = typeof s === "object" && s ? (s as Record<string, unknown>) : null;
        const id = typeof obj?.id === "string" && obj.id.trim().length > 0 ? obj.id.trim() : makeId();
        const title =
          typeof obj?.label === "string" ? String(obj.label) : typeof obj?.title === "string" ? obj.title : "";
        const subtitle = typeof obj?.subtitle === "string" ? obj.subtitle : "";
        const details = typeof obj?.details === "string" ? obj.details : "";
        const fit: GalleryFit = obj?.fit === "contain" ? "contain" : "cover";

        const imagesRaw = Array.isArray(obj?.items)
          ? (obj?.items as unknown[])
          : Array.isArray(obj?.images)
            ? (obj?.images as unknown[])
            : [];
        const images = imagesRaw
          .map((img) => {
            const io = typeof img === "object" && img ? (img as Record<string, unknown>) : null;
            const iid = typeof io?.id === "string" && io.id.trim().length > 0 ? io.id.trim() : makeId();
            const url =
              typeof io?.src === "string"
                ? String(io.src).trim()
                : typeof io?.url === "string"
                  ? io.url.trim()
                  : typeof io?.image === "string"
                    ? String(io.image).trim()
                    : "";
            const path =
              typeof io?.path === "string" && io.path.trim().length > 0
                ? io.path.trim()
                : `${GALLERY_FOLDER}/${id}/${iid}`;
            const imageTitle = typeof io?.title === "string" ? String(io.title) : "";
            const imageDesc =
              typeof io?.desc === "string"
                ? String(io.desc)
                : typeof io?.details === "string"
                  ? String(io.details)
                  : "";
            const w = typeof io?.w === "number" ? io.w : undefined;
            const h = typeof io?.h === "number" ? io.h : undefined;
            return { id: iid, url, path, title: imageTitle, desc: imageDesc, w, h };
          })
          .filter((img) => img.url.length > 0);

        return { id, title, subtitle, details, fit, images };
      })
      .filter(
        (s) =>
          s.images.length > 0 ||
          s.title.trim().length > 0 ||
          s.subtitle.trim().length > 0 ||
          s.details.trim().length > 0,
      );

    return next;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const [settingsRes, galleriesRes] = await Promise.all([
        supabase.from(SITE_SETTINGS_TABLE).select("value").eq("key", GALLERY_PAGE_KEY).maybeSingle(),
        supabase.from("galleries").select("*").order("created_at", { ascending: false })
      ]);

      if (settingsRes.error) throw new Error(settingsRes.error.message);
      if (galleriesRes.error) throw new Error(galleriesRes.error.message);

      const raw = settingsRes.data?.value as unknown;
      const dbImages = galleriesRes.data || [];

      // Build candidate sections from site_settings first
      let candidateSections: any[] = [];
      if (typeof raw === "object" && raw && Array.isArray((raw as any).sections)) {
        candidateSections = (raw as any).sections;
      }

      // Also discover any categories that exist in galleries but not in site_settings
      const knownCatIds = new Set(candidateSections.map((s: any) => s.id));
      const extraCatIds = Array.from(
        new Set(dbImages.map((img: any) => img.cat as string).filter((c: string) => c && !knownCatIds.has(c)))
      );
      for (const catId of extraCatIds) {
        candidateSections.push({ id: catId, label: catId, fit: "cover" });
      }

      // Merge images from galleries table into their sections
      const mergedSections = candidateSections.map((s: any) => {
        const sectionId = s.id;
        const sectionImages = dbImages
          .filter((img: any) => img.cat === sectionId)
          .map((img: any) => ({
            id: img.id,
            src: img.src,
            url: img.src,
            title: img.title || "",
            desc: img.description || "",
            path: `${GALLERY_FOLDER}/${sectionId}/${img.id}`,
          }));
        return { ...s, items: sectionImages };
      });

      const next = normalize({ sections: mergedSections });
      setServerSections(next);
      setSections(next);

      setPreviews((prev) => {
        Object.values(prev).forEach((p) => {
          if (p.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return {};
      });
      setNewFiles({});
      setDisplayVersion(Date.now());
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load gallery page" });
    } finally {
      setLoading(false);
    }
  }, [normalize]);

  useEffect(() => {
    load();
  }, [load]);

  const updateSection = (sectionId: string, patch: Partial<GallerySection>) => {
    const nextPatch: Partial<GallerySection> = { ...patch };
    if (typeof nextPatch.title === "string") nextPatch.title = capitalizeFirstLetter(nextPatch.title);
    if (typeof nextPatch.subtitle === "string") nextPatch.subtitle = capitalizeFirstLetter(nextPatch.subtitle);
    if (typeof nextPatch.details === "string") nextPatch.details = capitalizeFirstLetter(nextPatch.details);
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, ...nextPatch } : s)));
  };

  const removeSection = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const addSection = () => {
    const id = makeId();
    setSections((prev) => [{ id, title: "", subtitle: "", details: "", fit: "cover", images: [] }, ...prev]);
  };

  const addImages = (sectionId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const entries: { img: GalleryImage; file: File; preview: string; size: { w: number; h: number } | null }[] = [];
    for (let i = 0; i < files.length; i += 1) {
      const file = files.item(i);
      if (!file) continue;
      if (!file.type.startsWith("image/")) continue;
      const imageId = makeId();
      const path = `${GALLERY_FOLDER}/${sectionId}/${imageId}`;
      const preview = URL.createObjectURL(file);
      entries.push({ img: { id: imageId, url: "", path, title: "", desc: "" }, file, preview, size: null });
    }

    if (entries.length === 0) return;

    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, images: [...s.images, ...entries.map((e) => e.img)] } : s)),
    );

    setNewFiles((prev) => {
      const next = { ...prev };
      entries.forEach((e) => {
        next[e.img.id] = e.file;
      });
      return next;
    });

    setPreviews((prev) => {
      const next = { ...prev };
      entries.forEach((e) => {
        next[e.img.id] = e.preview;
      });
      return next;
    });

    Promise.all(entries.map((e) => readImageSize(e.file))).then((sizes) => {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sectionId) return s;
          const nextImages = s.images.map((img) => {
            const idx = entries.findIndex((e) => e.img.id === img.id);
            if (idx < 0) return img;
            const size = sizes[idx];
            return size ? { ...img, w: size.w, h: size.h } : img;
          });
          return { ...s, images: nextImages };
        }),
      );
    });
  };

  const removeImage = (sectionId: string, imageId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, images: s.images.filter((img) => img.id !== imageId) } : s)),
    );

    setNewFiles((prev) => {
      if (!prev[imageId]) return prev;
      const next = { ...prev };
      delete next[imageId];
      return next;
    });

    setPreviews((prev) => {
      const url = prev[imageId];
      if (!url) return prev;
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      const next = { ...prev };
      delete next[imageId];
      return next;
    });
  };

  const updateImage = (sectionId: string, imageId: string, patch: Partial<GalleryImage>) => {
    const nextPatch: Partial<GalleryImage> = { ...patch };
    if (typeof nextPatch.title === "string") nextPatch.title = capitalizeFirstLetter(nextPatch.title);
    if (typeof nextPatch.desc === "string") nextPatch.desc = capitalizeFirstLetter(nextPatch.desc);
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, images: s.images.map((img) => (img.id === imageId ? { ...img, ...nextPatch } : img)) }
          : s,
      ),
    );
  };

  const [savingSections, setSavingSections] = useState<Record<string, boolean>>({});

  const dirty = useMemo(() => {
    if (Object.keys(newFiles).length > 0) return true;
    const a = JSON.stringify(serverSections);
    const b = JSON.stringify(sections);
    return a !== b;
  }, [newFiles, serverSections, sections]);

  const isSectionDirty = useCallback((sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const serverSection = serverSections.find(s => s.id === sectionId);
    if (!section) return false;
    
    // Check if any new files belong to this section
    const hasNewFiles = section.images.some(img => !!newFiles[img.id]);
    if (hasNewFiles) return true;

    if (!serverSection) return true; // New section
    return JSON.stringify(section) !== JSON.stringify(serverSection);
  }, [sections, serverSections, newFiles]);

  const saveSection = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    setSavingSections(prev => ({ ...prev, [sectionId]: true }));
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();

      // 1. Storage Operations for this section
      const serverSection = serverSections.find(s => s.id === sectionId);
      const serverPaths = new Set(serverSection?.images.map(img => img.path).filter(p => !!p) || []);
      const nextPaths = new Set(section.images.map(img => img.path).filter(p => !!p));
      
      const toRemove = Array.from(serverPaths).filter(p => !nextPaths.has(p));
      if (toRemove.length > 0) {
        await supabase.storage.from(STORAGE_BUCKET).remove(toRemove);
      }

      const updatedSection = { ...section };
      updatedSection.images = [...section.images];

      // Upload new files for this section
      for (let i = 0; i < updatedSection.images.length; i++) {
        const img = updatedSection.images[i];
        const file = newFiles[img.id];
        if (!file) continue;

        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(img.path, file, {
          upsert: true,
          contentType: file.type
        });
        if (uploadError) throw new Error(`Upload failed for ${img.title || 'image'}: ${uploadError.message}`);

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(img.path);
        updatedSection.images[i] = { ...img, url: data.publicUrl };
      }

      // 2. Update site_settings (metadata)
      // We must fetch current settings to merge
      const { data: currentSettings } = await supabase
        .from(SITE_SETTINGS_TABLE)
        .select("value")
        .eq("key", GALLERY_PAGE_KEY)
        .maybeSingle();
      
      let allSectionsMetadata: any[] = [];
      if (currentSettings?.value && Array.isArray((currentSettings.value as any).sections)) {
        allSectionsMetadata = (currentSettings.value as any).sections;
      }

      const meta = {
        id: updatedSection.id,
        label: updatedSection.title,
        subtitle: updatedSection.subtitle,
        details: updatedSection.details,
        fit: updatedSection.fit
      };

      const existingIdx = allSectionsMetadata.findIndex(m => m.id === sectionId);
      if (existingIdx >= 0) allSectionsMetadata[existingIdx] = meta;
      else allSectionsMetadata.push(meta);

      const { error: settingsError } = await supabase
        .from(SITE_SETTINGS_TABLE)
        .upsert({
          key: GALLERY_PAGE_KEY,
          value: { sections: allSectionsMetadata, version: Date.now() }
        }, { onConflict: "key" });

      if (settingsError) throw new Error(settingsError.message);

      // 3. Update galleries table (relational rows)
      const upsertRows = updatedSection.images
        .filter(img => img.url.length > 0)
        .map(img => ({
          id: img.id,
          src: img.url,
          cat: updatedSection.id,
          title: img.title || "",
          description: img.desc || "",
          fit: updatedSection.fit
        }));

      if (upsertRows.length > 0) {
        const { error: upsertError } = await supabase
          .from("galleries")
          .upsert(upsertRows, { onConflict: "id" });
        if (upsertError) throw new Error(upsertError.message);
      }

      // Delete rows for this category that are no longer present
      const activeIds = upsertRows.map(r => r.id);
      let deleteQuery = supabase.from("galleries").delete().eq("cat", sectionId);
      if (activeIds.length > 0) {
        deleteQuery = deleteQuery.not("id", "in", `(${activeIds.map(id => `"${id}"`).join(",")})`);
      }
      const { error: deleteError } = await deleteQuery;
      if (deleteError) console.warn("Section images cleanup error:", deleteError.message);

      // 4. Cleanup local state for this section
      const idsToRemoveFromNewFiles = section.images.map(img => img.id);
      setNewFiles(prev => {
        const next = { ...prev };
        idsToRemoveFromNewFiles.forEach(id => {
          if (next[id]) {
            const preview = previews[id];
            if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
            delete next[id];
          }
        });
        return next;
      });

      setPreviews(prev => {
        const next = { ...prev };
        idsToRemoveFromNewFiles.forEach(id => delete next[id]);
        return next;
      });

      // Update server state for this section
      setServerSections(prev => {
        const next = [...prev];
        const idx = next.findIndex(s => s.id === sectionId);
        if (idx >= 0) next[idx] = updatedSection;
        else next.push(updatedSection);
        return next;
      });

      // Update UI state with final URLs
      setSections(prev => prev.map(s => s.id === sectionId ? updatedSection : s));
      
      setDisplayVersion(Date.now());
      setMessage({ type: "success", text: `Section "${updatedSection.title || updatedSection.id}" saved successfully` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save section" });
    } finally {
      setSavingSections(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  const saveAll = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();

      // Find sections that were removed (exist on server but not in local state)
      const currentSectionIds = new Set(sections.map(s => s.id));
      const removedSections = serverSections.filter(s => !currentSectionIds.has(s.id));

      // Delete removed sections from storage and database
      for (const removedSection of removedSections) {
        // Delete all images from storage
        const pathsToRemove = removedSection.images.map(img => img.path).filter(p => !!p);
        if (pathsToRemove.length > 0) {
          await supabase.storage.from(STORAGE_BUCKET).remove(pathsToRemove);
        }

        // Delete all rows from galleries table for this category
        const { error: deleteError } = await supabase
          .from("galleries")
          .delete()
          .eq("cat", removedSection.id);
        if (deleteError) console.warn("Failed to delete gallery rows for removed section:", deleteError.message);
      }

      // Update site_settings to remove deleted sections
      if (removedSections.length > 0) {
        const { data: currentSettings } = await supabase
          .from(SITE_SETTINGS_TABLE)
          .select("value")
          .eq("key", GALLERY_PAGE_KEY)
          .maybeSingle();

        let allSectionsMetadata: any[] = [];
        if (currentSettings?.value && Array.isArray((currentSettings.value as any).sections)) {
          allSectionsMetadata = (currentSettings.value as any).sections;
        }

        // Filter out removed sections
        const remainingMetadata = allSectionsMetadata.filter(
          (m: any) => currentSectionIds.has(m.id)
        );

        const { error: settingsError } = await supabase
          .from(SITE_SETTINGS_TABLE)
          .upsert({
            key: GALLERY_PAGE_KEY,
            value: { sections: remainingMetadata, version: Date.now() }
          }, { onConflict: "key" });

        if (settingsError) throw new Error(settingsError.message);
      }

      // Update server state
      setServerSections(sections);

      // Clear new files and previews for remaining sections
      setNewFiles({});
      setPreviews((prev) => {
        Object.values(prev).forEach((p) => {
          if (p.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return {};
      });

      setDisplayVersion(Date.now());
      setMessage({ type: "success", text: "All changes saved successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save changes" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="font-bold text-lg">Gallery Page</div>
          <div className="text-sm text-gray-500">Create sections and add unlimited images.</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={addSection}
            disabled={loading || Object.values(savingSections).some(Boolean)}
            className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            Add Section
          </button>
          <button
            onClick={load}
            disabled={loading || Object.values(savingSections).some(Boolean)}
            className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Reload"}
          </button>
          {dirty && (
            <button
              onClick={saveAll}
              disabled={loading || Object.values(savingSections).some(Boolean)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-60 font-bold shadow-sm"
            >
              Save All
            </button>
          )}
          {dirty && (
             <div className="text-[10px] text-orange-500 font-bold uppercase animate-pulse">Unsaved Changes</div>
          )}
        </div>
      </div>

      {message ? (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="space-y-6">
        {paginatedSections.map((section) => (
          <div key={section.id} className="border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="font-semibold">{section.title.trim() || "Untitled Section"}</div>
              <div className="flex items-center gap-2">
                {isSectionDirty(section.id) && (
                  <button
                    onClick={() => saveSection(section.id)}
                    disabled={savingSections[section.id] || loading}
                    className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60 font-bold shadow-sm"
                  >
                    {savingSections[section.id] ? "Saving..." : "Save Section"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeSection(section.id)}
                  disabled={savingSections[section.id] || loading}
                  className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                >
                  Remove Section
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <label
                  htmlFor={`admin-gallery-section-${section.id}-title`}
                  className="block text-xs font-semibold text-gray-700"
                >
                  Title
                </label>
                <input
                  id={`admin-gallery-section-${section.id}-title`}
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  placeholder="Title"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                  disabled={saving || loading}
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor={`admin-gallery-section-${section.id}-subtitle`}
                  className="block text-xs font-semibold text-gray-700"
                >
                  Subtitle
                </label>
                <input
                  id={`admin-gallery-section-${section.id}-subtitle`}
                  value={section.subtitle}
                  onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
                  placeholder="Subtitle"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                  disabled={saving || loading}
                />
              </div>
              <div className="space-y-1 lg:col-span-2">
                <label
                  htmlFor={`admin-gallery-section-${section.id}-details`}
                  className="block text-xs font-semibold text-gray-700"
                >
                  Details
                </label>
                <textarea
                  id={`admin-gallery-section-${section.id}-details`}
                  value={section.details}
                  onChange={(e) => updateSection(section.id, { details: e.target.value })}
                  placeholder="Details"
                  rows={4}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                  disabled={saving || loading}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="text-sm font-semibold text-gray-700">Image Fit</div>
              <div className="flex items-center rounded-xl border overflow-hidden">
                <button
                  type="button"
                  onClick={() => updateSection(section.id, { fit: "cover" })}
                  disabled={saving || loading}
                  className={`px-4 py-2 text-sm ${section.fit === "cover" ? "bg-school-dark text-white" : "bg-white text-gray-700 hover:bg-gray-50"} disabled:opacity-60`}
                >
                  Cover
                </button>
                <button
                  type="button"
                  onClick={() => updateSection(section.id, { fit: "contain" })}
                  disabled={saving || loading}
                  className={`px-4 py-2 text-sm ${section.fit === "contain" ? "bg-school-dark text-white" : "bg-white text-gray-700 hover:bg-gray-50"} disabled:opacity-60`}
                >
                  Contain
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex-1">
                <MultiImageDropzone
                  disabled={saving || loading}
                  onPickFiles={(files) => addImages(section.id, files)}
                />
              </div>
              <div className="text-xs text-gray-500">{section.images.length} images</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {section.images.map((img) => {
                const base = previews[img.id] || img.url;
                const src = base ? (base.startsWith("blob:") ? base : `${base.split("?")[0]}?v=${displayVersion}`) : "";
                return (
                  <div key={img.id} className="border rounded-xl overflow-hidden">
                    <div className="relative aspect-[16/10] bg-gray-100">
                      {src ? (
                        section.fit === "contain" ? (
                          <>
                            <Image
                              src={src}
                              alt=""
                              fill
                              sizes="(min-width: 1024px) 25vw, 50vw"
                              className="object-cover scale-110 blur-2xl"
                              aria-hidden
                              unoptimized={src.startsWith("blob:")}
                            />
                            <Image
                              src={src}
                              alt="Gallery image"
                              fill
                              sizes="(min-width: 1024px) 25vw, 50vw"
                              className="object-contain"
                              unoptimized={src.startsWith("blob:")}
                            />
                          </>
                        ) : (
                          <Image
                            src={src}
                            alt="Gallery image"
                            fill
                            sizes="(min-width: 1024px) 25vw, 50vw"
                            className="object-cover"
                            unoptimized={src.startsWith("blob:")}
                          />
                        )
                      ) : null}
                    </div>
                    <div className="p-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-gray-500 truncate">
                          {previews[img.id] ? "Preview" : img.url ? "Saved" : "New"}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(section.id, img.id)}
                          disabled={savingSections[section.id] || loading}
                          className="text-[10px] border px-2 py-1 rounded hover:bg-gray-50 disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor={`admin-gallery-img-${img.id}-title`}
                          className="block text-[10px] font-semibold text-gray-600"
                        >
                          Title
                        </label>
                        <input
                          id={`admin-gallery-img-${img.id}-title`}
                          value={img.title}
                          onChange={(e) => updateImage(section.id, img.id, { title: e.target.value })}
                          placeholder="Title"
                          className="w-full border rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-school-green/40"
                          disabled={savingSections[section.id] || loading}
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor={`admin-gallery-img-${img.id}-details`}
                          className="block text-[10px] font-semibold text-gray-600"
                        >
                          Details
                        </label>
                        <textarea
                          id={`admin-gallery-img-${img.id}-details`}
                          value={img.desc}
                          onChange={(e) => updateImage(section.id, img.id, { desc: e.target.value })}
                          placeholder="Details"
                          rows={2}
                          className="w-full border rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-school-green/40"
                          disabled={saving || loading}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={sections.length}
          itemName="sections"
        />
      </div>
    </div>
  );
}

type EventsCalendarItem = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  img: string;
  path: string;
  cat: string;
  catColor: string;
  desc: string;
  highlight: boolean;
};

type EventsMomentItem = { id: string; img: string; path: string; title: string; year: string; desc: string };
type EventsFit = "cover" | "contain";

function EventsEditor() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useAutoMessage();

  const [serverCalendar, setServerCalendar] = useState<EventsCalendarItem[]>([]);
  const [serverMoments, setServerMoments] = useState<EventsMomentItem[]>([]);
  const [calendar, setCalendar] = useState<EventsCalendarItem[]>([]);
  const [moments, setMoments] = useState<EventsMomentItem[]>([]);
  const [fit, setFit] = useState<EventsFit>("cover");
  const [serverFit, setServerFit] = useState<EventsFit>("cover");

  const [newFiles, setNewFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [displayVersion, setDisplayVersion] = useState(() => Date.now());

  // Pagination for calendar and moments tabs
  const [calendarPage, setCalendarPage] = useState(1);
  const [momentsPage, setMomentsPage] = useState(1);
  const itemsPerPage = 5;

  const calendarTotalPages = Math.ceil(calendar.length / itemsPerPage);
  const momentsTotalPages = Math.ceil(moments.length / itemsPerPage);
  const paginatedCalendar = calendar.slice((calendarPage - 1) * itemsPerPage, calendarPage * itemsPerPage);
  const paginatedMoments = moments.slice((momentsPage - 1) * itemsPerPage, momentsPage * itemsPerPage);

  useEffect(() => {
    if (calendarPage > Math.ceil(calendar.length / itemsPerPage)) {
      setCalendarPage(Math.max(1, Math.ceil(calendar.length / itemsPerPage)));
    }
  }, [calendar.length, calendarPage]);

  useEffect(() => {
    if (momentsPage > Math.ceil(moments.length / itemsPerPage)) {
      setMomentsPage(Math.max(1, Math.ceil(moments.length / itemsPerPage)));
    }
  }, [moments.length, momentsPage]);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((p) => {
        if (p.startsWith("blob:")) URL.revokeObjectURL(p);
      });
    };
  }, [previews]);

  const makeId = () => {
    const cryptoObj = globalThis.crypto as { randomUUID?: () => string } | undefined;
    if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const keyFor = (kind: "calendar" | "moments", id: string) => `${kind}:${id}`;

  const baseUrl = (value: unknown) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (trimmed.length === 0) return "";
    return trimmed.split("?")[0] ?? "";
  };

  const normalize = useCallback((raw: unknown): { calendar: EventsCalendarItem[]; moments: EventsMomentItem[] } => {
    const calendarRaw =
      typeof raw === "object" && raw && Array.isArray((raw as { calendar?: unknown }).calendar)
        ? ((raw as { calendar: unknown[] }).calendar as unknown[])
        : [];
    const momentsRaw =
      typeof raw === "object" && raw && Array.isArray((raw as { moments?: unknown }).moments)
        ? ((raw as { moments: unknown[] }).moments as unknown[])
        : [];

    const nextCalendar = calendarRaw.map((row) => {
      const obj = typeof row === "object" && row ? (row as Record<string, unknown>) : null;
      const id = typeof obj?.id === "string" && obj.id.trim().length > 0 ? obj.id.trim() : makeId();
      const title = typeof obj?.title === "string" ? obj.title : "";
      const date = typeof obj?.date === "string" ? obj.date : "";
      const startTime = typeof obj?.start_time === "string" ? obj.start_time : "";
      const endTime = typeof obj?.end_time === "string" ? obj.end_time : "";
      const venue = typeof obj?.venue === "string" ? obj.venue : "";
      const img = baseUrl(obj?.img);
      const path =
        typeof obj?.path === "string" && obj.path.trim().length > 0
          ? obj.path.trim()
          : `${EVENTS_FOLDER}/calendar/${id}`;
      const cat = typeof obj?.cat === "string" ? obj.cat : "";
      const catColor = typeof obj?.catColor === "string" ? obj.catColor : "bg-school-green";
      const desc = typeof obj?.desc === "string" ? obj.desc : "";
      const highlight = Boolean(obj?.highlight);
      return { id, title, date, startTime, endTime, venue, img, path, cat, catColor, desc, highlight } satisfies EventsCalendarItem;
    });

    const nextMoments = momentsRaw.map((row) => {
      const obj = typeof row === "object" && row ? (row as Record<string, unknown>) : null;
      const id = typeof obj?.id === "string" && obj.id.trim().length > 0 ? obj.id.trim() : makeId();
      const img = baseUrl(obj?.img);
      const path =
        typeof obj?.path === "string" && obj.path.trim().length > 0
          ? obj.path.trim()
          : `${EVENTS_FOLDER}/moments/${id}`;
      const title = typeof obj?.title === "string" ? obj.title : "";
      const year = typeof obj?.year === "string" ? obj.year : "";
      const desc = typeof obj?.desc === "string" ? obj.desc : "";
      return { id, img, path, title, year, desc } satisfies EventsMomentItem;
    });

    return { calendar: nextCalendar, moments: nextMoments };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const [settingsRes, eventsRes] = await Promise.all([
        supabase.from(SITE_SETTINGS_TABLE).select("value").eq("key", EVENTS_PAGE_KEY).maybeSingle(),
        supabase.from("events").select("*").order("created_at", { ascending: false })
      ]);

      if (settingsRes.error && settingsRes.error.code !== "PGRST116") throw new Error(settingsRes.error.message);
      if (eventsRes.error) throw new Error(eventsRes.error.message);

      const raw = settingsRes.data?.value as unknown;
      const dbEvents = eventsRes.data || [];

      const dbCalendar = dbEvents.filter((e: any) => e.type === "upcoming");
      const dbMoments = dbEvents.filter((e: any) => e.type === "past");

      const loadedCalendar = dbCalendar.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          time: e.time,
          venue: e.venue,
          img: e.img,
          path: `${EVENTS_FOLDER}/calendar/${e.id}`,
          cat: e.cat,
          catColor: e.cat_color || "bg-school-green",
          desc: e.description || "",
          highlight: e.highlight
      }));

      const loadedMoments = dbMoments.map((m: any) => ({
          id: m.id,
          img: m.img,
          path: `${EVENTS_FOLDER}/moments/${m.id}`,
          title: m.title,
          year: m.year || "",
          desc: m.description || "",
      }));

      const normalized = normalize({ calendar: loadedCalendar, moments: loadedMoments });
      const loadedFit =
        typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";
      setServerCalendar(normalized.calendar);
      setServerMoments(normalized.moments);
      setCalendar(normalized.calendar);
      setMoments(normalized.moments);
      setFit(loadedFit);
      setServerFit(loadedFit);

      setPreviews((prev) => {
        Object.values(prev).forEach((p) => {
          if (p.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return {};
      });
      setNewFiles({});
      setDisplayVersion(Date.now());
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load events page" });
    } finally {
      setLoading(false);
    }
  }, [normalize]);

  useEffect(() => {
    load();
  }, [load]);

  const updateCalendar = (id: string, patch: Partial<EventsCalendarItem>) => {
    const nextPatch: Partial<EventsCalendarItem> = { ...patch };
    if (typeof nextPatch.title === "string") nextPatch.title = capitalizeFirstLetter(nextPatch.title);
    if (typeof nextPatch.date === "string") nextPatch.date = capitalizeFirstLetter(nextPatch.date);
    if (typeof nextPatch.venue === "string") nextPatch.venue = capitalizeFirstLetter(nextPatch.venue);
    if (typeof nextPatch.cat === "string") nextPatch.cat = capitalizeFirstLetter(nextPatch.cat);
    if (typeof nextPatch.desc === "string") nextPatch.desc = capitalizeFirstLetter(nextPatch.desc);
    setCalendar((prev) => prev.map((e) => (e.id === id ? { ...e, ...nextPatch } : e)));
  };

  const updateMoment = (id: string, patch: Partial<EventsMomentItem>) => {
    const nextPatch: Partial<EventsMomentItem> = { ...patch };
    if (typeof nextPatch.title === "string") nextPatch.title = capitalizeFirstLetter(nextPatch.title);
    if (typeof nextPatch.year === "string") nextPatch.year = capitalizeFirstLetter(nextPatch.year);
    if (typeof nextPatch.desc === "string") nextPatch.desc = capitalizeFirstLetter(nextPatch.desc);
    setMoments((prev) => prev.map((m) => (m.id === id ? { ...m, ...nextPatch } : m)));
  };

  const addCalendarItem = () => {
    const id = makeId();
    setCalendar((prev) => [
      {
        id,
        title: "",
        date: "",
        startTime: "",
        endTime: "",
        venue: "",
        img: "",
        path: `${EVENTS_FOLDER}/calendar/${id}`,
        cat: "",
        catColor: "bg-school-green",
        desc: "",
        highlight: false,
      },
      ...prev,
    ]);
  };

  const addMomentItem = () => {
    const id = makeId();
    setMoments((prev) => [
      { id, img: "", path: `${EVENTS_FOLDER}/moments/${id}`, title: "", year: "", desc: "" },
      ...prev,
    ]);
  };

  const removeCalendarItem = (id: string) => {
    setCalendar((prev) => prev.filter((e) => e.id !== id));
    setNewFiles((prev) => {
      const k = keyFor("calendar", id);
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
    setPreviews((prev) => {
      const k = keyFor("calendar", id);
      const url = prev[k];
      if (!url) return prev;
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const removeMomentItem = (id: string) => {
    setMoments((prev) => prev.filter((m) => m.id !== id));
    setNewFiles((prev) => {
      const k = keyFor("moments", id);
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
    setPreviews((prev) => {
      const k = keyFor("moments", id);
      const url = prev[k];
      if (!url) return prev;
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const pickCalendarImage = (id: string, file: File | null) => {
    setMessage(null);
    const k = keyFor("calendar", id);
    if (!file) {
      setNewFiles((prev) => {
        if (!prev[k]) return prev;
        const next = { ...prev };
        delete next[k];
        return next;
      });
      setPreviews((prev) => {
        const existing = prev[k];
        if (!existing) return prev;
        if (existing.startsWith("blob:")) URL.revokeObjectURL(existing);
        const next = { ...prev };
        delete next[k];
        return next;
      });
      return;
    }

    if (!file.type.startsWith("image/")) return;
    const preview = URL.createObjectURL(file);
    setNewFiles((prev) => ({ ...prev, [k]: file }));
    setPreviews((prev) => {
      const existing = prev[k];
      if (existing?.startsWith("blob:")) URL.revokeObjectURL(existing);
      return { ...prev, [k]: preview };
    });
  };

  const pickMomentImage = (id: string, file: File | null) => {
    setMessage(null);
    const k = keyFor("moments", id);
    if (!file) {
      setNewFiles((prev) => {
        if (!prev[k]) return prev;
        const next = { ...prev };
        delete next[k];
        return next;
      });
      setPreviews((prev) => {
        const existing = prev[k];
        if (!existing) return prev;
        if (existing.startsWith("blob:")) URL.revokeObjectURL(existing);
        const next = { ...prev };
        delete next[k];
        return next;
      });
      return;
    }

    if (!file.type.startsWith("image/")) return;
    const preview = URL.createObjectURL(file);
    setNewFiles((prev) => ({ ...prev, [k]: file }));
    setPreviews((prev) => {
      const existing = prev[k];
      if (existing?.startsWith("blob:")) URL.revokeObjectURL(existing);
      return { ...prev, [k]: preview };
    });
  };

  const dirty = useMemo(() => {
    if (Object.keys(newFiles).length > 0) return true;
    if (fit !== serverFit) return true;
    const a = JSON.stringify({ calendar: serverCalendar, moments: serverMoments });
    const b = JSON.stringify({ calendar, moments });
    return a !== b;
  }, [calendar, fit, moments, newFiles, serverCalendar, serverFit, serverMoments]);

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();

      const serverPaths = new Set(
        [...serverCalendar.map((e) => e.path), ...serverMoments.map((m) => m.path)].filter((p) => p.trim().length > 0),
      );

      const nextCalendar: EventsCalendarItem[] = calendar.map((e) => ({
        ...e,
        title: e.title.trim(),
        date: e.date.trim(),
        startTime: e.startTime.trim(),
        endTime: e.endTime.trim(),
        venue: e.venue.trim(),
        img: e.img.trim(),
        path: e.path.trim(),
        cat: e.cat.trim(),
        catColor: e.catColor.trim() || "bg-school-green",
        desc: e.desc.trim(),
      }));

      const nextMoments: EventsMomentItem[] = moments.map((m) => ({
        ...m,
        title: m.title.trim(),
        year: m.year.trim(),
        desc: m.desc.trim(),
        img: m.img.trim(),
        path: m.path.trim(),
      }));

      const keepPaths = new Set(
        [
          ...nextCalendar
            .filter(
              (e) =>
                e.title.trim().length > 0 && (e.img.trim().length > 0 || Boolean(newFiles[keyFor("calendar", e.id)])),
            )
            .map((e) => e.path),
          ...nextMoments
            .filter(
              (m) =>
                m.title.trim().length > 0 && (m.img.trim().length > 0 || Boolean(newFiles[keyFor("moments", m.id)])),
            )
            .map((m) => m.path),
        ].filter((p) => p.trim().length > 0),
      );
      const toRemove = Array.from(serverPaths).filter((p) => !keepPaths.has(p));
      if (toRemove.length > 0) {
        await supabase.storage.from(STORAGE_BUCKET).remove(toRemove);
      }

      for (let i = 0; i < nextCalendar.length; i += 1) {
        const item = nextCalendar[i];
        const file = newFiles[keyFor("calendar", item.id)];
        if (!file) continue;
        if (item.title.trim().length === 0) continue;
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(item.path, file, {
          upsert: true,
          contentType: file.type,
        });
        if (uploadError) {
          setMessage({ type: "error", text: uploadError.message });
          return;
        }
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(item.path);
        nextCalendar[i] = { ...item, img: data.publicUrl };
      }

      for (let i = 0; i < nextMoments.length; i += 1) {
        const item = nextMoments[i];
        const file = newFiles[keyFor("moments", item.id)];
        if (!file) continue;
        if (item.title.trim().length === 0) continue;
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(item.path, file, {
          upsert: true,
          contentType: file.type,
        });
        if (uploadError) {
          setMessage({ type: "error", text: uploadError.message });
          return;
        }
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(item.path);
        nextMoments[i] = { ...item, img: data.publicUrl };
      }

      const cleanedCalendar = nextCalendar.filter((e) => e.title.trim().length > 0);
      const cleanedMoments = nextMoments.filter((m) => m.title.trim().length > 0);

      const { error: settingsError } = await supabase.from(SITE_SETTINGS_TABLE).upsert(
        {
          key: EVENTS_PAGE_KEY,
          value: {
            fit,
            version: Date.now(),
          },
        },
        { onConflict: "key" },
      );

      if (settingsError) throw new Error(settingsError.message);

      const upsertRows = [
        ...cleanedCalendar.map(e => ({
            id: e.id,
            type: "upcoming",
            title: e.title,
            date: e.date,
            start_time: e.startTime,
            end_time: e.endTime,
            venue: e.venue,
            img: e.img,
            cat: e.cat,
            cat_color: e.catColor,
            description: e.desc,
            highlight: e.highlight,
            year: ""
        })),
        ...cleanedMoments.map(m => ({
            id: m.id,
            type: "past",
            title: m.title,
            date: "",
            time: "",
            venue: "",
            img: m.img,
            cat: "",
            cat_color: "",
            description: m.desc,
            highlight: false,
            year: m.year
        }))
      ];

      if (upsertRows.length > 0) {
        const { error: upsertError } = await supabase.from("events").upsert(upsertRows);
        if (upsertError) throw new Error(upsertError.message);
      }

      const activeIds = upsertRows.map(r => r.id);
      if (activeIds.length > 0) {
        // Use properly quoted UUID syntax for .not("id", "in", ...)
        const { error: deleteError } = await supabase
          .from("events")
          .delete()
          .not("id", "in", `(${activeIds.map(id => `"${id}"`).join(",")})`);
        if (deleteError) {
          console.warn("Events cleanup delete error:", deleteError.message);
        }
      } else {
        // Wipe everything if no events remain
        const { error: deleteAllError } = await supabase.from("events").delete().gte("id", "");
        if (deleteAllError) console.warn("Events wipe error:", deleteAllError.message);
      }



      Object.values(previews).forEach((p) => {
        if (p.startsWith("blob:")) URL.revokeObjectURL(p);
      });
      setPreviews({});
      setNewFiles({});
      setDisplayVersion(Date.now());
      const normalized = normalize({ calendar: cleanedCalendar, moments: cleanedMoments });
      setServerCalendar(normalized.calendar);
      setServerMoments(normalized.moments);
      setCalendar(normalized.calendar);
      setMoments(normalized.moments);
      setServerFit(fit);
      setMessage({ type: "success", text: "Events updated" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save events" });
    } finally {
      setSaving(false);
    }
  };

  const colorOptions: { label: string; value: string }[] = [
    { label: "Green", value: "bg-school-green" },
    { label: "Blue", value: "bg-school-blue" },
    { label: "Teal", value: "bg-school-teal" },
    { label: "Orange", value: "bg-school-orange" },
    { label: "Purple", value: "bg-school-purple" },
    { label: "Red", value: "bg-school-red" },
    { label: "Dark", value: "bg-school-dark" },
    { label: "Gold", value: "bg-school-gold" },
  ];

  return (
    <div className="border rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="font-bold text-lg">Events Page</div>
          <div className="text-sm text-gray-500">Update Events Calendar 2026 and Memorable Moments.</div>
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
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="space-y-6">
        <div className="border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="font-semibold">Events Calendar 2026</div>
              <div className="text-xs text-gray-500">These events appear in the “Events Calendar 2026” section.</div>
            </div>
            <button
              type="button"
              onClick={addCalendarItem}
              disabled={saving || loading}
              className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60"
            >
              Add Event
            </button>
          </div>

          <div className="space-y-5">
            {paginatedCalendar.map((event) => {
              const preview = previews[keyFor("calendar", event.id)];
              const src = preview || (event.img ? `${event.img}?v=${encodeURIComponent(String(displayVersion))}` : "");
              return (
                <div key={event.id} className="border rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="font-semibold">{event.title.trim() || "New Event"}</div>
                    <button
                      type="button"
                      onClick={() => removeCalendarItem(event.id)}
                      disabled={saving || loading}
                      className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid lg:grid-cols-[220px_1fr] gap-4">
                    <div className="border rounded-xl overflow-hidden bg-gray-50">
                      <div className="relative h-40">
                        {src ? (
                          <Image
                            src={src}
                            alt={event.title || "Event image"}
                            fill
                            sizes="220px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-3 space-y-3">
                        <SingleImageDropzone
                          disabled={saving || loading}
                          onPick={(file) => pickCalendarImage(event.id, file)}
                        />
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs text-gray-500 truncate">
                            {preview ? "Preview (not saved)" : event.img ? "Saved" : "Empty"}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              pickCalendarImage(event.id, null);
                              updateCalendar(event.id, { img: "" });
                            }}
                            disabled={saving || loading || (!preview && !event.img)}
                            className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-3">
                      <div className="space-y-1 lg:col-span-3">
                        <label
                          htmlFor={`admin-event-${event.id}-title`}
                          className="block text-xs font-semibold text-gray-700"
                        >
                          Title
                        </label>
                        <input
                          id={`admin-event-${event.id}-title`}
                          value={event.title}
                          onChange={(e) => updateCalendar(event.id, { title: e.target.value })}
                          placeholder="Title"
                          className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                          disabled={saving || loading}
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor={`admin-event-${event.id}-date`}
                          className="block text-xs font-semibold text-gray-700"
                        >
                          Date
                        </label>
                        <input
                          id={`admin-event-${event.id}-date`}
                          type="date"
                          value={event.date}
                          onChange={(e) => updateCalendar(event.id, { date: e.target.value })}
                          className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                          disabled={saving || loading}
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor={`admin-event-${event.id}-startTime`}
                          className="block text-xs font-semibold text-gray-700"
                        >
                          Start Time
                        </label>
                        <input
                          id={`admin-event-${event.id}-startTime`}
                          type="time"
                          value={event.startTime}
                          onChange={(e) => updateCalendar(event.id, { startTime: e.target.value })}
                          className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                          disabled={saving || loading}
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor={`admin-event-${event.id}-endTime`}
                          className="block text-xs font-semibold text-gray-700"
                        >
                          End Time
                        </label>
                        <input
                          id={`admin-event-${event.id}-endTime`}
                          type="time"
                          value={event.endTime}
                          onChange={(e) => updateCalendar(event.id, { endTime: e.target.value })}
                          className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                          disabled={saving || loading}
                        />
                      </div>
                      <div className="space-y-1 lg:col-span-3">
                        <label
                          htmlFor={`admin-event-${event.id}-venue`}
                          className="block text-xs font-semibold text-gray-700"
                        >
                          Venue
                        </label>
                        <input
                          id={`admin-event-${event.id}-venue`}
                          value={event.venue}
                          onChange={(e) => updateCalendar(event.id, { venue: e.target.value })}
                          placeholder="Venue"
                          className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                          disabled={saving || loading}
                        />
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor={`admin-event-${event.id}-cat`}
                          className="block text-xs font-semibold text-gray-700"
                        >
                          Category
                        </label>
                        <input
                          id={`admin-event-${event.id}-cat`}
                          value={event.cat}
                          onChange={(e) => updateCalendar(event.id, { cat: e.target.value })}
                          placeholder="Category (e.g., Sports)"
                          className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                          disabled={saving || loading}
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor={`admin-event-${event.id}-catColor`}
                          className="block text-xs font-semibold text-gray-700"
                        >
                          Category color
                        </label>
                        <select
                          id={`admin-event-${event.id}-catColor`}
                          value={event.catColor}
                          onChange={(e) => updateCalendar(event.id, { catColor: e.target.value })}
                          className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                          disabled={saving || loading}
                        >
                          {colorOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1 lg:col-span-3">
                        <label
                          htmlFor={`admin-event-${event.id}-desc`}
                          className="block text-xs font-semibold text-gray-700"
                        >
                          Description
                        </label>
                        <textarea
                          id={`admin-event-${event.id}-desc`}
                          value={event.desc}
                          onChange={(e) => updateCalendar(event.id, { desc: e.target.value })}
                          placeholder="Description"
                          rows={4}
                          className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                          disabled={saving || loading}
                        />
                      </div>

                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={event.highlight}
                          onChange={(e) => updateCalendar(event.id, { highlight: e.target.checked })}
                          disabled={saving || loading}
                        />
                        Featured
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}

            {calendar.length === 0 ? <div className="text-sm text-gray-500">No events yet.</div> : (
              <Pagination
                currentPage={calendarPage}
                totalPages={calendarTotalPages}
                onPageChange={setCalendarPage}
                totalItems={calendar.length}
                itemName="events"
              />
            )}
          </div>
        </div>

        <div className="border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="font-semibold">Memorable Moments</div>
              <div className="text-xs text-gray-500">These appear in the “Memorable Moments” section.</div>
            </div>
            <button
              type="button"
              onClick={addMomentItem}
              disabled={saving || loading}
              className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60"
            >
              Add Moment
            </button>
          </div>

          <div className="space-y-5">
            {paginatedMoments.map((moment) => {
              const preview = previews[keyFor("moments", moment.id)];
              const src =
                preview || (moment.img ? `${moment.img}?v=${encodeURIComponent(String(displayVersion))}` : "");
              return (
                <div key={moment.id} className="border rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="font-semibold">{moment.title.trim() || "New Moment"}</div>
                    <button
                      type="button"
                      onClick={() => removeMomentItem(moment.id)}
                      disabled={saving || loading}
                      className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid lg:grid-cols-[220px_1fr] gap-4">
                    <div className="border rounded-xl overflow-hidden bg-gray-50">
                      <div className="relative h-40">
                        {src ? (
                          <Image
                            src={src}
                            alt={moment.title || "Moment image"}
                            fill
                            sizes="220px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-3 space-y-3">
                        <SingleImageDropzone
                          disabled={saving || loading}
                          onPick={(file) => pickMomentImage(moment.id, file)}
                        />
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs text-gray-500 truncate">
                            {preview ? "Preview (not saved)" : moment.img ? "Saved" : "Empty"}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              pickMomentImage(moment.id, null);
                              updateMoment(moment.id, { img: "" });
                            }}
                            disabled={saving || loading || (!preview && !moment.img)}
                            className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-3">
                      <div className="space-y-1 lg:col-span-2">
                        <label
                          htmlFor={`admin-moment-${moment.id}-title`}
                          className="block text-xs font-semibold text-gray-700"
                        >
                          Title
                        </label>
                        <input
                          id={`admin-moment-${moment.id}-title`}
                          value={moment.title}
                          onChange={(e) => updateMoment(moment.id, { title: e.target.value })}
                          placeholder="Title"
                          className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                          disabled={saving || loading}
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor={`admin-moment-${moment.id}-year`}
                          className="block text-xs font-semibold text-gray-700"
                        >
                          Date
                        </label>
                        <input
                          id={`admin-moment-${moment.id}-year`}
                          type="date"
                          value={moment.year}
                          onChange={(e) => updateMoment(moment.id, { year: e.target.value })}
                          className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                          disabled={saving || loading}
                        />
                      </div>
                      <div />
                      <div className="space-y-1 lg:col-span-2">
                        <label
                          htmlFor={`admin-moment-${moment.id}-desc`}
                          className="block text-xs font-semibold text-gray-700"
                        >
                          Description
                        </label>
                        <textarea
                          id={`admin-moment-${moment.id}-desc`}
                          value={moment.desc}
                          onChange={(e) => updateMoment(moment.id, { desc: e.target.value })}
                          placeholder="Description"
                          rows={4}
                          className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                          disabled={saving || loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {moments.length === 0 ? <div className="text-sm text-gray-500">No moments yet.</div> : (
              <Pagination
                currentPage={momentsPage}
                totalPages={momentsTotalPages}
                onPageChange={setMomentsPage}
                totalItems={moments.length}
                itemName="moments"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type BlogFit = "cover" | "contain";
type BlogItem = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  cat: string;
  img: string;
  path: string;
  featured: boolean;
  readTime: string;
  catColor: string;
};

function BlogsEditor() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useAutoMessage();

  const [serverFit, setServerFit] = useState<BlogFit>("cover");
  const [fit, setFit] = useState<BlogFit>("cover");
  const [serverItems, setServerItems] = useState<BlogItem[]>([]);
  const [items, setItems] = useState<BlogItem[]>([]);

  const [newFiles, setNewFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [displayVersion, setDisplayVersion] = useState(() => Date.now());

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    if (page > Math.ceil(items.length / itemsPerPage)) {
      setPage(Math.max(1, Math.ceil(items.length / itemsPerPage)));
    }
  }, [items.length, page]);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((p) => {
        if (p.startsWith("blob:")) URL.revokeObjectURL(p);
      });
    };
  }, [previews]);

  const makeId = () => {
    const cryptoObj = globalThis.crypto as { randomUUID?: () => string } | undefined;
    if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const baseUrl = (value: unknown) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (trimmed.length === 0) return "";
    return trimmed.split("?")[0] ?? "";
  };

  const normalize = useCallback((raw: unknown): { fit: BlogFit; items: BlogItem[] } => {
    const nextFit: BlogFit =
      typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";
    const itemsRaw =
      typeof raw === "object" && raw && Array.isArray((raw as { items?: unknown }).items)
        ? ((raw as { items: unknown[] }).items as unknown[])
        : [];

    const nextItems = itemsRaw.map((row) => {
      const obj = typeof row === "object" && row ? (row as Record<string, unknown>) : null;
      const id = typeof obj?.id === "string" && obj.id.trim().length > 0 ? obj.id.trim() : makeId();
      const title = typeof obj?.title === "string" ? obj.title : "";
      const excerpt = typeof obj?.excerpt === "string" ? obj.excerpt : "";
      const author = typeof obj?.author === "string" ? obj.author : "";
      const date = typeof obj?.date === "string" ? obj.date : "";
      const cat = typeof obj?.cat === "string" ? obj.cat : "";
      const img = baseUrl(obj?.img);
      const path =
        typeof obj?.path === "string" && obj.path.trim().length > 0 ? obj.path.trim() : `${BLOGS_FOLDER}/${id}`;
      const featured = Boolean(obj?.featured);
      const readTime = typeof obj?.readTime === "string" ? obj.readTime : "";
      const catColor = typeof obj?.catColor === "string" ? obj.catColor : "bg-school-green";
      return { id, title, excerpt, author, date, cat, img, path, featured, readTime, catColor } satisfies BlogItem;
    });

    const hasFeatured = nextItems.some((b) => b.featured);
    const normalizedItems = hasFeatured
      ? nextItems.map((b, i) => ({ ...b, featured: i === nextItems.findIndex((x) => x.featured) }))
      : nextItems;

    return { fit: nextFit, items: normalizedItems };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const [settingsRes, blogsRes] = await Promise.all([
        supabase.from(SITE_SETTINGS_TABLE).select("value").eq("key", BLOGS_PAGE_KEY).maybeSingle(),
        supabase.from("blogs").select("*").order("created_at", { ascending: false })
      ]);

      if (settingsRes.error && settingsRes.error.code !== "PGRST116") throw new Error(settingsRes.error.message);
      if (blogsRes.error) throw new Error(blogsRes.error.message);

      const raw = settingsRes.data?.value as unknown;
      const dbBlogs = blogsRes.data || [];

      const loadedItems = dbBlogs.map(b => ({
          id: b.id,
          title: b.title,
          excerpt: b.excerpt,
          author: b.author,
          date: b.date,
          cat: b.cat,
          img: b.img,
          path: `${BLOGS_FOLDER}/${b.id}`,
          featured: b.featured,
          readTime: b.read_time || "",
          catColor: b.cat_color || "bg-school-green",
      }));

      const fit = typeof raw === "object" && raw && (raw as any).fit === "contain" ? "contain" : "cover";
      const candidate = {
        fit,
        items: loadedItems
      };

      const normalized = normalize(candidate);
      setServerFit(normalized.fit);
      setFit(normalized.fit);
      setServerItems(normalized.items);
      setItems(normalized.items);

      setPreviews((prev) => {
        Object.values(prev).forEach((p) => {
          if (p.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return {};
      });
      setNewFiles({});
      setDisplayVersion(Date.now());
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load blogs page" });
    } finally {
      setLoading(false);
    }
  }, [normalize]);

  useEffect(() => {
    load();
  }, [load]);

  const addItem = () => {
    const id = makeId();
    setItems((prev) => [
      {
        id,
        title: "",
        excerpt: "",
        author: "",
        date: "",
        cat: "",
        img: "",
        path: `${BLOGS_FOLDER}/${id}`,
        featured: prev.length === 0,
        readTime: "",
        catColor: "bg-school-green",
      },
      ...prev,
    ]);
  };

  const moveItem = (id: string, dir: -1 | 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === id);
      if (idx < 0) return prev;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[idx];
      next[idx] = next[nextIdx];
      next[nextIdx] = tmp;
      return next;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((b) => b.id !== id));
    setNewFiles((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setPreviews((prev) => {
      const url = prev[id];
      if (!url) return prev;
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const setFeatured = (id: string) => {
    setItems((prev) => prev.map((b) => ({ ...b, featured: b.id === id })));
  };

  const updateItem = (id: string, patch: Partial<BlogItem>) => {
    const nextPatch: Partial<BlogItem> = { ...patch };
    if (typeof nextPatch.title === "string") nextPatch.title = capitalizeFirstLetter(nextPatch.title);
    if (typeof nextPatch.excerpt === "string") nextPatch.excerpt = capitalizeFirstLetter(nextPatch.excerpt);
    if (typeof nextPatch.author === "string") nextPatch.author = capitalizeFirstLetter(nextPatch.author);
    if (typeof nextPatch.date === "string") nextPatch.date = capitalizeFirstLetter(nextPatch.date);
    if (typeof nextPatch.cat === "string") nextPatch.cat = capitalizeFirstLetter(nextPatch.cat);
    setItems((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const next = { ...b, ...nextPatch };
        return next;
      }),
    );

    if (patch.featured) setFeatured(id);
  };

  const pickImage = (id: string, file: File | null) => {
    setMessage(null);
    if (!file) {
      setNewFiles((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setPreviews((prev) => {
        const existing = prev[id];
        if (!existing) return prev;
        if (existing.startsWith("blob:")) URL.revokeObjectURL(existing);
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    if (!file.type.startsWith("image/")) return;
    const preview = URL.createObjectURL(file);
    setNewFiles((prev) => ({ ...prev, [id]: file }));
    setPreviews((prev) => {
      const existing = prev[id];
      if (existing?.startsWith("blob:")) URL.revokeObjectURL(existing);
      return { ...prev, [id]: preview };
    });
  };

  const dirty = useMemo(() => {
    if (fit !== serverFit) return true;
    if (Object.keys(newFiles).length > 0) return true;
    const a = JSON.stringify(serverItems);
    const b = JSON.stringify(items);
    return a !== b;
  }, [fit, items, newFiles, serverFit, serverItems]);

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();

      const nextItems: BlogItem[] = items.map((b) => ({
        ...b,
        title: b.title.trim(),
        excerpt: b.excerpt.trim(),
        author: b.author.trim(),
        date: b.date.trim(),
        cat: b.cat.trim(),
        img: b.img.trim(),
        path: b.path.trim(),
        readTime: b.readTime.trim(),
        catColor: b.catColor.trim() || "bg-school-green",
      }));

      const featuredIndex = nextItems.findIndex((b) => b.featured);
      const fixedFeatured =
        featuredIndex >= 0 ? nextItems.map((b, i) => ({ ...b, featured: i === featuredIndex })) : nextItems;

      const serverPaths = new Set(serverItems.map((b) => b.path).filter((p) => p.trim().length > 0));
      const keepPaths = new Set(
        fixedFeatured
          .filter((b) => b.title.trim().length > 0 && (b.img.trim().length > 0 || Boolean(newFiles[b.id])))
          .map((b) => b.path)
          .filter((p) => p.trim().length > 0),
      );
      const toRemove = Array.from(serverPaths).filter((p) => !keepPaths.has(p));
      if (toRemove.length > 0) {
        await supabase.storage.from(STORAGE_BUCKET).remove(toRemove);
      }

      for (let i = 0; i < fixedFeatured.length; i += 1) {
        const item = fixedFeatured[i];
        const file = newFiles[item.id];
        if (!file) continue;
        if (item.title.trim().length === 0) continue;
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(item.path, file, {
          upsert: true,
          contentType: file.type,
        });
        if (uploadError) {
          setMessage({ type: "error", text: uploadError.message });
          return;
        }
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(item.path);
        fixedFeatured[i] = { ...item, img: data.publicUrl };
      }

      const cleaned = fixedFeatured.filter((b) => b.title.trim().length > 0);

      const { error: settingsError } = await supabase.from(SITE_SETTINGS_TABLE).upsert(
        {
          key: BLOGS_PAGE_KEY,
          value: {
            fit,
            version: Date.now(),
          },
        },
        { onConflict: "key" },
      );

      if (settingsError) throw new Error(settingsError.message);

      const upsertRows = cleaned.map((b) => ({
        id: b.id,
        title: b.title,
        excerpt: b.excerpt,
        author: b.author,
        date: b.date,
        cat: b.cat,
        img: b.img,
        featured: b.featured,
        read_time: b.readTime,
        cat_color: b.catColor,
      }));

      if (upsertRows.length > 0) {
        const { error: upsertError } = await supabase.from("blogs").upsert(upsertRows);
        if (upsertError) throw new Error(upsertError.message);
      }

      const activeIds = upsertRows.map((r) => r.id);
      if (activeIds.length > 0) {
        // Use properly quoted UUID syntax for .not("id", "in", ...)
        const { error: deleteError } = await supabase
          .from("blogs")
          .delete()
          .not("id", "in", `(${activeIds.map(id => `"${id}"`).join(",")})`);
        if (deleteError) {
          console.warn("Blogs cleanup delete error:", deleteError.message);
        }
      } else {
        // Wipe everything if no blogs remain
        const { error: deleteAllError } = await supabase.from("blogs").delete().gte("id", "");
        if (deleteAllError) console.warn("Blogs wipe error:", deleteAllError.message);
      }



      Object.values(previews).forEach((p) => {
        if (p.startsWith("blob:")) URL.revokeObjectURL(p);
      });
      setPreviews({});
      setNewFiles({});
      setDisplayVersion(Date.now());

      const normalized = normalize({ items: cleaned, fit });
      setServerFit(normalized.fit);
      setFit(normalized.fit);
      setServerItems(normalized.items);
      setItems(normalized.items);
      setMessage({ type: "success", text: "Blogs updated" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save blogs" });
    } finally {
      setSaving(false);
    }
  };

  const colorOptions: { label: string; value: string }[] = [
    { label: "Green", value: "bg-school-green" },
    { label: "Blue", value: "bg-school-blue" },
    { label: "Teal", value: "bg-school-teal" },
    { label: "Orange", value: "bg-school-orange" },
    { label: "Purple", value: "bg-school-purple" },
    { label: "Red", value: "bg-school-red" },
    { label: "Dark", value: "bg-school-dark" },
    { label: "Gold", value: "bg-school-gold" },
  ];

  return (
    <div className="border rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="font-bold text-lg">Blogs Page</div>
          <div className="text-sm text-gray-500">Add blog sections and control image fit.</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={addItem}
            disabled={loading || saving}
            className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            Add Blog
          </button>
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

      {message ? (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="text-sm font-semibold text-gray-700">Image Fit</div>
        <div className="flex items-center rounded-xl border overflow-hidden">
          <button
            type="button"
            onClick={() => setFit("cover")}
            disabled={saving || loading}
            className={`px-4 py-2 text-sm ${
              fit === "cover" ? "bg-school-dark text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            } disabled:opacity-60`}
          >
            Cover
          </button>
          <button
            type="button"
            onClick={() => setFit("contain")}
            disabled={saving || loading}
            className={`px-4 py-2 text-sm ${
              fit === "contain" ? "bg-school-dark text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            } disabled:opacity-60`}
          >
            Contain
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {paginatedItems.map((blog, idx) => {
          const globalIdx = (page - 1) * itemsPerPage + idx;
          const preview = previews[blog.id];
          const src = preview || (blog.img ? `${blog.img}?v=${encodeURIComponent(String(displayVersion))}` : "");
          return (
            <div key={blog.id} className="border rounded-2xl p-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="font-semibold">{blog.title.trim() || "New Blog"}</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveItem(blog.id, -1)}
                    disabled={saving || loading || globalIdx === 0}
                    className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(blog.id, 1)}
                    disabled={saving || loading || globalIdx === items.length - 1}
                    className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(blog.id)}
                    disabled={saving || loading}
                    className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-[220px_1fr] gap-4">
                <div className="border rounded-xl overflow-hidden bg-gray-50">
                  <div className="relative h-40">
                    {src ? (
                      <Image
                        src={src}
                        alt={blog.title || "Blog image"}
                        fill
                        sizes="220px"
                        className={fit === "contain" ? "object-contain" : "object-cover"}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-3">
                    <SingleImageDropzone disabled={saving || loading} onPick={(file) => pickImage(blog.id, file)} />
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-gray-500 truncate">
                        {preview ? "Preview (not saved)" : blog.img ? "Saved" : "Empty"}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          pickImage(blog.id, null);
                          updateItem(blog.id, { img: "" });
                        }}
                        disabled={saving || loading || (!preview && !blog.img)}
                        className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-3">
                  <div className="space-y-1 lg:col-span-2">
                    <label
                      htmlFor={`admin-blog-${blog.id}-title`}
                      className="block text-xs font-semibold text-gray-700"
                    >
                      Title
                    </label>
                    <input
                      id={`admin-blog-${blog.id}-title`}
                      value={blog.title}
                      onChange={(e) => updateItem(blog.id, { title: e.target.value })}
                      placeholder="Title"
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                      disabled={saving || loading}
                    />
                  </div>
                  <div className="space-y-1 lg:col-span-2">
                    <label
                      htmlFor={`admin-blog-${blog.id}-excerpt`}
                      className="block text-xs font-semibold text-gray-700"
                    >
                      Excerpt
                    </label>
                    <textarea
                      id={`admin-blog-${blog.id}-excerpt`}
                      value={blog.excerpt}
                      onChange={(e) => updateItem(blog.id, { excerpt: e.target.value })}
                      placeholder="Excerpt"
                      rows={4}
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                      disabled={saving || loading}
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor={`admin-blog-${blog.id}-author`}
                      className="block text-xs font-semibold text-gray-700"
                    >
                      Author
                    </label>
                    <input
                      id={`admin-blog-${blog.id}-author`}
                      value={blog.author}
                      onChange={(e) => updateItem(blog.id, { author: e.target.value })}
                      placeholder="Author"
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                      disabled={saving || loading}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={`admin-blog-${blog.id}-date`} className="block text-xs font-semibold text-gray-700">
                      Date
                    </label>
                    <input
                      id={`admin-blog-${blog.id}-date`}
                      type="date"
                      value={blog.date}
                      onChange={(e) => updateItem(blog.id, { date: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                      disabled={saving || loading}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={`admin-blog-${blog.id}-cat`} className="block text-xs font-semibold text-gray-700">
                      Category
                    </label>
                    <input
                      id={`admin-blog-${blog.id}-cat`}
                      value={blog.cat}
                      onChange={(e) => updateItem(blog.id, { cat: e.target.value })}
                      placeholder="Category (e.g., Education)"
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                      disabled={saving || loading}
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor={`admin-blog-${blog.id}-catColor`}
                      className="block text-xs font-semibold text-gray-700"
                    >
                      Category color
                    </label>
                    <select
                      id={`admin-blog-${blog.id}-catColor`}
                      value={blog.catColor}
                      onChange={(e) => updateItem(blog.id, { catColor: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                      disabled={saving || loading}
                    >
                      {colorOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor={`admin-blog-${blog.id}-readTime`}
                      className="block text-xs font-semibold text-gray-700"
                    >
                      Read time
                    </label>
                    <input
                      id={`admin-blog-${blog.id}-readTime`}
                      value={blog.readTime}
                      onChange={(e) => updateItem(blog.id, { readTime: e.target.value })}
                      placeholder="Read Time (e.g., 5 min read)"
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                      disabled={saving || loading}
                    />
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={blog.featured}
                      onChange={(e) => updateItem(blog.id, { featured: e.target.checked })}
                      disabled={saving || loading}
                    />
                    Featured
                  </label>
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 ? <div className="text-sm text-gray-500">No blogs yet.</div> : (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={items.length}
            itemName="blogs"
          />
        )}
      </div>
    </div>
  );
}

function LeadersDeskEditor() {
  type DeskImageFit = "cover" | "contain";
  type DeskLeader = { name: string; role: string; message: string; image: string; quote: string; motto: string };
  type DeskValue = { director: DeskLeader; principal: DeskLeader; fit: DeskImageFit; version?: unknown };

  const defaultValue = useCallback(
    (): DeskValue => ({
      director: {
        name: "",
        role: "",
        message: "",
        image: "",
        quote: "",
        motto: "",
      },
      principal: {
        name: "",
        role: "",
        quote: "",
        message: "",
        image: "",
        motto: "",
      },
      fit: "cover",
    }),
    [],
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useAutoMessage();
  const [desk, setDesk] = useState<DeskValue>(() => defaultValue());
  const [serverDesk, setServerDesk] = useState<DeskValue>(() => defaultValue());
  const [directorFile, setDirectorFile] = useState<File | null>(null);
  const [principalFile, setPrincipalFile] = useState<File | null>(null);
  const [directorPreview, setDirectorPreview] = useState<string | null>(null);
  const [principalPreview, setPrincipalPreview] = useState<string | null>(null);
  const [displayVersion, setDisplayVersion] = useState(() => Date.now());

  useEffect(() => {
    return () => {
      if (directorPreview?.startsWith("blob:")) URL.revokeObjectURL(directorPreview);
      if (principalPreview?.startsWith("blob:")) URL.revokeObjectURL(principalPreview);
    };
  }, [directorPreview, principalPreview]);

  const normalizeUrl = (value: string) => value.trim().split("?")[0];

  const normalizeDesk = (value: DeskValue): DeskValue => ({
    director: {
      name: value.director.name.trim(),
      role: value.director.role.trim(),
      message: value.director.message.trim(),
      quote: value.director.quote.trim(),
      motto: value.director.motto.trim(),
      image: normalizeUrl(value.director.image),
    },
    principal: {
      name: value.principal.name.trim(),
      role: value.principal.role.trim(),
      message: value.principal.message.trim(),
      quote: value.principal.quote.trim(),
      motto: value.principal.motto.trim(),
      image: normalizeUrl(value.principal.image),
    },
    fit: value.fit === "contain" ? "contain" : "cover",
  });

  const dirty =
    JSON.stringify(normalizeDesk(desk)) !== JSON.stringify(normalizeDesk(serverDesk)) ||
    Boolean(directorFile) ||
    Boolean(principalFile);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from(SITE_SETTINGS_TABLE)
        .select("value, updated_at")
        .eq("key", HOME_DESK_KEY)
        .maybeSingle();

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      const fallback = defaultValue();
      const raw = data?.value as unknown;
      const obj = typeof raw === "object" && raw ? (raw as Record<string, unknown>) : null;
      const directorRaw =
        obj && typeof obj.director === "object" && obj.director ? (obj.director as Record<string, unknown>) : null;
      const principalRaw =
        obj && typeof obj.principal === "object" && obj.principal ? (obj.principal as Record<string, unknown>) : null;

      const next: DeskValue = {
        director: {
          name: typeof directorRaw?.name === "string" ? directorRaw.name : fallback.director.name,
          role: typeof directorRaw?.role === "string" ? directorRaw.role : fallback.director.role,
          message: typeof directorRaw?.message === "string" ? directorRaw.message : fallback.director.message,
          quote: typeof directorRaw?.quote === "string" ? directorRaw.quote : fallback.director.quote,
          motto: typeof directorRaw?.motto === "string" ? directorRaw.motto : fallback.director.motto,
          image: typeof directorRaw?.image === "string" ? normalizeUrl(directorRaw.image) : fallback.director.image,
        },
        principal: {
          name: typeof principalRaw?.name === "string" ? principalRaw.name : fallback.principal.name,
          role: typeof principalRaw?.role === "string" ? principalRaw.role : fallback.principal.role,
          message: typeof principalRaw?.message === "string" ? principalRaw.message : fallback.principal.message,
          quote: typeof principalRaw?.quote === "string" ? principalRaw.quote : fallback.principal.quote,
          motto: typeof principalRaw?.motto === "string" ? principalRaw.motto : fallback.principal.motto,
          image: typeof principalRaw?.image === "string" ? normalizeUrl(principalRaw.image) : fallback.principal.image,
        },
        fit: obj && obj.fit === "contain" ? "contain" : "cover",
      };

      setDesk(next);
      setServerDesk(next);
      setDirectorFile(null);
      setPrincipalFile(null);
      setDirectorPreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
      setPrincipalPreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
      setDisplayVersion(Date.now());

      const versionFromValue = obj?.version;
      const version = typeof versionFromValue === "number" ? versionFromValue : (data?.updated_at ?? null);
      if (version) setDisplayVersion(Date.now());
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load Leaders Desk" });
    } finally {
      setLoading(false);
    }
  }, [defaultValue]);

  useEffect(() => {
    load();
  }, [load]);

  const pickDirector = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setDirectorFile(file);
    setDirectorPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const pickPrincipal = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setPrincipalFile(file);
    setPrincipalPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const removeDirectorImage = () => {
    setDesk((p) => ({ ...p, director: { ...p.director, image: "" } }));
    setDirectorFile(null);
    setDirectorPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const removePrincipalImage = () => {
    setDesk((p) => ({ ...p, principal: { ...p.principal, image: "" } }));
    setPrincipalFile(null);
    setPrincipalPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const nextDesk: DeskValue = {
        director: { ...desk.director, image: normalizeUrl(desk.director.image) },
        principal: { ...desk.principal, image: normalizeUrl(desk.principal.image) },
        fit: desk.fit === "contain" ? "contain" : "cover",
      };

      const { data: folderItems } = await supabase.storage.from(STORAGE_BUCKET).list(DESK_FOLDER, { limit: 100 });

      const maybeDelete = async (base: string) => {
        const toDelete =
          folderItems
            ?.filter((item) => item.name === base || item.name.startsWith(`${base}.`))
            .map((item) => `${DESK_FOLDER}/${item.name}`) ?? [];
        if (toDelete.length > 0) await supabase.storage.from(STORAGE_BUCKET).remove(toDelete);
      };

      const directorRemoving =
        nextDesk.director.image.trim().length === 0 && serverDesk.director.image.trim().length > 0;
      const principalRemoving =
        nextDesk.principal.image.trim().length === 0 && serverDesk.principal.image.trim().length > 0;

      if (directorFile || directorRemoving) await maybeDelete("director");
      if (principalFile || principalRemoving) await maybeDelete("principal");

      if (directorFile) {
        const path = `${DESK_FOLDER}/director`;
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, directorFile, {
          upsert: true,
          contentType: directorFile.type,
        });
        if (uploadError) {
          setMessage({ type: "error", text: uploadError.message });
          return;
        }
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        nextDesk.director.image = data.publicUrl;
      }

      if (principalFile) {
        const path = `${DESK_FOLDER}/principal`;
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, principalFile, {
          upsert: true,
          contentType: principalFile.type,
        });
        if (uploadError) {
          setMessage({ type: "error", text: uploadError.message });
          return;
        }
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        nextDesk.principal.image = data.publicUrl;
      }

      const payload: DeskValue = {
        director: {
          ...nextDesk.director,
          name: nextDesk.director.name.trim(),
          role: nextDesk.director.role.trim(),
          message: nextDesk.director.message.trim(),
          quote: nextDesk.director.quote.trim(),
          motto: nextDesk.director.motto.trim(),
          image: normalizeUrl(nextDesk.director.image),
        },
        principal: {
          ...nextDesk.principal,
          name: nextDesk.principal.name.trim(),
          role: nextDesk.principal.role.trim(),
          message: nextDesk.principal.message.trim(),
          quote: nextDesk.principal.quote.trim(),
          motto: nextDesk.principal.motto.trim(),
          image: normalizeUrl(nextDesk.principal.image),
        },
        fit: nextDesk.fit === "contain" ? "contain" : "cover",
        version: Date.now(),
      };

      const { error } = await supabase
        .from(SITE_SETTINGS_TABLE)
        .upsert({ key: HOME_DESK_KEY, value: payload }, { onConflict: "key" });
      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      setDesk(payload);
      setServerDesk(payload);
      setDirectorFile(null);
      setPrincipalFile(null);
      setDirectorPreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
      setPrincipalPreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
      setDisplayVersion(Date.now());
      setMessage({ type: "success", text: "Leaders Desk updated" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save Leaders Desk" });
    } finally {
      setSaving(false);
    }
  };

  const directorSrc =
    directorPreview ||
    (desk.director.image ? `${normalizeUrl(desk.director.image)}?v=${encodeURIComponent(String(displayVersion))}` : "");
  const principalSrc =
    principalPreview ||
    (desk.principal.image
      ? `${normalizeUrl(desk.principal.image)}?v=${encodeURIComponent(String(displayVersion))}`
      : "");

  return (
    <div className="border rounded-3xl overflow-hidden">
      <div className=" text-white px-6 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-school-gold/20 text-school-gold text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-3">
              Leadership
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading || saving}
              className="border border-white/20 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 disabled:opacity-60"
            >
              {loading ? "Loading..." : "Reload"}
            </button>
            <button
              onClick={save}
              disabled={!dirty || saving || loading}
              className="bg-school-gold text-school-dark px-4 py-2 rounded-lg text-sm font-semibold hover:bg-school-gold/90 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {message ? (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <div className="text-sm font-semibold text-gray-900">Images</div>
            <div className="text-xs text-gray-500">Choose how uploaded photos fit inside the frame.</div>
          </div>
          <div className="flex items-center rounded-xl border overflow-hidden">
            <button
              type="button"
              onClick={() => setDesk((p) => ({ ...p, fit: "cover" }))}
              disabled={saving || loading}
              className={`px-4 py-2 text-sm ${
                desk.fit === "cover" ? "bg-school-dark text-white" : "bg-white text-gray-700 hover:bg-gray-50"
              } disabled:opacity-60`}
            >
              Cover
            </button>
            <button
              type="button"
              onClick={() => setDesk((p) => ({ ...p, fit: "contain" }))}
              disabled={saving || loading}
              className={`px-4 py-2 text-sm ${
                desk.fit === "contain" ? "bg-school-dark text-white" : "bg-white text-gray-700 hover:bg-gray-50"
              } disabled:opacity-60`}
            >
              Contain
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b">
              <div className="text-xs font-bold tracking-widest uppercase text-school-gold">
                {desk.director.role.trim() || "Director"}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {desk.director.name.trim() || "Primary leadership message"}
              </div>
            </div>
            <div className="p-5 grid sm:grid-cols-[220px_1fr] gap-5">
              <div className="border rounded-xl overflow-hidden bg-gray-100">
                <div className="relative h-56">
                  {directorSrc ? (
                    desk.fit === "contain" ? (
                      <>
                        <Image
                          src={directorSrc}
                          alt=""
                          fill
                          sizes="220px"
                          className="object-cover scale-110 blur-2xl"
                          aria-hidden
                          unoptimized={directorSrc.startsWith("blob:")}
                        />
                        <Image
                          src={directorSrc}
                          alt={desk.director.name || "Director"}
                          fill
                          sizes="220px"
                          className="object-contain"
                          unoptimized={directorSrc.startsWith("blob:")}
                        />
                      </>
                    ) : (
                      <Image
                        src={directorSrc}
                        alt={desk.director.name || "Director"}
                        fill
                        sizes="220px"
                        className="object-cover"
                        unoptimized={directorSrc.startsWith("blob:")}
                      />
                    )
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">No image</div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <SingleImageDropzone disabled={saving || loading} onPick={(file) => pickDirector(file)} />
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-gray-500 truncate">
                      {directorPreview ? "Preview (not saved)" : desk.director.image ? "Saved" : "Empty"}
                    </div>
                    <button
                      type="button"
                      onClick={removeDirectorImage}
                      disabled={saving || loading || !directorSrc}
                      className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60 bg-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="admin-desk-director-name" className="block text-xs font-semibold text-gray-700">
                    Name
                  </label>
                  <input
                    id="admin-desk-director-name"
                    value={desk.director.name}
                    onChange={(e) => setDesk((p) => ({ ...p, director: { ...p.director, name: e.target.value } }))}
                    placeholder="Name"
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="admin-desk-director-role" className="block text-xs font-semibold text-gray-700">
                    Role
                  </label>
                  <input
                    id="admin-desk-director-role"
                    value={desk.director.role}
                    onChange={(e) => setDesk((p) => ({ ...p, director: { ...p.director, role: e.target.value } }))}
                    placeholder="Role (e.g., Director)"
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="admin-desk-director-quote" className="block text-xs font-semibold text-gray-700">
                    Highlight quote (optional)
                  </label>
                  <textarea
                    id="admin-desk-director-quote"
                    value={desk.director.quote}
                    onChange={(e) =>
                      setDesk((p) => ({
                        ...p,
                        director: { ...p.director, quote: capitalizeFirstLetter(e.target.value) },
                      }))
                    }
                    placeholder="Highlight quote (optional)"
                    rows={3}
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="admin-desk-director-motto" className="block text-xs font-semibold text-gray-700">
                    Motto (optional)
                  </label>
                  <textarea
                    id="admin-desk-director-motto"
                    value={desk.director.motto}
                    onChange={(e) =>
                      setDesk((p) => ({
                        ...p,
                        director: { ...p.director, motto: capitalizeFirstLetter(e.target.value) },
                      }))
                    }
                    placeholder="Our motto (optional)"
                    rows={2}
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="admin-desk-director-message" className="block text-xs font-semibold text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="admin-desk-director-message"
                    value={desk.director.message}
                    onChange={(e) =>
                      setDesk((p) => ({
                        ...p,
                        director: { ...p.director, message: capitalizeFirstLetter(e.target.value) },
                      }))
                    }
                    placeholder="Message"
                    rows={10}
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b">
              <div className="text-xs font-bold tracking-widest uppercase text-school-orange">
                {desk.principal.role.trim() || "Principal"}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {desk.principal.name.trim() || "Message with optional highlight quote"}
              </div>
            </div>
            <div className="p-5 grid sm:grid-cols-[220px_1fr] gap-5">
              <div className="border rounded-xl overflow-hidden bg-gray-100">
                <div className="relative h-56">
                  {principalSrc ? (
                    desk.fit === "contain" ? (
                      <>
                        <Image
                          src={principalSrc}
                          alt=""
                          fill
                          sizes="220px"
                          className="object-cover scale-110 blur-2xl"
                          aria-hidden
                          unoptimized={principalSrc.startsWith("blob:")}
                        />
                        <Image
                          src={principalSrc}
                          alt={desk.principal.name || "Principal"}
                          fill
                          sizes="220px"
                          className="object-contain"
                          unoptimized={principalSrc.startsWith("blob:")}
                        />
                      </>
                    ) : (
                      <Image
                        src={principalSrc}
                        alt={desk.principal.name || "Principal"}
                        fill
                        sizes="220px"
                        className="object-cover"
                        unoptimized={principalSrc.startsWith("blob:")}
                      />
                    )
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">No image</div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <SingleImageDropzone disabled={saving || loading} onPick={(file) => pickPrincipal(file)} />
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-gray-500 truncate">
                      {principalPreview ? "Preview (not saved)" : desk.principal.image ? "Saved" : "Empty"}
                    </div>
                    <button
                      type="button"
                      onClick={removePrincipalImage}
                      disabled={saving || loading || !principalSrc}
                      className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-60 bg-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="admin-desk-principal-name" className="block text-xs font-semibold text-gray-700">
                    Name
                  </label>
                  <input
                    id="admin-desk-principal-name"
                    value={desk.principal.name}
                    onChange={(e) => setDesk((p) => ({ ...p, principal: { ...p.principal, name: e.target.value } }))}
                    placeholder="Name"
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="admin-desk-principal-role" className="block text-xs font-semibold text-gray-700">
                    Role
                  </label>
                  <input
                    id="admin-desk-principal-role"
                    value={desk.principal.role}
                    onChange={(e) => setDesk((p) => ({ ...p, principal: { ...p.principal, role: e.target.value } }))}
                    placeholder="Role (e.g., Principal)"
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="admin-desk-principal-quote" className="block text-xs font-semibold text-gray-700">
                    Highlight quote (optional)
                  </label>
                  <textarea
                    id="admin-desk-principal-quote"
                    value={desk.principal.quote}
                    onChange={(e) =>
                      setDesk((p) => ({
                        ...p,
                        principal: { ...p.principal, quote: capitalizeFirstLetter(e.target.value) },
                      }))
                    }
                    placeholder="Highlight quote (optional)"
                    rows={3}
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="admin-desk-principal-motto" className="block text-xs font-semibold text-gray-700">
                    Motto (optional)
                  </label>
                  <textarea
                    id="admin-desk-principal-motto"
                    value={desk.principal.motto}
                    onChange={(e) =>
                      setDesk((p) => ({
                        ...p,
                        principal: { ...p.principal, motto: capitalizeFirstLetter(e.target.value) },
                      }))
                    }
                    placeholder="Motto (optional)"
                    rows={2}
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="admin-desk-principal-message" className="block text-xs font-semibold text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="admin-desk-principal-message"
                    value={desk.principal.message}
                    onChange={(e) =>
                      setDesk((p) => ({
                        ...p,
                        principal: { ...p.principal, message: capitalizeFirstLetter(e.target.value) },
                      }))
                    }
                    placeholder="Message"
                    rows={7}
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/40"
                    disabled={saving || loading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [active, setActive] = useState<AdminSectionKey>(() => {
    if (typeof window === "undefined") return "hero";
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("section");
    const fromStorage = localStorage.getItem(ADMIN_ACTIVE_SECTION_KEY);
    const candidate = (fromUrl ?? fromStorage ?? "hero") as AdminSectionKey;
    return ADMIN_SECTIONS.includes(candidate) ? candidate : "hero";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    const sync = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setUser(data.session?.user ?? null);
    };

    sync();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    setSigningOut(false);
  };

  const navItems = useMemo(
    (): AdminNavItem[] => [
      { key: "hero", label: "Hero Section", icon: Star },
      { key: "about", label: "About", icon: Users },
      { key: "programs", label: "Programs", icon: Award },
      { key: "memories", label: "Memories", icon: Star },
      { key: "desk", label: "Leaders Desk", icon: Users },
      { key: "news", label: "News & Announcements", icon: FileText },
      { key: "life", label: "Life at School", icon: Users },
      { key: "gallery", label: "Gallery", icon: ImageIcon },
      { key: "events", label: "Events", icon: Calendar },
      { key: "blogs", label: "Blogs", icon: BookOpen },
      { key: "contacts", label: "Contact Messages", icon: MessageSquare },
    ],
    [],
  );

  useEffect(() => {
    localStorage.setItem(ADMIN_ACTIVE_SECTION_KEY, active);
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    params.set("section", active);
    const qs = params.toString();
    router.replace(qs.length > 0 ? `${pathname}?${qs}` : pathname);
  }, [active, pathname, router]);

  const activeItem = navItems.find((i) => i.key === active);

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6 min-h-screen p-6">
      <AdminNav
        userEmail={user?.email ?? undefined}
        navItems={navItems}
        active={active}
        onSelectAction={(key) => {
          setActive(key);
          setMobileMenuOpen(false);
        }}
        onSignOutAction={handleSignOut}
        signingOut={signingOut}
      />

      <div className="bg-white border rounded-3xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{activeItem?.label || "Dashboard"}</h1>
            <p className="text-gray-500 text-sm">Manage content for this section</p>
          </div>

          <button className="lg:hidden border px-3 py-2 rounded" onClick={() => setMobileMenuOpen(true)}>
            Menu
          </button>
        </div>

        <div className="mt-6">
          {active === "hero" ? (
            <div className="space-y-6">
              <HeroImagesEditor />
              <HomeNotificationsEditor />
            </div>
          ) : active === "about" ? (
            <AboutEditor />
          ) : active === "programs" ? (
            <ProgramsActivitiesEditor />
          ) : active === "memories" ? (
            <MemoriesEditor />
          ) : active === "desk" ? (
            <LeadersDeskEditor />
          ) : active === "news" ? (
            <HomeNewsEditor />
          ) : active === "life" ? (
            <LifeEditor />
          ) : active === "gallery" ? (
            <GalleryEditor />
          ) : active === "events" ? (
            <EventsEditor />
          ) : active === "blogs" ? (
            <BlogsEditor />
          ) : active === "contacts" ? (
            <ContactMessagesViewer adminUserId={user?.id ?? undefined} />
          ) : (
            <div className="p-6 border rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} />
                <div className="font-bold">Editor</div>
              </div>
              <p className="text-sm text-gray-500">Select a section and connect it with Supabase CRUD operations.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="absolute left-4 right-4 top-4 bottom-4">
            <AdminNav
              mobile
              userEmail={user?.email ?? undefined}
              navItems={navItems}
              active={active}
              onSelectAction={(key) => {
                setActive(key);
                setMobileMenuOpen(false);
              }}
              onSignOutAction={handleSignOut}
              signingOut={signingOut}
            />
          </div>
        </div>
      )}
    </div>
  );
}
