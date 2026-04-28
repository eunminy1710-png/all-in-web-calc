'use client'

import { useCalcStore } from '@/store/useCalcStore'

export default function ScenarioTabs() {
  const { activeScenario, setActiveScenario } = useCalcStore()

  return (
    <div className="flex gap-1 bg-[var(--muted)] rounded-lg p-1 w-fit">
      {(['A', 'B'] as const).map((key) => (
        <button
          key={key}
          onClick={() => setActiveScenario(key)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeScenario === key
              ? 'bg-white text-[var(--foreground)] shadow-sm'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          시나리오 {key}
        </button>
      ))}
    </div>
  )
}
