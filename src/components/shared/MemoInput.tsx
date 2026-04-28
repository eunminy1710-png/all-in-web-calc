'use client'

import { useState } from 'react'
import { useCalcStore } from '@/store/useCalcStore'
import type { ScenarioKey } from '@/types'

interface MemoInputProps {
  calculatorId: string
  scenarioKey: ScenarioKey
}

export default function MemoInput({ calculatorId, scenarioKey }: MemoInputProps) {
  const { memos, addMemo, deleteMemo } = useCalcStore()
  const [text, setText] = useState('')

  const filtered = memos.filter(
    (m) => m.calculatorId === calculatorId && m.scenarioKey === scenarioKey
  )

  function handleSave() {
    if (!text.trim()) return
    addMemo({ calculatorId, scenarioKey, content: text.trim() })
    setText('')
  }

  return (
    <div className="bg-white rounded-lg border border-[var(--border)] p-4 space-y-3">
      <p className="text-sm font-medium">메모</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="계산 결과에 대한 메모를 입력하세요"
          className="flex-1 text-sm border border-[var(--border)] rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
        <button
          onClick={handleSave}
          className="px-3 py-2 bg-[var(--primary)] text-white text-sm rounded-md hover:opacity-90 transition-opacity"
        >
          저장
        </button>
      </div>
      {filtered.length > 0 && (
        <ul className="space-y-1">
          {filtered.map((memo) => (
            <li
              key={memo.id}
              className="flex items-start justify-between gap-2 text-sm text-[var(--muted-foreground)]"
            >
              <span>{memo.content}</span>
              <button
                onClick={() => deleteMemo(memo.id)}
                className="text-xs hover:text-[var(--loss)] shrink-0"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
