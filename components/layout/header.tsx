'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  userName: string
  onLogout: () => void
}

export default function Header({ userName, onLogout }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-primary">📊</span>
        <span className="text-base font-semibold text-gray-800">
          영업 일일 보고 시스템
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{userName}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="flex items-center gap-1 text-gray-600 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </header>
  )
}
