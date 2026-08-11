"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, ConfirmDialog } from "@/components/ui/dialog"
import { Field, Input, Select } from "@/components/ui/field"
import { Badge } from "@/components/ui/feedback"
import { SearchGlyph } from "@/components/system/marks"

import { getVehicles, addVehicle, getBrands, deleteVehicle } from "@/lib/actions/inventory"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Database } from "@/types/database"

type VehicleWithBrand = Database['public']['Tables']['vehicles']['Row'] & {
  brands: Database['public']['Tables']['brands']['Row'] | null
}

type NewVehicle = Database['public']['Tables']['vehicles']['Insert']

/* Admin density is a 36px control, but the desk gets used on phones, so every
   control keeps the 44px touch floor below md. */
const DENSE = "min-h-11 md:min-h-0"

export default function VehiclesPage() {
  const { toast } = useToast()
  const [data, setData] = useState<VehicleWithBrand[]>([])
  const [brands, setBrands] = useState<Database['public']['Tables']['brands']['Row'][]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // The delete target lives in state so the confirmation can be a real Dialog
  // rather than window.confirm(), which cannot be styled, trapped or themed.
  const [pendingDelete, setPendingDelete] = useState<VehicleWithBrand | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      await handleDelete(pendingDelete.id)
    } finally {
      setIsDeleting(false)
      setPendingDelete(null)
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-h2 uppercase text-ink">Vehicle Management</h1>
          <p className="text-small text-ink-2">Manage your vehicle inventory</p>
        </div>
        <Button type="button" variant="primary" onClick={() => setShowAddModal(true)}>
          Add Vehicle
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Field label="Search vehicles" hideLabel className="flex-1">
          {(a11y) => (
            <div className="relative">
              <SearchGlyph className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <Input
                {...a11y}
                type="text"
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </Field>
        <Button type="button" variant="secondary">
          Filter
        </Button>
      </div>

      {/* Vehicles Table */}
      <div className="border border-line bg-surface">
        <div
          role="region"
          aria-label="Vehicle inventory table"
          tabIndex={0}
          className="overflow-x-auto overscroll-x-contain no-scrollbar"
        >
          <table className="w-full min-w-[880px] text-table">
            <thead className="sticky top-0 z-10 bg-ground-2">
              <tr className="border-b border-line">
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Vehicle</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Brand</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Type</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Price</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Status</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-ink-2">Loading vehicles...</td>
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
                        <p className="text-small text-ink-2">{vehicle.variant}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-2">{vehicle.brands?.name}</td>
                  <td className="px-4 py-3 text-ink-2">{vehicle.body_type}</td>
                  <td className="px-4 py-3 text-label text-ink" data-num>₹ {vehicle.price_ex_showroom?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge tone={vehicle.stock_count > 0 ? "success" : "danger"}>
                      {vehicle.stock_count > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="ghost" size="sm" className={DENSE}>
                        View
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className={DENSE}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={`${DENSE} text-danger-text hover:bg-danger-bg`}
                        onClick={() => setPendingDelete(vehicle)}
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
            No vehicles found
          </p>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <Dialog
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Vehicle"
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-vehicle-form"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Vehicle"}
            </Button>
          </>
        }
      >
        <form id="add-vehicle-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Brand" required>
              {(a11y) => (
                <Select
                  {...a11y}
                  required
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Model Name" required>
              {(a11y) => (
                <Input
                  {...a11y}
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., IONIQ 5"
                />
              )}
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Variant">
              {(a11y) => (
                <Input
                  {...a11y}
                  type="text"
                  value={formData.variant}
                  onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                  placeholder="e.g., Signature AWD"
                />
              )}
            </Field>
            <Field label="Body Type">
              {(a11y) => (
                <Select
                  {...a11y}
                  value={formData.body_type}
                  onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                >
                  <option value="">Select Type</option>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="EV">EV</option>
                  <option value="Luxury">Luxury</option>
                </Select>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Fuel Type">
              {(a11y) => (
                <Select
                  {...a11y}
                  value={formData.fuel_type}
                  onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </Select>
              )}
            </Field>
            <Field label="Transmission">
              {(a11y) => (
                <Select
                  {...a11y}
                  value={formData.transmission}
                  onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                >
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </Select>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Price (Ex-Showroom)" required>
              {(a11y) => (
                <Input
                  {...a11y}
                  required
                  type="number"
                  value={formData.price_ex_showroom}
                  onChange={(e) => setFormData({ ...formData, price_ex_showroom: e.target.value })}
                  placeholder="e.g., 4605000"
                />
              )}
            </Field>
            <Field label="Initial Stock">
              {(a11y) => (
                <Input
                  {...a11y}
                  type="number"
                  value={formData.stock_count}
                  onChange={(e) => setFormData({ ...formData, stock_count: e.target.value })}
                  placeholder="0"
                />
              )}
            </Field>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete vehicle"
        description="Are you sure you want to delete this vehicle?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        pending={isDeleting}
      />
    </div>
  )
}
