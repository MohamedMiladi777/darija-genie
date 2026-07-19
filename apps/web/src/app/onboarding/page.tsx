/* eslint-disable @next/next/no-img-element */

import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import Image from "next/image"

const logo = "/assets/images/logo.svg"

function LogoMark() {
  return (
    <div className="flex items-center justify-center">
      <img src="/assets/images/logo.svg" alt="Darija Genie Logo"  className="w-70 xl:w-100 2xl:w-120 lg:w-100 md:w-90 sm:w-70"/>
    </div>
  )
}

export default function SplashScreen() {
  return (
    <main className="flex min-h-svh justify-center bg-[#f2efe4] text-[#162456]">
      <LogoMark />
    </main>
  )
}
