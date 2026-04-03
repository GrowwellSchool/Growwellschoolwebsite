import type { LucideIcon } from "lucide-react";

export type AdminSectionKey =
    | "hero"
    | "about"
    | "memories"
    | "desk"
    | "news"
    | "gallery"
    | "events"
    | "blogs"
    | "contacts";

export type AdminNavItem = {
    key: AdminSectionKey;
    label: string;
    icon: LucideIcon;
};
