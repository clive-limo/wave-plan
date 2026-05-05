import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopBar } from "@/components/layout/top-bar";
import { CelebrationProvider } from "@/contexts/celebration-context";
import { CelebrationOverlay } from "@/components/gamification/celebration-overlay";
import { StreakValidator } from "@/components/gamification/streak-validator";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CelebrationProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar />
          <main className="flex-1 pb-20 md:pb-0">
            <div className="max-w-[1600px] mx-auto px-4 lg:px-6 xl:px-10 py-6">
              {children}
            </div>
          </main>
        </div>
        <MobileNav />
      </div>
      <StreakValidator />
      <CelebrationOverlay />
    </CelebrationProvider>
  );
}
