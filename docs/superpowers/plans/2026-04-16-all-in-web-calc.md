# ALL-IN-WEB CALC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PRD 기반으로 Next.js 16 + Tailwind v4 위에 통합 계산기 웹 서비스(대시보드 레이아웃, 4개 전문 계산기, 시나리오 A/B 비교, 인사이트 리포트)를 구현한다.

**Architecture:** App Router 기반 페이지별 라우팅, Zustand로 전역 계산 상태·메모·리포트 관리, LocalStorage에 직렬화 저장. 순수 계산 함수는 `src/lib/calculators/`에 분리해 단위 테스트로 검증한다.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Zustand, decimal.js, dayjs, Recharts

---

## File Structure

```
all-in-web-calc/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # 루트 레이아웃 (Pretendard 폰트, AppShell 래핑)
│   │   ├── page.tsx                      # / → /dashboard 리다이렉트
│   │   ├── dashboard/page.tsx            # 대시보드 홈 (요약 카드 4개)
│   │   ├── calculators/
│   │   │   ├── real-estate/page.tsx      # 부동산/대출 계산기
│   │   │   ├── investment/page.tsx       # 투자/가상자산 계산기
│   │   │   ├── sourcing/page.tsx         # 글로벌 소싱 마진 계산기
│   │   │   └── nutrition/page.tsx        # 육아 영양 계산기
│   │   └── report/page.tsx               # 종합 인사이트 리포트
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx              # 사이드바 + 메인 영역 조합 레이아웃
│   │   │   ├── Sidebar.tsx               # 네비게이션 사이드바 (아코디언)
│   │   │   └── MobileHeader.tsx          # 모바일 햄버거 헤더
│   │   ├── calculators/
│   │   │   ├── RealEstateCalc.tsx        # 부동산 계산기 UI
│   │   │   ├── InvestmentCalc.tsx        # 투자 계산기 UI
│   │   │   ├── SourcingCalc.tsx          # 소싱 계산기 UI
│   │   │   └── NutritionCalc.tsx         # 영양 계산기 UI
│   │   └── shared/
│   │       ├── ScenarioTabs.tsx          # A/B 시나리오 탭 토글
│   │       ├── ResultCard.tsx            # 결과 표시 카드 (강조 수치 + 레이블)
│   │       ├── MemoInput.tsx             # 계산 결과 메모 입력/저장
│   │       └── CalcChart.tsx             # Recharts 래퍼 (꺾은선 / 파이)
│   ├── store/
│   │   └── useCalcStore.ts               # Zustand 전역 스토어 (계산값·메모·리포트 항목)
│   ├── lib/
│   │   └── calculators/
│   │       ├── realEstate.ts             # 순수 계산 함수 (대출 상환, 보증금)
│   │       ├── investment.ts             # 순수 계산 함수 (복리, 청산가)
│   │       ├── sourcing.ts               # 순수 계산 함수 (마진율)
│   │       └── nutrition.ts              # 순수 계산 함수 (영양소 배분)
│   └── types/
│       └── index.ts                      # 공통 타입 정의
└── __tests__/
    └── lib/
        ├── realEstate.test.ts
        ├── investment.test.ts
        ├── sourcing.test.ts
        └── nutrition.test.ts
```

---

## Task 1: 의존성 설치 및 프로젝트 설정

**Files:**
- Modify: `package.json`
- Modify: `next.config.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: 필수 패키지 설치**

```bash
cd all-in-web-calc
npm install zustand decimal.js dayjs recharts
npm install @radix-ui/react-accordion @radix-ui/react-slot @radix-ui/react-separator class-variance-authority clsx tailwind-merge lucide-react
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: vitest 설정 파일 생성**

`vitest.config.ts` 파일 생성:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: vitest setup 파일 생성**

`vitest.setup.ts` 파일 생성:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: package.json에 test 스크립트 추가**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 5: next.config.ts 업데이트 (정적 익스포트 설정)**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
};

export default nextConfig;
```

- [ ] **Step 6: globals.css 업데이트 (Pretendard 폰트 + 색상 토큰)**

```css
@import "tailwindcss";
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");

:root {
  --background: #ffffff;
  --foreground: #18181b;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --border: #e4e4e7;
  --card: #ffffff;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  --profit: #22c55e;
  --loss: #ef4444;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-card: var(--card);
  --color-primary: var(--primary);
  --color-profit: var(--profit);
  --color-loss: var(--loss);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 숫자 가독성: tabular numbers */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 7: layout.tsx 업데이트 (메타데이터 + 기본 폰트)**

```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALL-IN-WEB CALC",
  description: "일상의 모든 계산을 한곳에서",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: 설치 확인**

```bash
npm run dev
```
Expected: `http://localhost:3000`에서 기본 Next.js 페이지 정상 표시

---

## Task 2: 공통 타입 및 Zustand 스토어

**Files:**
- Create: `src/types/index.ts`
- Create: `src/store/useCalcStore.ts`

- [ ] **Step 1: 공통 타입 정의**

`src/types/index.ts`:

```typescript
export type ScenarioKey = 'A' | 'B'

export interface Memo {
  id: string
  calculatorId: string
  scenarioKey: ScenarioKey
  content: string
  createdAt: string
}

export interface ReportItem {
  id: string
  calculatorId: string
  calculatorLabel: string
  scenarioKey: ScenarioKey
  summary: string
  value: number
  unit: string
  savedAt: string
}

export interface RealEstateInputs {
  principal: number        // 대출 원금 (만원)
  annualRate: number       // 연이율 (%)
  termMonths: number       // 상환 기간 (개월)
  deposit: number          // 현재 보증금 (만원)
  depositIncreaseRate: number // 보증금 인상률 (%)
}

export interface InvestmentInputs {
  principal: number        // 원금 (만원)
  annualReturn: number     // 연 수익률 (%)
  years: number            // 투자 기간 (년)
  entryPrice: number       // 진입가 (원)
  leverage: number         // 레버리지 배수
}

export interface SourcingInputs {
  costForeign: number      // 원가 (외화)
  exchangeRate: number     // 환율 (원/외화)
  shippingKrw: number      // 국내 배송비 (원)
  feeRate: number          // 수수료율 (%)
  sellPriceKrw: number     // 판매가 (원)
}

export interface NutritionInputs {
  totalGrams: number       // 목표 총 식사량 (g)
  carbRatio: number        // 탄수화물 비율 (%)
  proteinRatio: number     // 단백질 비율 (%)
  fatRatio: number         // 지방 비율 (%)
}

export type CalcInputs =
  | RealEstateInputs
  | InvestmentInputs
  | SourcingInputs
  | NutritionInputs
```

- [ ] **Step 2: Zustand 스토어 구현**

`src/store/useCalcStore.ts`:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ScenarioKey,
  Memo,
  ReportItem,
  RealEstateInputs,
  InvestmentInputs,
  SourcingInputs,
  NutritionInputs,
} from '@/types'

