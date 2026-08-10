import Image from "next/image"

const src = "/assets/images/lamp.svg"

export default function LampMark() {
  return (
    <div className="flex w-full justify-center lg:w-auto">
      <Image
        src={src}
        alt="Darija Genie lamp"
        width={271}
        height={245}
        className="h-auto w-[271px] max-w-full"
      />
    </div>
  )
}
