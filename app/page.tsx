import FormulaInput from "@/components/formula-input"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Formula Input Demo</h1>
        <FormulaInput />
      </div>
    </main>
  )
}
