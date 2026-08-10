"use client"

import { Car, Plus, Search, Filter, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

import { getVehicles, addVehicle, getBrands, deleteVehicle } from "@/lib/actions/inventory"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Database } from "@/types/database"

type VehicleWithBrand = Database['public']['Tables']['vehicles']['Row'] & {
  brands: Database['public']['Tables']['brands']['Row'] | null
}

type NewVehicle = Database['public']['Tables']['vehicles']['Insert']

export default function VehiclesPage() {
  const { toast } = useToast()
  const [data, setData] = useState<VehicleWithBrand[]>([])
  const [brands, setBrands] = useState<Database['public']['Tables']['brands']['Row'][]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    brand_id: "",
    name: "",
    model_slug: "",
    variant: "",
    price_ex_showroom: "",
    body_type: "",
    fuel_type: "Petrol",
    transmission: "Manual",
    stock_count: "0"
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [vehicles, brandsData] = await Promise.all([
          getVehicles(),
          getBrands()
        ])
        setData(vehicles)
        setBrands(brandsData)
      } catch (error) {
        console.error("Failed to fetch vehicles:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredVehicles = data.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.brands?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const slug = formData.name.toLowerCase().replace(/ /g, '-')
      await addVehicle({
        ...formData,
        model_slug: slug,
        price_ex_showroom: parseFloat(formData.price_ex_showroom) || 0,
        stock_count: parseInt(formData.stock_count) || 0
      } as NewVehicle)


      toast({
        title: "Success",
        description: "Vehicle added successfully",
      })

      setShowAddModal(false)
      // Refresh data
      const vehicles = await getVehicles()
      setData(vehicles)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add vehicle"
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })

    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return

    try {
      await deleteVehicle(id)
      toast({
        title: "Deleted",
        description: "Vehicle removed successfully",
      })
      setData(data.filter(v => v.id !== id))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete vehicle"
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })
    }

  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Vehicle Management</h1>
          <p className="text-black/60">Manage your vehicle inventory</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[#023468] hover:bg-[#01254a]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-black/5">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Vehicle</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Brand</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Price</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-black/40">Loading vehicles...</td>
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
                          <div className="h-full w-full flex items-center justify-center bg-zinc-200 text-black/20">
                            <Car className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-black">{vehicle.name}</p>
                        <p className="text-sm text-black/60">{vehicle.variant}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-black/80">{vehicle.brands?.name}</td>
                  <td className="px-6 py-4 text-black/80">{vehicle.body_type}</td>
                  <td className="px-6 py-4 font-medium text-black">₹ {vehicle.price_ex_showroom?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${vehicle.stock_count > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                      {vehicle.stock_count > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4 text-black/60" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4 text-black/60" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(vehicle.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
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
            <Car className="h-12 w-12 text-black/20 mx-auto mb-4" />
            <p className="text-black/60">No vehicles found</p>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">Add New Vehicle</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <Trash2 className="h-5 w-5 text-black/60" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Brand</label>
                  <select
                    required
                    value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20 bg-white"
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Model Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., IONIQ 5"
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Variant</label>
                  <input
                    type="text"
                    value={formData.variant}
                    onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                    placeholder="e.g., Signature AWD"
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Body Type</label>
                  <select
                    value={formData.body_type}
                    onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20 bg-white"
                  >
                    <option value="">Select Type</option>
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="EV">EV</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Fuel Type</label>
                  <select
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20 bg-white"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Transmission</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20 bg-white"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Price (Ex-Showroom)</label>
                  <input
                    required
                    type="number"
                    value={formData.price_ex_showroom}
                    onChange={(e) => setFormData({ ...formData, price_ex_showroom: e.target.value })}
                    placeholder="e.g., 4605000"
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Initial Stock</label>
                  <input
                    type="number"
                    value={formData.stock_count}
                    onChange={(e) => setFormData({ ...formData, stock_count: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#023468] hover:bg-[#01254a] flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Vehicle"}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}
