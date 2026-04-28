'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: '대시보드', href: '/dashboard' },
  {
    label: '계산기',
    children: [
      { label: '부동산 / 대출', href: '/calculators/real-estate' },
      { label: '투자 / 가상자산', href: '/calculators/investment' },
      { label: '글로벌 소싱', href: '/calculators/sourcing' },
      { label: '육아 영양', href: '/calculators/nutrition' },
    ],
  },
  { label: '인사이트 리포트', href: '/report' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 h-full border-r border-[var(--border)] bg-white flex flex-col">
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <span className="text-base font-bold tracking-tight text-[var(--foreground)]">
          ALL-IN-WEB CALC
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) =>
          'children' in item && item.children ? (
            <div key={item.label} className="mb-1">
              <p className="px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                {item.label}
              </p>
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                    pathname === child.href
                      ? 'bg-[var(--muted)] text-[var(--foreground)] font-medium'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm transition-colors mb-1 ${
                pathname === item.href
                  ? 'bg-[var(--muted)] text-[var(--foreground)] font-medium'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {item.label}
            </Link>
          )
        )}
      </nav>
    </aside>
  )
}
