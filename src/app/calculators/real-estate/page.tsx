import RealEstateCalc from '@/components/calculators/RealEstateCalc'

export default function RealEstatePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">부동산 / 대출</h1>
      <RealEstateCalc />
    </div>
  )
}
