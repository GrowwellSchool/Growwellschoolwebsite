import type { AdminSectionKey } from "./types";

export const ADMIN_ACTIVE_SECTION_KEY = "admin.activeSection";

export const ADMIN_SECTIONS: AdminSectionKey[] = [
  "hero",
  "about",
  "programs",
  "memories",
  "desk",
  "news",
  "life",
  "gallery",
  "events",
  "blogs",
  "contacts",
];

export const HOME_HERO_IMAGES_KEY = "home.heroImages";
export const HOME_NOTIFICATIONS_KEY = "home.notifications";
export const HOME_PROGRAMS_KEY = "home.programs";
export const HOME_ABOUT_KEY = "home.about";
export const HOME_MEMORIES_KEY = "home.memories";
export const HOME_DESK_KEY = "home.desk";
export const HOME_NEWS_KEY = "home.news";
export const HOME_LIFE_KEY = "home.life";
export const GALLERY_PAGE_KEY = "gallery.page";
export const EVENTS_PAGE_KEY = "events.page";
export const BLOGS_PAGE_KEY = "blogs.page";

export const SITE_SETTINGS_TABLE = "site_settings";
export const PROFILES_TABLE = "profiles";
export const CONTACT_MESSAGES_TABLE = "contact_messages";

export const STORAGE_BUCKET = "site-assets";
export const HERO_FOLDER = "home/hero";
export const PROGRAMS_FOLDER = "home/programs";
export const ABOUT_FOLDER = "home/about";
export const MEMORIES_FOLDER = "home/memories";
export const DESK_FOLDER = "home/desk";
export const NEWS_FOLDER = "home/news";
export const LIFE_FOLDER = "home/life";
export const GALLERY_FOLDER = "gallery/sections";
export const EVENTS_FOLDER = "events";
export const BLOGS_FOLDER = "blogs";

export type HeroImageFit = "cover" | "contain";
