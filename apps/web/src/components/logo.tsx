import Image from "next/image"
const logo = "/assets/images/logo.svg"

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
