import "./globals.css";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "ElevateU", description: "Discover your direction. Build your future." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body><div className="flex min-h-screen flex-col">{children}<Footer /></div></body></html>;
}
