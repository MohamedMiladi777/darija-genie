/* eslint-disable @next/next/no-img-element */
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import Image from "next/image"

import LogoMark from "@/components/logo"

export default function SplashScreen() {
  return (
    <main className="flex min-h-svh justify-center bg-[#f2efe4] text-[#162456]">
      <LogoMark />
    </main>
  )
}
