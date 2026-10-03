import { DM_Sans, Newsreader } from "next/font/google";
import { DataProvider } from "@/components/providers/DataProvider";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Advoc8 — Turn “something feels wrong” into evidence",
  description:
    "Advoc8 helps you track recurring symptoms, find patterns in your own records, and build an Evidence Brief to bring to your doctor.",
};

export const viewport = {
  themeColor: "#FFFBFC",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground">
        {/* Lives here rather than in the app layout so the landing page can load
            the sample data before anyone enters the app. */}
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}