

import LogoMark from "@/components/logo"

// const logo = "/assets/images/logo.svg"

// function LogoMark() {
//   return (
//     <div className="flex items-center justify-center">
//       <Image src={logo} alt="Darija Genie Logo" width={500} height={440} className="w-70 xl:w-100 2xl:w-120 lg:w-100 md:w-90 sm:w-70"/>
//     </div>
//   )
// }

export default function SplashScreen() {
  return (
    <main className="flex min-h-svh justify-center bg-[#f2efe4] text-[#162456]">
      <LogoMark />
    </main>
  )
}
