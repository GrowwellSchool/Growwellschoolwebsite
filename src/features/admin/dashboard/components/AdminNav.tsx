"use client";

import { LogOut, ShieldCheck } from "lucide-react";

import type { AdminNavItem, AdminSectionKey } from "../types";

export function AdminNav({
  mobile = false,
  userEmail,
  navItems,
  active,
  onSelectAction,
  onSignOutAction,
  signingOut,
}: {
  mobile?: boolean;
  userEmail?: string;
  navItems: AdminNavItem[];
  active: AdminSectionKey;
  onSelectAction: (key: AdminSectionKey) => void;
  onSignOutAction: () => void;
  signingOut: boolean;
}) {
  return (
    <div
      className={`${
        mobile ? "h-full" : "hidden lg:flex lg:sticky lg:top-28 lg:h-[calc(100vh-7rem)]"
      } bg-white border rounded-3xl shadow-xl flex flex-col`}
    >
      <div className="px-6 py-5 border-b">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-green-600" />
          <div>
            <div className="font-bold">Admin</div>
            <div className="text-xs text-gray-500">{userEmail ?? "Signed in"}</div>
          </div>
        </div>
      </div>

      <div className="p-3 flex-1 overflow-y-auto min-h-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;

          return (
            <button
              key={item.key}
              onClick={() => onSelectAction(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                isActive ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        <button
          onClick={onSignOutAction}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg"
        >
          <LogOut size={16} />
          {signingOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
