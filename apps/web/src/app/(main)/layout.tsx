import { SidebarProvider } from "@workspace/ui/components/sidebar"
import AppSidebar from "@/components/app-sidebar"
import LearningMobileNavigation from "@/components/learning-navigation-mobile"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="relative flex w-full min-w-0 flex-1 flex-col bg-background">
        {children}
      </div>
      <LearningMobileNavigation />
    </SidebarProvider>
  )
}
