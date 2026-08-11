"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Field, Input, Select } from "@/components/ui/field"
import { Alert, Badge } from "@/components/ui/feedback"
import { SearchGlyph } from "@/components/system/marks"
import { getVehicles } from "@/lib/actions/inventory"
import { Database } from "@/types/database"

const inventoryStats = [
  { title: "Total Stock", value: "156", change: "+12", trend: "up" },
  { title: "Low Stock", value: "8", change: "-2", trend: "down" },
  { title: "Out of Stock", value: "3", change: "0", trend: "neutral" },
  { title: "Stock Value", value: "₹ 12.5Cr", change: "+18", trend: "up" },
]

/* Admin density is a 36px control, but the desk gets used on phones, so every
   control keeps the 44px touch floor below md. */
const DENSE = "min-h-11 md:min-h-0"

type Tone = "neutral" | "success" | "warning" | "danger" | "info"

type VehicleWithBrand = Database['public']['Tables']['vehicles']['Row'] & {
  brands: Database['public']['Tables']['brands']['Row'] | null
}

export default function InventoryPage() {
  const [data, setData] = useState<VehicleWithBrand[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [stockFilter, setStockFilter] = useState("all")

  useEffect(() => {
    async function fetchData() {
      try {
        const vehicles = await getVehicles()
        setData(vehicles)
      } catch (error) {
        console.error("Failed to fetch inventory:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredVehicles = data.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.brands?.name.toLowerCase().includes(searchQuery.toLowerCase())

    const status = v.stock_count > 10 ? 'In Stock' : v.stock_count > 0 ? 'Low Stock' : 'Out of Stock'
    const matchesStock = stockFilter === "all" || status === stockFilter
    return matchesSearch && matchesStock
  })

  const getStockStatus = (count: number) => {
    if (count > 10) return 'In Stock'
    if (count > 0) return 'Low Stock'
    return 'Out of Stock'
  }

  // Stock colour is a semantic token now, not Tailwind's default palette.
  const getStockTone = (status: string): Tone => {
    switch (status) {
      case 'In Stock': return 'success'
      case 'Low Stock': return 'warning'
      case 'Out of Stock': return 'danger'
      default: return 'neutral'
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-h2 uppercase text-ink">Inventory Management</h1>
          <p className="text-small text-ink-2">Track and manage vehicle stock levels</p>
        </div>
        <Button type="button" variant="primary">
          Add Stock
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {inventoryStats.map((stat) => (
          <div key={stat.title} className="border border-line bg-surface p-4">
            <p className={`text-meta uppercase ${
              stat.trend === 'up' ? 'text-success-text' :
              stat.trend === 'down' ? 'text-danger-text' :
              'text-ink-2'
            }`} data-num>
              {stat.change}
            </p>
            <h3 className="mt-3 font-display text-h2 text-ink" data-num>{stat.value}</h3>
            <p className="text-small text-ink-2">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Field label="Search inventory" hideLabel className="flex-1">
          {(a11y) => (
            <div className="relative">
              <SearchGlyph className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <Input
                {...a11y}
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </Field>
        <Field label="Filter by stock level" hideLabel className="md:w-[180px]">
          {(a11y) => (
            <Select
              {...a11y}
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">All Stock</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </Select>
          )}
        </Field>
        <Button type="button" variant="secondary">
          More Filters
        </Button>
      </div>

      {/* Inventory Table */}
      <div className="border border-line bg-surface">
        <div
          role="region"
          aria-label="Stock level table"
          tabIndex={0}
          className="overflow-x-auto overscroll-x-contain no-scrollbar"
        >
          <table className="w-full min-w-[820px] text-table">
            <thead className="sticky top-0 z-10 bg-ground-2">
              <tr className="border-b border-line">
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Vehicle</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Stock Level</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Status</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Last Updated</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-ink-2">Loading inventory...</td>
                </tr>
              ) : filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-line hover:bg-ground-2 transition-colors duration-(--duration-1)">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      {/* Missing photography is a reserved plate, not a placeholder icon. */}
                      <div className="h-12 w-12 shrink-0 overflow-hidden border border-line bg-ground-2">
                        {vehicle.images && vehicle.images.length > 0 ? (
                          <Image
                            src={vehicle.images[0]}
                            alt={vehicle.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="text-label text-ink">{vehicle.name}</p>
                        <p className="text-small text-ink-2">{vehicle.brands?.name} • {vehicle.variant}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-display text-h3 text-ink" data-num>{vehicle.stock_count}</p>
                      <p className="text-small text-ink-2">units</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={getStockTone(getStockStatus(vehicle.stock_count))}>
                      {getStockStatus(vehicle.stock_count)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-2" data-num>
                    {new Date(vehicle.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="secondary" size="sm" className={DENSE}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className={`${DENSE} text-danger-text hover:bg-danger-bg`}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>

        {filteredVehicles.length === 0 && (
          <p className="border-t border-line px-4 py-12 text-center text-body text-ink-2">
            No inventory found
          </p>
        )}
      </div>

      {/* Low Stock Alert */}
      <Alert tone="warning" title="Low Stock Alert">
        <p>
          You have {inventoryStats[1].value} vehicles with low stock levels. Consider restocking soon to avoid lost sales.
        </p>
        <Button type="button" variant="secondary" size="sm" className={`mt-4 ${DENSE}`}>
          View Low Stock Items
        </Button>
      </Alert>
    </div>
  )
}
