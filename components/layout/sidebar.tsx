'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FileText,
  Users,
  UserCog,
  LayoutDashboard,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'SALESPERSON' | 'MANAGER'

interface SidebarProps {
  role: Role
}

const salespersonMenus = [
  { href: '/reports', label: '일일 보고서', icon: FileText },
  { href: '/customers', label: '고객 목록', icon: Users },
]

const managerMenus = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/reports', label: '보고서 조회', icon: ClipboardList },
  { href: '/customers', label: '고객 마스터', icon: Users },
  { href: '/employees', label: '영업사원 관리', icon: UserCog },
]

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const menus = role === 'MANAGER' ? managerMenus : salespersonMenus

  return (
    <aside className="flex w-56 flex-col border-r bg-gray-50">
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {menus.map((menu) => {
            const Icon = menu.icon
            const isActive =
              pathname === menu.href || pathname.startsWith(menu.href + '/')
            return (
              <li key={menu.href}>
                <Link
                  href={menu.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {menu.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
