import type { LucideIcon } from "lucide-react";

export type AdminSectionKey =
    | "hero"
    | "about"
    | "programs"
    | "memories"
    | "desk"
    | "news"
    | "life"
    | "gallery"
    | "events"
    | "blogs"
    | "contacts";

export type AdminNavItem = {
    key: AdminSectionKey;
    label: string;
    icon: LucideIcon;
};
