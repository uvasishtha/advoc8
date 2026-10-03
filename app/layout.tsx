import type { Metadata } from "next";
import { Newsreader, DM_Sans } from "next/font/google";
import { AppSidebar } from "@/components/layout/AppSidebar";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Advoc8 — Your health deserves to be heard",
  description: "Track your symptoms, understand patterns, and advocate for your health.",
};

const dashboardRoutes = ["/home", "/track", "/insights", "/visit", "/report", "/settings"];

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isDashboard = dashboardRoutes.some((route) => pathname.startsWith(route));

  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {isDashboard ? <AppSidebar>{children}</AppSidebar> : children}
      </body>
    </html>
  );
}
