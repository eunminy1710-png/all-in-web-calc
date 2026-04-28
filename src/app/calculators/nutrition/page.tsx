import NutritionCalc from '@/components/calculators/NutritionCalc'

export default function NutritionPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">육아 영양</h1>
      <NutritionCalc />
    </div>
  )
}
