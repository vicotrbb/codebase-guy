import { AgentsTable } from "@/components/agents-table"

export default function Agents() {
  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
        </div>
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <AgentsTable />
        </div>
      </div>
    </div>
  )
}

