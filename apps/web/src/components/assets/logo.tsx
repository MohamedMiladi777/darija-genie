import Image from "next/image"

const logo = "/assets/images/logo.svg"
const logoDark = "/assets/images/logo-dark-mode.svg"
const logoMark = "/assets/images/logo-mark.svg"

export default function LogoMark({
  className = "w-70 sm:w-70 md:w-90 lg:w-100 xl:w-100 2xl:w-120",
  priority = false,
}: {
  className?: string
  priority?: boolean
}) {
  return (
    <div className="flex items-center justify-center">
      <Image
        src={logo}
        alt="Darija Genie Logo"
        width={500}
        height={440}
        priority={priority}
        className={`${className} dark:hidden`}
      />
      <Image
        src={logoDark}
        alt="Darija Genie Logo"
        width={500}
        height={440}
        priority={priority}
        className={`${className} hidden dark:block`}
      />
    </div>
  )
}

export function LogoMarkDark({
  className = "h-[84px] w-[95px]",
}: {
  className?: string
}) {
  return (
    <div className={`flex shrink-0 items-center justify-center ${className}`}>
      <Image
        src={logoDark}
        alt="Darija Genie Logo"
        width={95}
        height={84}
        priority
        className="size-full"
      />
    </div>
  )
}

/**
 * Compact "D" monogram cropped from the brand mark.
 * Used by the sidebar when it collapses to the icon rail.
 */
export function LogoMarkCompact({
  className = "h-8 w-auto",
}: {
  className?: string
}) {
  return (
    <Image
      src={logoMark}
      alt="Darija Genie"
      width={119}
      height={96}
      priority
      className={className}
    />
  )
}