interface CalcState {
  activeScenario: ScenarioKey
  realEstate: Record<ScenarioKey, RealEstateInputs>
  investment: Record<ScenarioKey, InvestmentInputs>
  sourcing: Record<ScenarioKey, SourcingInputs>
  nutrition: Record<ScenarioKey, NutritionInputs>
  memos: Memo[]
  reportItems: ReportItem[]

  setActiveScenario: (key: ScenarioKey) => void
  setRealEstate: (key: ScenarioKey, inputs: Partial<RealEstateInputs>) => void
  setInvestment: (key: ScenarioKey, inputs: Partial<InvestmentInputs>) => void
  setSourcing: (key: ScenarioKey, inputs: Partial<SourcingInputs>) => void
  setNutrition: (key: ScenarioKey, inputs: Partial<NutritionInputs>) => void
  addMemo: (memo: Omit<Memo, 'id' | 'createdAt'>) => void
  deleteMemo: (id: string) => void
  saveReportItem: (item: Omit<ReportItem, 'id' | 'savedAt'>) => void
  deleteReportItem: (id: string) => void
}

const defaultRealEstate: RealEstateInputs = {
  principal: 30000,
  annualRate: 4.5,
  termMonths: 360,
  deposit: 50000,
  depositIncreaseRate: 5,
}

const defaultInvestment: InvestmentInputs = {
  principal: 1000,
  annualReturn: 8,
  years: 10,
  entryPrice: 100000000,
  leverage: 5,
}

const defaultSourcing: SourcingInputs = {
  costForeign: 20,
  exchangeRate: 1350,
  shippingKrw: 3000,
  feeRate: 10,
  sellPriceKrw: 45000,
}

const defaultNutrition: NutritionInputs = {
  totalGrams: 200,
  carbRatio: 50,
  proteinRatio: 30,
  fatRatio: 20,
}

