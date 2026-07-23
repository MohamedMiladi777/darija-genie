import Image from "next/image"

const src = "/assets/images/atay.svg"

export default function AtayMark() {
  return (
    <div className="flex w-full justify-center lg:w-auto">
      <Image
        src={src}
        alt="Darija Genie lamp"
        width={150}
        height={200}
        className="h-auto w-[150px] max-w-full"
      />
    </div>
  )
}
