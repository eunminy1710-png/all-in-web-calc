'use client'

import { useState, useCallback } from 'react'

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  className?: string
  placeholder?: string
}

export default function NumberInput({
  value,
  onChange,
  className,
  placeholder,
}: NumberInputProps) {
  const [focused, setFocused] = useState(false)

  const displayValue = focused
    ? value === 0 ? '' : String(value)
    : value === 0 ? '' : value.toLocaleString('ko-KR')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/,/g, '')
      if (raw === '' || raw === '-') { onChange(0); return }
      const num = parseFloat(raw)
      if (!isNaN(num)) onChange(num)
    },
    [onChange]
  )

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      placeholder={placeholder}
      onChange={handleChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={className}
    />
  )
}
