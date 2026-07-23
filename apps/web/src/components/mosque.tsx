import Image from "next/image"

const src = "/assets/images/mosque.svg"

export default function MosqueMark() {
  return (
    <div className="flex w-full justify-center lg:w-auto">
      <Image
        src={src}
        alt="Darija Genie lamp"
        width={355}
        height={397}
        className="h-auto w-[355px] max-w-full"
      />
    </div>
  )
}
