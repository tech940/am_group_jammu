"use client"

import { useState, useEffect } from "react"
import { Package, Search, Filter, AlertCircle, Clock, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getVehicles } from "@/lib/actions/inventory"
import { Database } from "@/types/database"

const inventoryStats = [
  { title: "Total Stock", value: "156", change: "+12", icon: Package, trend: "up" },
  { title: "Low Stock", value: "8", change: "-2", icon: AlertCircle, trend: "down" },
  { title: "Out of Stock", value: "3", change: "0", icon: Clock, trend: "neutral" },
  { title: "Stock Value", value: "₹ 12.5Cr", change: "+18", icon: TrendingUp, trend: "up" },
]

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

  const getStockColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-600'
      case 'Low Stock': return 'bg-amber-100 text-amber-600'
      case 'Out of Stock': return 'bg-red-100 text-red-600'
      default: return 'bg-zinc-100 text-zinc-600'
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Inventory Management</h1>
          <p className="text-black/60">Track and manage vehicle stock levels</p>
        </div>
        <Button className="bg-[#023468] hover:bg-[#01254a]">
          <Package className="h-4 w-4 mr-2" />
          Add Stock
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {inventoryStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-xl p-6 border border-black/5">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-[#023468]/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[#023468]" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'down' ? 'text-red-600' : 
                  'text-zinc-600'
                }`}>
                  {stat.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                  {stat.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-black">{stat.value}</h3>
              <p className="text-sm text-black/60">{stat.title}</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
          />
        </div>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20 bg-white"
        >
          <option value="all">All Stock</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-black/5">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Vehicle</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Stock Level</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Last Updated</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-black/40">Loading inventory...</td>
                </tr>
              ) : filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-black/5 hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-zinc-100 overflow-hidden">
                        {vehicle.images && vehicle.images.length > 0 ? (
                          <img 
                            src={vehicle.images[0]} 
                            alt={vehicle.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-zinc-200">
                             <Package className="h-6 w-6 text-black/20" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-black">{vehicle.name}</p>
                        <p className="text-sm text-black/60">{vehicle.brands?.name} • {vehicle.variant}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-2xl font-bold text-black">{vehicle.stock_count}</p>
                      <p className="text-sm text-black/60">units</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStockColor(getStockStatus(vehicle.stock_count))}`}>
                      {getStockStatus(vehicle.stock_count)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-black/80">
                    {new Date(vehicle.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
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
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-black/20 mx-auto mb-4" />
            <p className="text-black/60">No inventory found</p>
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-black mb-2">Low Stock Alert</h3>
            <p className="text-black/70 mb-4">
              You have {inventoryStats[1].value} vehicles with low stock levels. Consider restocking soon to avoid lost sales.
            </p>
            <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
              View Low Stock Items
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
