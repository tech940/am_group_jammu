"use client"

import { Button } from "@/components/ui/button"
import { Field, Select } from "@/components/ui/field"

/* Admin density is a 36px control, but the desk gets used on phones, so every
   control keeps the 44px touch floor below md. */
const DENSE = "min-h-11 md:min-h-0"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-h2 uppercase text-ink">Reports &amp; Analytics</h1>
          <p className="text-small text-ink-2">View detailed reports and business insights</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary">
            Date Range
          </Button>
          <Button type="button" variant="primary">
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-line bg-surface p-4">
          <p className="text-meta uppercase text-success-text" data-num>+18%</p>
          <h3 className="mt-3 font-display text-h2 text-ink" data-num>₹ 4.5Cr</h3>
          <p className="text-small text-ink-2">Total Revenue</p>
        </div>

        <div className="border border-line bg-surface p-4">
          <p className="text-meta uppercase text-success-text" data-num>+23%</p>
          <h3 className="mt-3 font-display text-h2 text-ink" data-num>156</h3>
          <p className="text-small text-ink-2">Vehicles Sold</p>
        </div>

        <div className="border border-line bg-surface p-4">
          <p className="text-meta uppercase text-success-text" data-num>+12%</p>
          <h3 className="mt-3 font-display text-h2 text-ink" data-num>89</h3>
          <p className="text-small text-ink-2">New Leads</p>
        </div>

        <div className="border border-line bg-surface p-4">
          <p className="text-meta uppercase text-danger-text" data-num>-5%</p>
          <h3 className="mt-3 font-display text-h2 text-ink" data-num>42%</h3>
          <p className="text-small text-ink-2">Conversion Rate</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="border border-line bg-surface p-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-display text-h3 uppercase text-ink">Sales Overview</h2>
            <Field label="Sales overview period" hideLabel className="w-[160px]">
              {(a11y) => (
                <Select {...a11y}>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>This Year</option>
                </Select>
              )}
            </Field>
          </div>
          {/* Reserved plate: the chart is not built yet, and a fake one would
              be a claim the data does not support. */}
          <div className="h-64 flex items-center justify-center border border-dashed border-line-strong">
            <p className="text-small text-ink-2">Sales chart visualization</p>
          </div>
        </div>

        {/* Brand Distribution */}
        <div className="border border-line bg-surface p-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-display text-h3 uppercase text-ink">Brand Distribution</h2>
            <Field label="Brand distribution metric" hideLabel className="w-[160px]">
              {(a11y) => (
                <Select {...a11y}>
                  <option>Sales</option>
                  <option>Leads</option>
                  <option>Inventory</option>
                </Select>
              )}
            </Field>
          </div>
          <div className="h-64 flex items-center justify-center border border-dashed border-line-strong">
            <p className="text-small text-ink-2">Brand distribution chart</p>
          </div>
        </div>
      </div>

      {/* Detailed Reports Table */}
      <div className="border border-line bg-surface">
        <div className="p-4 border-b border-line">
          <h2 className="font-display text-h3 uppercase text-ink">Detailed Reports</h2>
        </div>
        <div
          role="region"
          aria-label="Detailed reports table"
          tabIndex={0}
          className="overflow-x-auto overscroll-x-contain no-scrollbar"
        >
          <table className="w-full min-w-[720px] text-table">
            <thead className="sticky top-0 z-10 bg-ground-2">
              <tr className="border-b border-line">
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Report Name</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Type</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Last Updated</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Actions</th>
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
                <tr key={index} className="border-b border-line hover:bg-ground-2 transition-colors duration-(--duration-1)">
                  <td className="px-4 py-3">
                    <span className="text-label text-ink">{report.name}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-2">{report.type}</td>
                  <td className="px-4 py-3 text-ink-2">{report.updated}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="ghost" size="sm" className={DENSE}>
                        View
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className={DENSE}>
                        Download
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
