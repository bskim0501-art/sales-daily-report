import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Auth context will be wired in Issue #3
  const userName = '사용자'
  const role = 'SALESPERSON' as const

  const handleLogout = () => {
    // Logout logic will be implemented in Issue #3
  }

  return (
    <div className="flex h-screen flex-col">
      <Header userName={userName} onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={role} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
