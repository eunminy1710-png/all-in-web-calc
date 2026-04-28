import InvestmentCalc from '@/components/calculators/InvestmentCalc'

export default function InvestmentPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">투자 / 가상자산</h1>
      <InvestmentCalc />
    </div>
  )
}