export const useCalcStore = create<CalcState>()(
  persist(
    (set) => ({
      activeScenario: 'A',
      realEstate: { A: { ...defaultRealEstate }, B: { ...defaultRealEstate } },
      investment: { A: { ...defaultInvestment }, B: { ...defaultInvestment } },
      sourcing: { A: { ...defaultSourcing }, B: { ...defaultSourcing } },
      nutrition: { A: { ...defaultNutrition }, B: { ...defaultNutrition } },
      memos: [],
      reportItems: [],

      setActiveScenario: (key) => set({ activeScenario: key }),

      setRealEstate: (key, inputs) =>
        set((s) => ({
          realEstate: {
            ...s.realEstate,
            [key]: { ...s.realEstate[key], ...inputs },
          },
        })),

      setInvestment: (key, inputs) =>
        set((s) => ({
          investment: {
            ...s.investment,
            [key]: { ...s.investment[key], ...inputs },
          },
        })),

      setSourcing: (key, inputs) =>
        set((s) => ({
          sourcing: {
            ...s.sourcing,
            [key]: { ...s.sourcing[key], ...inputs },
          },
        })),

      setNutrition: (key, inputs) =>
        set((s) => ({
          nutrition: {
            ...s.nutrition,
            [key]: { ...s.nutrition[key], ...inputs },
          },
        })),

      addMemo: (memo) =>
        set((s) => ({
          memos: [
            ...s.memos,
            {
              ...memo,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      deleteMemo: (id) =>
        set((s) => ({ memos: s.memos.filter((m) => m.id !== id) })),

      saveReportItem: (item) =>
        set((s) => ({
          reportItems: [
            ...s.reportItems,
            {
              ...item,
              id: crypto.randomUUID(),
              savedAt: new Date().toISOString(),
            },
          ],
        })),

      deleteReportItem: (id) =>
        set((s) => ({
          reportItems: s.reportItems.filter((r) => r.id !== id),
        })),
    }),
    { name: 'all-in-web-calc-store' }
  )
)
```

---

## Task 3: 순수 계산 함수 (부동산/대출)

**Files:**
- Create: `src/lib/calculators/realEstate.ts`
- Create: `__tests__/lib/realEstate.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`__tests__/lib/realEstate.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  calcMonthlyPayment,
  calcAmortizationSchedule,
  calcNewDeposit,
} from '@/lib/calculators/realEstate'

describe('calcMonthlyPayment', () => {
  it('원리금 균등 상환 월 납입금을 계산한다', () => {
    // 원금 3억, 연 4.5%, 30년(360개월)
    const result = calcMonthlyPayment(300000000, 4.5, 360)
    expect(result).toBeCloseTo(1520060, -2) // 약 152만원
  })

  it('이율이 0이면 원금/기간 반환', () => {
    const result = calcMonthlyPayment(12000000, 0, 12)
    expect(result).toBeCloseTo(1000000, 0)
  })
})

describe('calcAmortizationSchedule', () => {
  it('3개월치 상환 스케줄을 반환한다', () => {
    const schedule = calcAmortizationSchedule(12000000, 12, 12)
    expect(schedule).toHaveLength(12)
    expect(schedule[0].month).toBe(1)
    expect(schedule[0].principal).toBeGreaterThan(0)
    expect(schedule[0].interest).toBeGreaterThan(0)
    expect(schedule[11].remainingBalance).toBeCloseTo(0, 0)
  })
})

describe('calcNewDeposit', () => {
  it('보증금 인상 후 금액을 계산한다', () => {
    const result = calcNewDeposit(50000, 5)
    expect(result).toBe(52500)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test -- realEstate
```
Expected: FAIL (함수 없음)

- [ ] **Step 3: 계산 함수 구현**

`src/lib/calculators/realEstate.ts`:

```typescript
import Decimal from 'decimal.js'

export interface AmortizationRow {
  month: number
  payment: number
  principal: number
  interest: number
  remainingBalance: number
}

/**
 * 원리금 균등 상환 월 납입금
 * @param principal 원금 (원)
 * @param annualRate 연이율 (%)
 * @param termMonths 기간 (개월)
 */
export function calcMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (annualRate === 0) {
    return new Decimal(principal).div(termMonths).toNumber()
  }
  const r = new Decimal(annualRate).div(100).div(12)
  const n = termMonths
  // M = P * r * (1+r)^n / ((1+r)^n - 1)
  const factor = r.plus(1).pow(n)
  const monthly = new Decimal(principal)
    .mul(r)
    .mul(factor)
    .div(factor.minus(1))
  return monthly.toNumber()
}

/**
 * 전체 상환 스케줄 생성
 */
export function calcAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number
): AmortizationRow[] {
  const monthlyPayment = calcMonthlyPayment(principal, annualRate, termMonths)
  const r = new Decimal(annualRate).div(100).div(12)
  let balance = new Decimal(principal)
  const rows: AmortizationRow[] = []

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance.mul(r)
    const principalPaid = new Decimal(monthlyPayment).minus(interest)
    balance = balance.minus(principalPaid)
    if (balance.lessThan(0)) balance = new Decimal(0)

    rows.push({
      month,
      payment: monthlyPayment,
      principal: principalPaid.toNumber(),
      interest: interest.toNumber(),
      remainingBalance: balance.toNumber(),
    })
  }
  return rows
}

/**
 * 보증금 갱신 후 금액 계산 (만원 단위)
 */
export function calcNewDeposit(deposit: number, increaseRate: number): number {
  return new Decimal(deposit)
    .mul(new Decimal(1).plus(new Decimal(increaseRate).div(100)))
    .toNumber()
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- realEstate
```
Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/calculators/realEstate.ts __tests__/lib/realEstate.test.ts
git commit -m "feat: add real estate calculator logic with tests"
```

---

## Task 4: 순수 계산 함수 (투자/가상자산)

**Files:**
- Create: `src/lib/calculators/investment.ts`
- Create: `__tests__/lib/investment.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`__tests__/lib/investment.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  calcCompoundGrowth,
  calcLiquidationPrice,
  calcCompoundSchedule,
} from '@/lib/calculators/investment'

describe('calcCompoundGrowth', () => {
  it('복리 최종 금액을 계산한다', () => {
    // 1000만원, 연 8%, 10년
    const result = calcCompoundGrowth(10000000, 8, 10)
    expect(result).toBeCloseTo(21589250, -3)
  })
})

describe('calcLiquidationPrice', () => {
  it('롱 포지션 청산가를 계산한다', () => {
    // 진입가 100원, 레버리지 5배 → 청산가 = 진입가 * (1 - 1/레버리지)
    const result = calcLiquidationPrice(100, 5, 'long')
    expect(result).toBeCloseTo(80, 1)
  })

  it('숏 포지션 청산가를 계산한다', () => {
    const result = calcLiquidationPrice(100, 5, 'short')
    expect(result).toBeCloseTo(120, 1)
  })
})

describe('calcCompoundSchedule', () => {
  it('5년치 복리 스케줄을 반환한다', () => {
    const schedule = calcCompoundSchedule(10000000, 8, 5)
    expect(schedule).toHaveLength(5)
    expect(schedule[0].year).toBe(1)
    expect(schedule[4].year).toBe(5)
    expect(schedule[4].total).toBeGreaterThan(10000000)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test -- investment
```
Expected: FAIL

- [ ] **Step 3: 계산 함수 구현**

`src/lib/calculators/investment.ts`:

```typescript
import Decimal from 'decimal.js'

export interface CompoundRow {
  year: number
  total: number
  gain: number
}

/**
 * 복리 최종 금액 = P * (1 + r)^n
 */
export function calcCompoundGrowth(
  principal: number,
  annualReturn: number,
  years: number
): number {
  const r = new Decimal(annualReturn).div(100)
  return new Decimal(principal).mul(r.plus(1).pow(years)).toNumber()
}

/**
 * 연도별 복리 성장 스케줄
 */
export function calcCompoundSchedule(
  principal: number,
  annualReturn: number,
  years: number
): CompoundRow[] {
  return Array.from({ length: years }, (_, i) => {
    const year = i + 1
    const total = calcCompoundGrowth(principal, annualReturn, year)
    return { year, total, gain: total - principal }
  })
}

/**
 * 선물 청산가 계산
 * long:  청산가 = 진입가 * (1 - 1/leverage)
 * short: 청산가 = 진입가 * (1 + 1/leverage)
 */
export function calcLiquidationPrice(
  entryPrice: number,
  leverage: number,
  direction: 'long' | 'short'
): number {
  const e = new Decimal(entryPrice)
  const l = new Decimal(leverage)
  if (direction === 'long') {
    return e.mul(new Decimal(1).minus(new Decimal(1).div(l))).toNumber()
  }
  return e.mul(new Decimal(1).plus(new Decimal(1).div(l))).toNumber()
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- investment
```
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/lib/calculators/investment.ts __tests__/lib/investment.test.ts
git commit -m "feat: add investment calculator logic with tests"
```

---

## Task 5: 순수 계산 함수 (글로벌 소싱 + 육아 영양)

**Files:**
- Create: `src/lib/calculators/sourcing.ts`
- Create: `src/lib/calculators/nutrition.ts`
- Create: `__tests__/lib/sourcing.test.ts`
- Create: `__tests__/lib/nutrition.test.ts`

- [ ] **Step 1: 소싱 테스트 작성**

`__tests__/lib/sourcing.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calcSourcingMargin, calcTargetSellPrice } from '@/lib/calculators/sourcing'

describe('calcSourcingMargin', () => {
  it('마진액과 마진율을 계산한다', () => {
    // 원가 20달러, 환율 1350, 배송비 3000, 수수료 10%, 판매가 45000
    const result = calcSourcingMargin(20, 1350, 3000, 10, 45000)
    // 원가KRW = 20 * 1350 = 27000
    // 수수료 = 45000 * 0.1 = 4500
    // 총비용 = 27000 + 3000 + 4500 = 34500
    // 마진 = 45000 - 34500 = 10500
    // 마진율 = 10500 / 45000 ≈ 23.33%
    expect(result.marginKrw).toBe(10500)
    expect(result.marginRate).toBeCloseTo(23.33, 1)
    expect(result.costKrw).toBe(27000)
    expect(result.feeKrw).toBe(4500)
  })
})

describe('calcTargetSellPrice', () => {
  it('목표 마진율을 위한 판매가를 역산한다', () => {
    // 목표 마진율 30%, 총 고정비용(원가KRW+배송비) 30000, 수수료율 10%
    // P * (1 - 0.1) - 30000 = P * 0.3 → P * 0.6 = 30000 → P = 50000
    const result = calcTargetSellPrice(30000, 10, 30)
    expect(result).toBeCloseTo(50000, 0)
  })
})
```

- [ ] **Step 2: 영양 테스트 작성**

`__tests__/lib/nutrition.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calcNutritionBreakdown } from '@/lib/calculators/nutrition'

describe('calcNutritionBreakdown', () => {
  it('영양소별 목표 무게를 배분한다', () => {
    const result = calcNutritionBreakdown(200, 50, 30, 20)
    expect(result.carb).toBe(100)
    expect(result.protein).toBe(60)
    expect(result.fat).toBe(40)
    expect(result.total).toBe(200)
  })

  it('비율 합이 100이 아니어도 입력값 그대로 비율 적용', () => {
    const result = calcNutritionBreakdown(100, 60, 30, 10)
    expect(result.carb + result.protein + result.fat).toBeCloseTo(100, 1)
  })
})
```

- [ ] **Step 3: 테스트 실패 확인**

```bash
npm test -- sourcing nutrition
```
Expected: FAIL

- [ ] **Step 4: 소싱 계산 함수 구현**

`src/lib/calculators/sourcing.ts`:

```typescript
import Decimal from 'decimal.js'

export interface SourcingMarginResult {
  costKrw: number
  feeKrw: number
  totalCostKrw: number
  marginKrw: number
  marginRate: number
}

export function calcSourcingMargin(
  costForeign: number,
  exchangeRate: number,
  shippingKrw: number,
  feeRate: number,
  sellPriceKrw: number
): SourcingMarginResult {
  const costKrw = new Decimal(costForeign).mul(exchangeRate).toNumber()
  const feeKrw = new Decimal(sellPriceKrw).mul(new Decimal(feeRate).div(100)).toNumber()
  const totalCostKrw = new Decimal(costKrw).plus(shippingKrw).plus(feeKrw).toNumber()
  const marginKrw = new Decimal(sellPriceKrw).minus(totalCostKrw).toNumber()
  const marginRate = new Decimal(marginKrw).div(sellPriceKrw).mul(100).toNumber()

  return { costKrw, feeKrw, totalCostKrw, marginKrw, marginRate }
}

/**
 * 목표 마진율 달성을 위한 판매가 역산
 * P * (1 - feeRate/100) - fixedCostKrw = P * (targetMarginRate/100)
 * P * (1 - feeRate/100 - targetMarginRate/100) = fixedCostKrw
 * P = fixedCostKrw / (1 - feeRate/100 - targetMarginRate/100)
 */
export function calcTargetSellPrice(
  fixedCostKrw: number,  // costKrw + shippingKrw
  feeRate: number,
  targetMarginRate: number
): number {
  const divisor = new Decimal(1)
    .minus(new Decimal(feeRate).div(100))
    .minus(new Decimal(targetMarginRate).div(100))
  return new Decimal(fixedCostKrw).div(divisor).toNumber()
}
```

- [ ] **Step 5: 영양 계산 함수 구현**

`src/lib/calculators/nutrition.ts`:

```typescript
import Decimal from 'decimal.js'

export interface NutritionBreakdown {
  carb: number
  protein: number
  fat: number
  total: number
}

export function calcNutritionBreakdown(
  totalGrams: number,
  carbRatio: number,
  proteinRatio: number,
  fatRatio: number
): NutritionBreakdown {
  const total = new Decimal(totalGrams)
  const carb = total.mul(new Decimal(carbRatio).div(100)).toDecimalPlaces(1).toNumber()
  const protein = total.mul(new Decimal(proteinRatio).div(100)).toDecimalPlaces(1).toNumber()
  const fat = total.mul(new Decimal(fatRatio).div(100)).toDecimalPlaces(1).toNumber()
  return { carb, protein, fat, total: totalGrams }
}
```

- [ ] **Step 6: 테스트 통과 확인**

```bash
npm test
```
Expected: 모든 테스트 PASS

- [ ] **Step 7: 커밋**

```bash
git add src/lib/calculators/ __tests__/lib/
git commit -m "feat: add sourcing and nutrition calculator logic with tests"
```

---

## Task 6: 레이아웃 컴포넌트 (AppShell + Sidebar)

**Files:**
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/MobileHeader.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Sidebar 구현**

`src/components/layout/Sidebar.tsx`:

```tsx
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
      {/* 로고 */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <span className="text-base font-bold tracking-tight text-[var(--foreground)]">
          ALL-IN-WEB CALC
        </span>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) =>
          'children' in item ? (
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
```

- [ ] **Step 2: MobileHeader 구현**

`src/components/layout/MobileHeader.tsx`:

```tsx
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
    <header className="md:hidden border-b border-[var(--border)] bg-white px-4 py-3 flex items-center justify-between">
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
        <div className="absolute top-12 left-0 right-0 bg-white border-b border-[var(--border)] z-50 shadow-sm">
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
```

- [ ] **Step 3: AppShell 구현**

`src/components/layout/AppShell.tsx`:

```tsx
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-screen">
      {/* 데스크탑 사이드바 */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        {/* 모바일 헤더 */}
        <MobileHeader />

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto bg-[var(--muted)] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: layout.tsx에 AppShell 적용**

`src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "ALL-IN-WEB CALC",
  description: "일상의 모든 계산을 한곳에서",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: 루트 페이지를 대시보드로 리다이렉트**

`src/app/page.tsx`:

```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
```

- [ ] **Step 6: dev 서버로 레이아웃 확인**

```bash
npm run dev
```
Expected: `http://localhost:3000` 접속 시 `/dashboard`로 리다이렉트, 좌측 사이드바와 메인 영역이 표시됨

- [ ] **Step 7: 커밋**

```bash
git add src/components/layout/ src/app/layout.tsx src/app/page.tsx
git commit -m "feat: add AppShell layout with sidebar and mobile header"
```

---

## Task 7: 공용 UI 컴포넌트

**Files:**
- Create: `src/components/shared/ResultCard.tsx`
- Create: `src/components/shared/ScenarioTabs.tsx`
- Create: `src/components/shared/MemoInput.tsx`
- Create: `src/components/shared/CalcChart.tsx`

- [ ] **Step 1: ResultCard 구현**

`src/components/shared/ResultCard.tsx`:

```tsx
interface ResultCardProps {
  label: string
  value: string
  unit?: string
  emphasis?: 'profit' | 'loss' | 'neutral'
  subText?: string
}

export default function ResultCard({
  label,
  value,
  unit,
  emphasis = 'neutral',
  subText,
}: ResultCardProps) {
  const emphasisClass =
    emphasis === 'profit'
      ? 'text-[var(--profit)]'
      : emphasis === 'loss'
      ? 'text-[var(--loss)]'
      : 'text-[var(--foreground)]'

  return (
    <div className="bg-white rounded-lg border border-[var(--border)] p-4">
      <p className="text-xs text-[var(--muted-foreground)] mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${emphasisClass}`}>
        {value}
        {unit && <span className="text-sm font-normal ml-1 text-[var(--muted-foreground)]">{unit}</span>}
      </p>
      {subText && <p className="text-xs text-[var(--muted-foreground)] mt-1">{subText}</p>}
    </div>
  )
}
```

- [ ] **Step 2: ScenarioTabs 구현**

`src/components/shared/ScenarioTabs.tsx`:

```tsx
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
```

- [ ] **Step 3: MemoInput 구현**

`src/components/shared/MemoInput.tsx`:

```tsx
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
            <li key={memo.id} className="flex items-start justify-between gap-2 text-sm text-[var(--muted-foreground)]">
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
```

- [ ] **Step 4: CalcChart 구현 (Recharts 래퍼)**

`src/components/shared/CalcChart.tsx`:

```tsx
'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts'

interface LineData {
  type: 'line'
  data: Record<string, string | number>[]
  xKey: string
  lines: { key: string; label: string; color: string }[]
}

interface PieData {
  type: 'pie'
  data: { name: string; value: number; color: string }[]
}

type CalcChartProps = LineData | PieData

export default function CalcChart(props: CalcChartProps) {
  if (props.type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={props.data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={props.xKey} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={60} tickFormatter={(v: number) => `${(v / 10000).toFixed(0)}만`} />
          <Tooltip formatter={(v: number) => `${v.toLocaleString()}원`} />
          {props.lines.map((l) => (
            <Line key={l.key} type="monotone" dataKey={l.key} name={l.label} stroke={l.color} dot={false} strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={props.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {props.data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Legend />
        <Tooltip formatter={(v: number) => v.toLocaleString()} />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 5: 커밋**

```bash
git add src/components/shared/
git commit -m "feat: add shared UI components (ResultCard, ScenarioTabs, MemoInput, CalcChart)"
```

---

## Task 8: 대시보드 홈 페이지

**Files:**
- Create: `src/app/dashboard/page.tsx`

- [ ] **Step 1: 대시보드 페이지 구현**

`src/app/dashboard/page.tsx`:

```tsx
import Link from 'next/link'

const CALC_CARDS = [
  {
    label: '부동산 / 대출',
    description: '월 상환액, 이자 총액, 보증금 갱신 계산',
    href: '/calculators/real-estate',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    label: '투자 / 가상자산',
    description: '복리 시뮬레이션, 선물 청산가 계산',
    href: '/calculators/investment',
    color: 'bg-green-50 border-green-200',
  },
  {
    label: '글로벌 소싱',
    description: '환율 반영 마진율, 목표 판매가 역산',
    href: '/calculators/sourcing',
    color: 'bg-orange-50 border-orange-200',
  },
  {
    label: '육아 영양',
    description: '이유식 영양소 비율 및 식재료 계량 계산',
    href: '/calculators/nutrition',
    color: 'bg-purple-50 border-purple-200',
  },
]

export default function DashboardPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">대시보드</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">계산기를 선택하세요</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CALC_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`block rounded-xl border p-5 transition-shadow hover:shadow-md ${card.color}`}
          >
            <p className="font-semibold text-sm text-[var(--foreground)]">{card.label}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{card.description}</p>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link href="/report" className="text-sm text-[var(--primary)] hover:underline">
          인사이트 리포트 보기 →
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: dev 서버에서 대시보드 확인**

```bash
npm run dev
```
Expected: `/dashboard`에서 4개의 계산기 카드가 표시됨

- [ ] **Step 3: 커밋**

```bash
git add src/app/dashboard/
git commit -m "feat: add dashboard home page with calculator cards"
```

---

## Task 9: 부동산/대출 계산기 페이지

**Files:**
- Create: `src/components/calculators/RealEstateCalc.tsx`
- Create: `src/app/calculators/real-estate/page.tsx`

- [ ] **Step 1: RealEstateCalc 컴포넌트 구현**

`src/components/calculators/RealEstateCalc.tsx`:

```tsx
'use client'

import { useMemo } from 'react'
import { useCalcStore } from '@/store/useCalcStore'
import { calcMonthlyPayment, calcAmortizationSchedule, calcNewDeposit } from '@/lib/calculators/realEstate'
import ScenarioTabs from '@/components/shared/ScenarioTabs'
import ResultCard from '@/components/shared/ResultCard'
import MemoInput from '@/components/shared/MemoInput'
import CalcChart from '@/components/shared/CalcChart'

function fmt(n: number) {
  return Math.round(n).toLocaleString()
}

export default function RealEstateCalc() {
  const { activeScenario, realEstate, setRealEstate } = useCalcStore()
  const inputs = realEstate[activeScenario]

  const monthly = useMemo(
    () => calcMonthlyPayment(inputs.principal * 10000, inputs.annualRate, inputs.termMonths),
    [inputs.principal, inputs.annualRate, inputs.termMonths]
  )

  const schedule = useMemo(
    () => calcAmortizationSchedule(inputs.principal * 10000, inputs.annualRate, inputs.termMonths),
    [inputs.principal, inputs.annualRate, inputs.termMonths]
  )

  const totalInterest = useMemo(
    () => schedule.reduce((acc, r) => acc + r.interest, 0),
    [schedule]
  )

  const newDeposit = useMemo(
    () => calcNewDeposit(inputs.deposit, inputs.depositIncreaseRate),
    [inputs.deposit, inputs.depositIncreaseRate]
  )

  // 연도별 잔금 꺾은선 차트 데이터 (12개월 간격)
  const chartData = schedule
    .filter((_, i) => i % 12 === 11)
    .map((r) => ({ year: `${Math.round(r.month / 12)}년`, 잔금: Math.round(r.remainingBalance) }))

  return (
    <div className="space-y-5">
      <ScenarioTabs />

      {/* 입력 */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">대출 원금 (만원)</span>
          <input
            type="number"
            value={inputs.principal}
            onChange={(e) => setRealEstate(activeScenario, { principal: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">연이율 (%)</span>
          <input
            type="number"
            step="0.1"
            value={inputs.annualRate}
            onChange={(e) => setRealEstate(activeScenario, { annualRate: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">상환 기간 (개월)</span>
          <input
            type="number"
            value={inputs.termMonths}
            onChange={(e) => setRealEstate(activeScenario, { termMonths: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">보증금 (만원)</span>
          <input
            type="number"
            value={inputs.deposit}
            onChange={(e) => setRealEstate(activeScenario, { deposit: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">보증금 인상률 (%)</span>
          <input
            type="number"
            step="0.1"
            value={inputs.depositIncreaseRate}
            onChange={(e) => setRealEstate(activeScenario, { depositIncreaseRate: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
      </div>

      {/* 결과 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResultCard label="월 상환금" value={fmt(monthly)} unit="원" />
        <ResultCard label="이자 총액" value={fmt(totalInterest)} unit="원" emphasis="loss" />
        <ResultCard label="갱신 후 보증금" value={fmt(newDeposit)} unit="만원" />
        <ResultCard label="상환 기간" value={String(Math.round(inputs.termMonths / 12))} unit="년" />
      </div>

      {/* 잔금 추이 차트 */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <p className="text-sm font-medium mb-3">연도별 대출 잔금 추이</p>
        <CalcChart type="line" data={chartData} xKey="year" lines={[{ key: '잔금', label: '잔금', color: 'var(--primary)' }]} />
      </div>

      <MemoInput calculatorId="real-estate" scenarioKey={activeScenario} />
    </div>
  )
}
```

- [ ] **Step 2: 페이지 파일 생성**

`src/app/calculators/real-estate/page.tsx`:

```tsx
import RealEstateCalc from '@/components/calculators/RealEstateCalc'

export default function RealEstatePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">부동산 / 대출</h1>
      <RealEstateCalc />
    </div>
  )
}
```

- [ ] **Step 3: 브라우저에서 확인**

```bash
npm run dev
```
Expected: `/calculators/real-estate` 접속 시 입력 필드 변경 → 결과 카드 실시간 업데이트, 차트 표시

- [ ] **Step 4: 커밋**

```bash
git add src/components/calculators/RealEstateCalc.tsx src/app/calculators/real-estate/
git commit -m "feat: add real estate / loan calculator page"
```

---

## Task 10: 투자/가상자산 계산기 페이지

**Files:**
- Create: `src/components/calculators/InvestmentCalc.tsx`
- Create: `src/app/calculators/investment/page.tsx`

- [ ] **Step 1: InvestmentCalc 컴포넌트 구현**

`src/components/calculators/InvestmentCalc.tsx`:

```tsx
'use client'

import { useMemo, useState } from 'react'
import { useCalcStore } from '@/store/useCalcStore'
import { calcCompoundGrowth, calcLiquidationPrice, calcCompoundSchedule } from '@/lib/calculators/investment'
import ScenarioTabs from '@/components/shared/ScenarioTabs'
import ResultCard from '@/components/shared/ResultCard'
import MemoInput from '@/components/shared/MemoInput'
import CalcChart from '@/components/shared/CalcChart'

function fmt(n: number) {
  return Math.round(n).toLocaleString()
}

export default function InvestmentCalc() {
  const { activeScenario, investment, setInvestment } = useCalcStore()
  const inputs = investment[activeScenario]
  const [direction, setDirection] = useState<'long' | 'short'>('long')

  const finalAmount = useMemo(
    () => calcCompoundGrowth(inputs.principal * 10000, inputs.annualReturn, inputs.years),
    [inputs.principal, inputs.annualReturn, inputs.years]
  )

  const gain = finalAmount - inputs.principal * 10000

  const liqPrice = useMemo(
    () => calcLiquidationPrice(inputs.entryPrice, inputs.leverage, direction),
    [inputs.entryPrice, inputs.leverage, direction]
  )

  const schedule = useMemo(
    () => calcCompoundSchedule(inputs.principal * 10000, inputs.annualReturn, inputs.years),
    [inputs.principal, inputs.annualReturn, inputs.years]
  )

  const chartData = schedule.map((r) => ({ year: `${r.year}년`, 금액: Math.round(r.total) }))

  return (
    <div className="space-y-5">
      <ScenarioTabs />

      <div className="bg-white rounded-lg border border-[var(--border)] p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">원금 (만원)</span>
          <input type="number" value={inputs.principal}
            onChange={(e) => setInvestment(activeScenario, { principal: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">연 수익률 (%)</span>
          <input type="number" step="0.1" value={inputs.annualReturn}
            onChange={(e) => setInvestment(activeScenario, { annualReturn: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">투자 기간 (년)</span>
          <input type="number" value={inputs.years}
            onChange={(e) => setInvestment(activeScenario, { years: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">진입가 (원)</span>
          <input type="number" value={inputs.entryPrice}
            onChange={(e) => setInvestment(activeScenario, { entryPrice: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">레버리지 (배)</span>
          <input type="number" step="1" min="1" value={inputs.leverage}
            onChange={(e) => setInvestment(activeScenario, { leverage: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">방향</span>
          <select value={direction} onChange={(e) => setDirection(e.target.value as 'long' | 'short')}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]">
            <option value="long">롱 (매수)</option>
            <option value="short">숏 (매도)</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResultCard label="복리 최종 금액" value={fmt(finalAmount)} unit="원" emphasis="profit" />
        <ResultCard label="수익금" value={fmt(gain)} unit="원" emphasis={gain >= 0 ? 'profit' : 'loss'} />
        <ResultCard label="청산가" value={fmt(liqPrice)} unit="원" emphasis="loss" />
        <ResultCard label="레버리지" value={String(inputs.leverage)} unit="배" />
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <p className="text-sm font-medium mb-3">복리 성장 그래프</p>
        <CalcChart type="line" data={chartData} xKey="year" lines={[{ key: '금액', label: '금액', color: '#22c55e' }]} />
      </div>

      <MemoInput calculatorId="investment" scenarioKey={activeScenario} />
    </div>
  )
}
```

- [ ] **Step 2: 페이지 파일 생성**

`src/app/calculators/investment/page.tsx`:

```tsx
import InvestmentCalc from '@/components/calculators/InvestmentCalc'

export default function InvestmentPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">투자 / 가상자산</h1>
      <InvestmentCalc />
    </div>
  )
}
```

- [ ] **Step 3: 브라우저에서 확인**

Expected: 복리 성장 차트 및 청산가 실시간 계산 확인

- [ ] **Step 4: 커밋**

```bash
git add src/components/calculators/InvestmentCalc.tsx src/app/calculators/investment/
git commit -m "feat: add investment / crypto calculator page"
```

---

## Task 11: 글로벌 소싱 계산기 페이지

**Files:**
- Create: `src/components/calculators/SourcingCalc.tsx`
- Create: `src/app/calculators/sourcing/page.tsx`

- [ ] **Step 1: SourcingCalc 컴포넌트 구현**

`src/components/calculators/SourcingCalc.tsx`:

```tsx
'use client'

import { useMemo } from 'react'
import { useCalcStore } from '@/store/useCalcStore'
import { calcSourcingMargin, calcTargetSellPrice } from '@/lib/calculators/sourcing'
import ScenarioTabs from '@/components/shared/ScenarioTabs'
import ResultCard from '@/components/shared/ResultCard'
import MemoInput from '@/components/shared/MemoInput'
import CalcChart from '@/components/shared/CalcChart'

function fmt(n: number) {
  return Math.round(n).toLocaleString()
}

export default function SourcingCalc() {
  const { activeScenario, sourcing, setSourcing } = useCalcStore()
  const inputs = sourcing[activeScenario]

  const result = useMemo(
    () => calcSourcingMargin(
      inputs.costForeign,
      inputs.exchangeRate,
      inputs.shippingKrw,
      inputs.feeRate,
      inputs.sellPriceKrw
    ),
    [inputs]
  )

  const targetPrice30 = useMemo(
    () => calcTargetSellPrice(result.costKrw + inputs.shippingKrw, inputs.feeRate, 30),
    [result.costKrw, inputs.shippingKrw, inputs.feeRate]
  )

  const pieData = [
    { name: '원가', value: result.costKrw, color: '#3b82f6' },
    { name: '배송비', value: inputs.shippingKrw, color: '#8b5cf6' },
    { name: '수수료', value: result.feeKrw, color: '#f59e0b' },
    { name: '마진', value: Math.max(result.marginKrw, 0), color: '#22c55e' },
  ]

  return (
    <div className="space-y-5">
      <ScenarioTabs />

      <div className="bg-white rounded-lg border border-[var(--border)] p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">원가 (외화)</span>
          <input type="number" step="0.01" value={inputs.costForeign}
            onChange={(e) => setSourcing(activeScenario, { costForeign: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">환율 (원/외화)</span>
          <input type="number" value={inputs.exchangeRate}
            onChange={(e) => setSourcing(activeScenario, { exchangeRate: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">배송비 (원)</span>
          <input type="number" value={inputs.shippingKrw}
            onChange={(e) => setSourcing(activeScenario, { shippingKrw: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">수수료율 (%)</span>
          <input type="number" step="0.1" value={inputs.feeRate}
            onChange={(e) => setSourcing(activeScenario, { feeRate: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">판매가 (원)</span>
          <input type="number" value={inputs.sellPriceKrw}
            onChange={(e) => setSourcing(activeScenario, { sellPriceKrw: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums" />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResultCard label="마진액" value={fmt(result.marginKrw)} unit="원"
          emphasis={result.marginKrw >= 0 ? 'profit' : 'loss'} />
        <ResultCard label="마진율" value={result.marginRate.toFixed(1)} unit="%" 
          emphasis={result.marginRate >= 0 ? 'profit' : 'loss'} />
        <ResultCard label="원가 (KRW)" value={fmt(result.costKrw)} unit="원" />
        <ResultCard label="마진율 30% 목표 판매가" value={fmt(targetPrice30)} unit="원" subText="역산" />
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <p className="text-sm font-medium mb-3">비용 구조</p>
        <CalcChart type="pie" data={pieData} />
      </div>

      <MemoInput calculatorId="sourcing" scenarioKey={activeScenario} />
    </div>
  )
}
```

- [ ] **Step 2: 페이지 파일**

`src/app/calculators/sourcing/page.tsx`:

```tsx
import SourcingCalc from '@/components/calculators/SourcingCalc'

export default function SourcingPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">글로벌 소싱 마진</h1>
      <SourcingCalc />
    </div>
  )
}
```

- [ ] **Step 3: 브라우저 확인 + 커밋**

Expected: 파이 차트, 마진율 실시간 업데이트

```bash
git add src/components/calculators/SourcingCalc.tsx src/app/calculators/sourcing/
git commit -m "feat: add global sourcing margin calculator page"
```

---

## Task 12: 육아 영양 계산기 페이지

**Files:**
- Create: `src/components/calculators/NutritionCalc.tsx`
- Create: `src/app/calculators/nutrition/page.tsx`

- [ ] **Step 1: NutritionCalc 컴포넌트 구현**

`src/components/calculators/NutritionCalc.tsx`:

```tsx
'use client'

import { useMemo } from 'react'
import { useCalcStore } from '@/store/useCalcStore'
import { calcNutritionBreakdown } from '@/lib/calculators/nutrition'
import ScenarioTabs from '@/components/shared/ScenarioTabs'
import ResultCard from '@/components/shared/ResultCard'
import MemoInput from '@/components/shared/MemoInput'
import CalcChart from '@/components/shared/CalcChart'

export default function NutritionCalc() {
  const { activeScenario, nutrition, setNutrition } = useCalcStore()
  const inputs = nutrition[activeScenario]

  const breakdown = useMemo(
    () => calcNutritionBreakdown(inputs.totalGrams, inputs.carbRatio, inputs.proteinRatio, inputs.fatRatio),
    [inputs]
  )

  const totalRatio = inputs.carbRatio + inputs.proteinRatio + inputs.fatRatio

  const pieData = [
    { name: '탄수화물', value: breakdown.carb, color: '#3b82f6' },
    { name: '단백질', value: breakdown.protein, color: '#22c55e' },
    { name: '지방', value: breakdown.fat, color: '#f59e0b' },
  ]

  return (
    <div className="space-y-5">
      <ScenarioTabs />

      {totalRatio !== 100 && (
        <div className="bg-orange-50 border border-orange-200 rounded-md px-4 py-2 text-sm text-orange-700">
          탄단지 비율 합계가 {totalRatio}%입니다. 합계가 100%가 되도록 조정하세요.
        </div>
      )}

      <div className="bg-white rounded-lg border border-[var(--border)] p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">목표 식사량 (g)</span>
          <input type="number" value={inputs.totalGrams}
            onChange={(e) => setNutrition(activeScenario, { totalGrams: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">탄수화물 (%)</span>
          <input type="number" value={inputs.carbRatio}
            onChange={(e) => setNutrition(activeScenario, { carbRatio: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">단백질 (%)</span>
          <input type="number" value={inputs.proteinRatio}
            onChange={(e) => setNutrition(activeScenario, { proteinRatio: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">지방 (%)</span>
          <input type="number" value={inputs.fatRatio}
            onChange={(e) => setNutrition(activeScenario, { fatRatio: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums" />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ResultCard label="탄수화물" value={String(breakdown.carb)} unit="g" />
        <ResultCard label="단백질" value={String(breakdown.protein)} unit="g" emphasis="profit" />
        <ResultCard label="지방" value={String(breakdown.fat)} unit="g" />
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <p className="text-sm font-medium mb-3">영양소 비율</p>
        <CalcChart type="pie" data={pieData} />
      </div>

      <MemoInput calculatorId="nutrition" scenarioKey={activeScenario} />
    </div>
  )
}
```

- [ ] **Step 2: 페이지 파일**

`src/app/calculators/nutrition/page.tsx`:

```tsx
import NutritionCalc from '@/components/calculators/NutritionCalc'

export default function NutritionPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">육아 영양</h1>
      <NutritionCalc />
    </div>
  )
}
```

- [ ] **Step 3: 브라우저 확인 + 커밋**

```bash
git add src/components/calculators/NutritionCalc.tsx src/app/calculators/nutrition/
git commit -m "feat: add childcare nutrition calculator page"
```

---

## Task 13: 인사이트 리포트 페이지

**Files:**
- Create: `src/app/report/page.tsx`

- [ ] **Step 1: 리포트 페이지 구현**

`src/app/report/page.tsx`:

```tsx
'use client'

import { useCalcStore } from '@/store/useCalcStore'
import dayjs from 'dayjs'

export default function ReportPage() {
  const { reportItems, deleteReportItem, saveReportItem } = useCalcStore()

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold">인사이트 리포트</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          각 계산기에서 저장한 결과를 모아볼 수 있습니다.
        </p>
      </div>

      {reportItems.length === 0 ? (
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-sm text-[var(--muted-foreground)]">
          저장된 리포트 항목이 없습니다.
          <br />
          각 계산기에서 결과를 리포트에 저장해보세요.
        </div>
      ) : (
        <div className="space-y-3">
          {reportItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-[var(--border)] p-4 flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {item.calculatorLabel} · 시나리오 {item.scenarioKey}
                </p>
                <p className="text-sm font-medium mt-0.5">{item.summary}</p>
                <p className="text-lg font-bold tabular-nums mt-1">
                  {item.value.toLocaleString()}
                  <span className="text-sm font-normal ml-1 text-[var(--muted-foreground)]">{item.unit}</span>
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {dayjs(item.savedAt).format('YYYY-MM-DD HH:mm')}
                </p>
              </div>
              <button
                onClick={() => deleteReportItem(item.id)}
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--loss)] shrink-0"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 각 계산기에 "리포트 저장" 버튼 추가 (RealEstateCalc 예시)**

`src/components/calculators/RealEstateCalc.tsx` 하단 MemoInput 위에 추가:

```tsx
// 기존 import 아래에 추가
const { saveReportItem } = useCalcStore()

// MemoInput 위에 추가
<div className="flex justify-end">
  <button
    onClick={() =>
      saveReportItem({
        calculatorId: 'real-estate',
        calculatorLabel: '부동산 / 대출',
        scenarioKey: activeScenario,
        summary: `월 상환금 ${fmt(monthly)}원`,
        value: Math.round(monthly),
        unit: '원/월',
      })
    }
    className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-md hover:opacity-90 transition-opacity"
  >
    리포트에 저장
  </button>
</div>
```

동일한 패턴으로 InvestmentCalc, SourcingCalc, NutritionCalc 에도 추가 (각 계산기의 핵심 결과값 기준).

- [ ] **Step 3: 브라우저 확인**

Expected: 계산기에서 "리포트에 저장" 클릭 → `/report`에서 저장된 항목 목록 확인

- [ ] **Step 4: 커밋**

```bash
git add src/app/report/ src/components/calculators/
git commit -m "feat: add insight report page with save from calculators"
```

---

## Task 14: 빌드 검증 및 최종 점검

**Files:**
- Modify: `next.config.ts` (필요 시)

- [ ] **Step 1: 전체 테스트 실행**

```bash
npm test
```
Expected: 모든 테스트 PASS

- [ ] **Step 2: TypeScript 타입 체크**

```bash
npx tsc --noEmit
```
Expected: 에러 없음

- [ ] **Step 3: 프로덕션 빌드**

```bash
npm run build
```
Expected: 빌드 성공, `out/` 디렉토리 생성 (`output: 'export'` 설정 시)

- [ ] **Step 4: 빌드 결과물 확인**

```bash
npx serve out
```
Expected: `http://localhost:3000`에서 전체 앱 정상 동작

- [ ] **Step 5: 최종 커밋**

```bash
git add .
git commit -m "feat: complete ALL-IN-WEB CALC MVP implementation"
```

---

## 구현 범위 체크 (PRD vs Plan)

| PRD 요구사항 | 커버 태스크 |
|---|---|
| 통합 계산 모듈 (부동산, 투자, 소싱, 육아) | Task 3–5, 9–12 |
| 시나리오 A/B 비교 | Task 2 (Zustand), Task 7 (ScenarioTabs) |
| 종합 결과 리포트 | Task 13 |
| 메모 기능 | Task 7 (MemoInput), Task 2 (store) |
| 대시보드 레이아웃 (사이드바 + 메인) | Task 6 |
| 반응형 모바일 (햄버거 메뉴) | Task 6 (MobileHeader) |
| Recharts 차트 시각화 | Task 7 (CalcChart), 각 계산기 |
| LocalStorage 영속성 | Task 2 (persist middleware) |
| decimal.js 정밀 연산 | Task 3–5 |
| Pretendard 폰트 + tabular-nums | Task 1 |
