import LogoMark from "@/components/logo"
import { Button } from "@workspace/ui/components/button"

function MainContent() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 overflow-visible px-16 pb-8 lg:flex-row xl:flex-row 2xl:flex-row">
      <div className="size- flex flex-col items-center justify-center rounded-lg px-8 py-3">
        <div className="justify-start text-base leading-6 font-medium text-neutral-50">
          <LogoMark />
        </div>
      </div>
      <div className="inline-flex max-w-96 flex-col md:items-start md:justify-start gap-6">
        <div className="flex w-96 text-center font-['Lato'] text-3xl leading-10 font-bold tracking-tight text-blue-950 md:text-left">
          Learn Moroccan Darija with DarijaGenie
        </div>
        <div className="flex flex-col justify-start opacity-80 md:items-start">
          <div className="justify-start text-center font-['Open_Sans'] text-lg leading-7 font-normal text-blue-950 md:text-left">
            A Darija Friendly learning platform to enhance your listening and
            reading skills.
          </div>
        </div>
        {/* <div className="flex flex-col items-center justify-center rounded-lg bg-blue-950 px-8 py-3"> */}
        {/* <div className="justify-start text-center font-['Lato'] text-base leading-6 font-medium text-neutral-50">
            Get Started
          </div> */}
        <div className="flex flex-col items-center">
          <div className="flex">
            <Button
              className="bg-sky-950 text-white "
              variant="default"
              size="lg"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WelcomeScreen() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <div>
        <MainContent />
      </div>
    </main>
  )
}
