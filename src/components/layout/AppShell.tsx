import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-screen">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto bg-[var(--muted)] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
