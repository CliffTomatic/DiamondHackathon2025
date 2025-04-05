import { Button } from "@/components/ui/button";


// Example component
export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-800">
      <h1 className="text-4xl font-bold text-primary dark:text-green-500">
        Welcome to BudgetGuard
      </h1>
      <p className="mt-4 text-secondary dark:text-orange-300">
        Your smart budgeting companion.
      </p>
      <button className="mt-6 px-4 py-2 font-semibold text-white bg-accent dark:bg-green-500 rounded hover:dark:bg-green-600">
        Get Started
      </button>
    </main>
  );
}