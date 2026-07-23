import { Sun } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
export const Header = (): React.JSX.Element => {
  return (
    <section
      className="flex min-h-[220px] w-full flex-col justify-between gap-[13px] bg-tailwindcss-colors-blue-blue-950 px-4 pb-[7px] pt-[7px]"
      aria-labelledby="learning-welcome-title"
    >
      <div className="flex items-start justify-between">
        <div
          className="relative h-[83.68px] w-[98.5px]"
          aria-label="Darija Tenie"
        >
          <span className="absolute left-0 top-0 [font-family:'Montserrat-Italic',Helvetica] text-[62px] font-normal italic leading-[48px] tracking-[-6px] text-white">
            D
          </span>
          <span className="absolute left-[52px] top-[30px] [font-family:'Montserrat-Italic',Helvetica] text-[16.3px] italic leading-[19.9px] text-[#c6b89b]">
            arija
          </span>
          <span className="absolute left-[23px] top-[50px] [font-family:'Montserrat-Italic',Helvetica] text-[31px] italic leading-[33px] text-white">
            T
          </span>
          <span className="absolute left-[47px] top-[63px] [font-family:'Montserrat-Italic',Helvetica] text-[11.6px] italic leading-[14.2px] text-white">
            enie
          </span>
          <span
            className="absolute left-16 top-2.5 flex h-[21px] w-[21px] items-center justify-center rounded-full border border-[#c6b89b]"
            aria-hidden="true"
          >
            <span className="h-[7px] w-[7px] rounded-full bg-[#c6b89b]" />
          </span>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-9 min-h-9 min-w-9 rounded-[var(--border-radii-rounded-lg)] bg-[#f2efe4] p-[var(--spacing-xs)] text-[#172657] hover:bg-[#f2efe4]/90"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4" strokeWidth={1.8} />
        </Button>
      </div>
      <header className="flex flex-col items-start">
        <h1
          id="learning-welcome-title"
          className="[font-family:'Open_Sans-Bold',Helvetica] text-2xl font-bold leading-[33.6px] tracking-[0] text-[#f2efe4]"
        >
          Learn Darija!
        </h1>
        <p className="[font-family:'Lato-Regular',Helvetica] text-lg font-normal leading-[27px] tracking-[-0.18px] text-colorwheelprimitives-1-grey-300">
          What would you like to learn today?
        </p>
      </header>
    </section>
  );
};

export default Header;
