import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Dylan's Notes",
    template: "%s · Dylan's Notes",
  },
  description:
    "Independent research on physical & embodied AI, a reading library, and a little life — by Dylan Guai.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body>
        <div className="mx-auto flex min-h-screen max-w-[760px] flex-col px-5 sm:px-6">
          <SiteHeader />
          <main className="flex-1 py-10 sm:py-14">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
