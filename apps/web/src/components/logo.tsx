import Image from "next/image"

const logo = "/assets/images/logo.svg"
const logoDark = "/assets/images/logo-dark-mode.svg"

export default function LogoMark() {
  return (
    <div className="flex items-center justify-center">
      <Image
        src={logo}
        alt="Darija Genie Logo"
        width={500}
        height={440}
        className="w-70 sm:w-70 md:w-90 lg:w-100 xl:w-100 2xl:w-120"
      />
    </div>
  )
}

export function LogoMarkDark() {
  return (
    <div className="flex h-[84px] w-[95px] shrink-0 items-center justify-center">
      <Image
        src={logoDark}
        alt="Darija Genie Logo"
        width={95}
        height={84}
        priority
        className="h-[84px] w-[95px]"
      />
    </div>
  )
}
