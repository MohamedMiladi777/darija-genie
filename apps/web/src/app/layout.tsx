import { Geist_Mono, Nunito, Noto_Sans_Arabic } from "next/font/google"
import type { Viewport } from "next"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"

// Shared components are coded here

export const viewport: Viewport & { viewportFit: "cover" } = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

// Nunito is a friendly, rounded, highly legible Latin UI font. Keep one
// typography family across the app; Noto Sans Arabic covers Arabic glyphs.
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const arabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        nunito.variable,
        arabic.variable,
        "font-sans"
      )}
    >
      <body className="bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
