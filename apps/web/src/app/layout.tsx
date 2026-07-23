import { Geist_Mono, Open_Sans } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"

// Shared components are coded here

// Code the sidebar.
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
      className={cn("antialiased", fontMono.variable, openSans.variable, "font-sans")}
    >
      <body className="bg-[#f2efe4] text-[#162456]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
