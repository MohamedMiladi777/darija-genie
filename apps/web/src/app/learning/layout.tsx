import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function SideBarLayout({
  children,
}: {
  Children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
      </main>
    </SidebarProvider>
  )
}
