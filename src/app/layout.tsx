import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Growwell School",
    default: "Growwell School | Growing To The Optimum",
  },
  description:
    "Growwell School, Kharar — CBSE affiliated co-educational school focused on holistic learning. Admissions open for session 2026-27.",
  applicationName: "Growwell School",
  keywords: [
    "Growwell School",
    "Growwell School Kharar",
    "CBSE school in Kharar",
    "Best school in Kharar",
    "Admissions 2026-27",
    "Co-educational school",
  ],
  openGraph: {
    title: "Growwell School | Growing To The Optimum",
    description:
      "Growwell School, Kharar — CBSE affiliated co-educational school focused on holistic learning. Admissions open for session 2026-27.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Growwell School | Growing To The Optimum",
    description:
      "Growwell School, Kharar — CBSE affiliated co-educational school focused on holistic learning. Admissions open for session 2026-27.",
  },
  icons: {
    icon: [{ url: "/images/logo.png", type: "image/png" }],
    apple: [{ url: "/images/logo.png", type: "image/png" }],
    shortcut: [{ url: "/images/logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
