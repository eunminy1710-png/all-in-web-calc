'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ALL_LINKS = [
  { label: '대시보드', href: '/dashboard' },
  { label: '부동산 / 대출', href: '/calculators/real-estate' },
  { label: '투자 / 가상자산', href: '/calculators/investment' },
  { label: '글로벌 소싱', href: '/calculators/sourcing' },
  { label: '육아 영양', href: '/calculators/nutrition' },
  { label: '인사이트 리포트', href: '/report' },
]

export default function MobileHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="md:hidden border-b border-[var(--border)] bg-white px-4 py-3 flex items-center justify-between relative">
      <span className="font-bold text-sm">ALL-IN-WEB CALC</span>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded text-[var(--muted-foreground)]"
        aria-label="메뉴 열기"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-[var(--border)] z-50 shadow-sm">
          {ALL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-3 text-sm border-b border-[var(--border)] last:border-0 ${
                pathname === link.href ? 'font-medium bg-[var(--muted)]' : 'text-[var(--muted-foreground)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
