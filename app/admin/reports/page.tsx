"use client"

import { FileText, TrendingUp, TrendingDown, Download, Calendar, BarChart3, PieChart, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Reports & Analytics</h1>
          <p className="text-black/60">View detailed reports and business insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button className="bg-[#023468] hover:bg-[#01254a]">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="h-4 w-4" />
              +18%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-black">₹ 4.5Cr</h3>
          <p className="text-sm text-black/60">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="h-4 w-4" />
              +23%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-black">156</h3>
          <p className="text-sm text-black/60">Vehicles Sold</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <PieChart className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="h-4 w-4" />
              +12%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-black">89</h3>
          <p className="text-sm text-black/60">New Leads</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <LineChart className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-red-600">
              <TrendingDown className="h-4 w-4" />
              -5%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-black">42%</h3>
          <p className="text-sm text-black/60">Conversion Rate</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-2xl p-6 border border-black/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-black">Sales Overview</h2>
            <select className="px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#023468]/20">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center border border-dashed border-black/10 rounded-xl">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-black/20 mx-auto mb-4" />
              <p className="text-black/40">Sales chart visualization</p>
            </div>
          </div>
        </div>

        {/* Brand Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-black/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-black">Brand Distribution</h2>
            <select className="px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#023468]/20">
              <option>Sales</option>
              <option>Leads</option>
              <option>Inventory</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center border border-dashed border-black/10 rounded-xl">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-black/20 mx-auto mb-4" />
              <p className="text-black/40">Brand distribution chart</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports Table */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5">
          <h2 className="text-lg font-bold text-black">Detailed Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-black/5">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Report Name</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Last Updated</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Monthly Sales Report", type: "Sales", updated: "2 hours ago" },
                { name: "Lead Conversion Report", type: "Marketing", updated: "1 day ago" },
                { name: "Inventory Status Report", type: "Inventory", updated: "3 hours ago" },
                { name: "Customer Analysis Report", type: "Customer", updated: "5 hours ago" },
                { name: "Revenue by Brand Report", type: "Finance", updated: "1 day ago" },
              ].map((report, index) => (
                <tr key={index} className="border-b border-black/5 hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-[#023468]" />
                      <span className="font-medium text-black">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-black/80">{report.type}</td>
                  <td className="px-6 py-4 text-black/80">{report.updated}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
