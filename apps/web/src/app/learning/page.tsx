import { FlaskConical, GraduationCap, Settings } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import ContinueSessionSection from "@/components/ContinueSessionSection";
import Header from "@/components/Header";
import QuizSection from "@/components/QuizSection"; 
import ScenarioSection from "@/components/ScenarioSection";
const navigationItems = [
  {
    value: "testing",
    label: "Testing",
    icon: FlaskConical,
  },
  {
    value: "learning",
    label: "Learning",
    icon: GraduationCap,
  },
  {
    value: "settings",
    label: "Settings",
    icon: Settings,
  },
];

const LearningPage = (): React.JSX.Element => {
  return (
    <main className="min-h-screen w-full bg-[#f2efe4] text-black">
      <div className="mx-auto flex min-h-screen w-full max-w-[402px] flex-col overflow-hidden rounded-t-[8.06px] bg-[#f2efe4]">
        <div className="flex min-h-0 flex-1 flex-col">
          <Header />
          <ContinueSessionSection />
          <ScenarioSection />
          <QuizSection />
        </div>
        <nav
          aria-label="Primary navigation"
          className="sticky bottom-0 mt-auto border-t border-[#c6b89b] bg-[#ebe0ca]"
        >
          <Tabs defaultValue="learning" className="w-full">
            <TabsList className="grid h-[55px] w-full grid-cols-3 rounded-none bg-transparent p-0">
              {navigationItems.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="h-full rounded-none px-2 font-text-base-leading-regular-medium text-[16px] leading-6 text-black data-[state=active]:bg-[#1447e6] data-[state=active]:text-white"
                >
                  <Icon aria-hidden="true" className="mr-1 size-4" />
                  <span>{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </nav>
      </div>
    </main>
  );
};

export default LearningPage;
