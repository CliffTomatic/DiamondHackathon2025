import { Button } from "@/components/ui/button";


export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600">🚀 BudgetGuardian</h1>
      <p className="mt-4 text-lg text-gray-700">
        Your real-time budgeting sidekick for Amazon & Etsy.
      </p>
      <Button className="mt-4">Click Me</Button>
    </main>
  );
}
