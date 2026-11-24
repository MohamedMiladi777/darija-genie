import Image from "next/image"

const src = "/assets/images/atay.webp"

export default function AtayMark() {
  return (
    <div className="flex w-full justify-center lg:w-auto">
      <Image
        src={src}
        alt="Darija Genie tea pourer"
        width={900}
        height={1200}
        unoptimized
        loading="eager"
        fetchPriority="high"
        sizes="(max-width: 1024px) 90vw, 28rem"
        className="h-auto w-[clamp(16rem,44dvh,28rem)] max-w-full"
      />
    </div>
  )
}
