import InputForm from "../components/InputForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Simple Pension Planner
          </h1>

        </div>
        <InputForm />
      </div>
      <div className="max-w-2xl mx-auto text-center text-gray-500 text-sm mt-4 mb-16">
        <p>Disclaimer: The results provided by this tool are for illustrative purposes only and may not be accurate. Please consult with a financial professional for personalised advice.</p>
      </div>
    </main>
  );
}
