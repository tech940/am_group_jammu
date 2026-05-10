"use client"

import { Car, Users, MessageSquare, TrendingUp, Package, DollarSign, Eye, X, Phone, Mail, MapPin, ExternalLink, Calendar } from "lucide-react"

import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import Image from "next/image"

import { getLeads } from "@/lib/actions/leads"
import { getVehicles } from "@/lib/actions/inventory"
import { useEffect, useState } from "react"
import { Database } from "@/types/database"

type LeadWithDetails = Database['public']['Tables']['leads']['Row'] & {
  vehicles: (Database['public']['Tables']['vehicles']['Row'] & {
    images: string | string[] | null
  }) | null
  dealerships: { name: string } | null
}



const stats = [
  {
    title: "Total Vehicles",
    value: "156",
    change: "+12%",
    icon: Car,
    color: "bg-blue-500",
  },
  {
    title: "Active Leads",
    value: "89",
    change: "+8%",
    icon: MessageSquare,
    color: "bg-green-500",
  },
  {
    title: "Total Customers",
    value: "1,234",
    change: "+23%",
    icon: Users,
    color: "bg-purple-500",
  },
  {
    title: "Revenue",
    value: "₹ 4.5Cr",
    change: "+18%",
    icon: DollarSign,
    color: "bg-amber-500",
  },
]

const recentLeads = [
  { id: 1, name: "Rahul Sharma", vehicle: "Hyundai IONIQ 5", status: "New", date: "2 min ago" },
  { id: 2, name: "Priya Singh", vehicle: "Kia EV6", status: "Contacted", date: "15 min ago" },
  { id: 3, name: "Amit Kumar", vehicle: "MG Astor", status: "Hot Lead", date: "1 hour ago" },
  { id: 4, name: "Sneha Verma", vehicle: "Ford Mustang", status: "New", date: "2 hours ago" },
  { id: 5, name: "Vikram Mehta", vehicle: "Mahindra XUV700", status: "Follow-up", date: "3 hours ago" },
]

const recentVehicles = [
  { id: 1, name: "Hyundai IONIQ 5", price: "₹ 46.05 Lakh*", status: "In Stock", views: "234" },
  { id: 2, name: "Kia EV6", price: "₹ 60.95 Lakh*", status: "In Stock", views: "189" },
  { id: 3, name: "MG Astor", price: "₹ 10.52 Lakh*", status: "Low Stock", views: "345" },
  { id: 4, name: "Ford Mustang", price: "₹ 74.61 Lakh*", status: "In Stock", views: "412" },
]


export default function AdminDashboard() {
  const [data, setData] = useState({
    leads: [] as LeadWithDetails[],
    vehicles: [] as Database['public']['Tables']['vehicles']['Row'][],
    isLoading: true
  })

  const [selectedLead, setSelectedLead] = useState<LeadWithDetails | null>(null)




  useEffect(() => {
    async function fetchData() {
      try {
        const [leads, vehicles] = await Promise.all([
          getLeads(),
          getVehicles()
        ])
        setData({
          leads: leads.slice(0, 5),
          vehicles: vehicles.slice(0, 4),
          isLoading: false
        })
      } catch (error) {
        console.error("Failed to fetch admin data:", error)
        setData(prev => ({ ...prev, isLoading: false }))
      }
    }
    fetchData()
  }, [])

  const { leads, vehicles, isLoading } = data

  return (
    <div className="space-y-8 pb-20">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <h3 className="text-3xl font-bold text-black mb-1">{stat.value}</h3>
              <p className="text-sm text-black/60">{stat.title}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-black">Recent Leads</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-black/40">Loading leads...</p>
            ) : leads.length === 0 ? (
              <p className="text-sm text-black/40">No leads found.</p>
            ) : leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#023468] flex items-center justify-center text-white font-bold">
                    {lead.customer_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-black">{lead.customer_name}</p>
                    <p className="text-sm text-black/60">{lead.vehicles?.name || "General Inquiry"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      lead.status === 'New' ? 'bg-blue-100 text-blue-600' :
                      lead.status === 'Hot Lead' ? 'bg-red-100 text-red-600' :
                      lead.status === 'Contacted' ? 'bg-green-100 text-green-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {lead.status}
                    </span>
                    <p className="text-xs text-black/40 mt-1">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLead(lead);
                    }}
                    className="p-2 hover:bg-[#023468]/5 rounded-lg transition-all text-[#023468] border border-black/5"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Vehicles */}
        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-black">Recent Vehicles</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {isLoading ? (
               <p className="text-sm text-black/40">Loading vehicles...</p>
            ) : vehicles.length === 0 ? (
               <p className="text-sm text-black/40">No vehicles found.</p>
            ) : vehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[#023468] flex items-center justify-center">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-black">{vehicle.name}</p>
                    <p className="text-sm text-black/60">₹ {vehicle.price_ex_showroom?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    vehicle.stock_count > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {vehicle.stock_count > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <p className="text-xs text-black/40 mt-1">{vehicle.body_type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
        <h2 className="text-lg font-bold text-black mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-24 flex-col gap-2 bg-[#023468] hover:bg-[#01254a]">
            <Car className="h-6 w-6" />
            <span className="text-sm">Add Vehicle</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2">
            <Users className="h-6 w-6" />
            <span className="text-sm">Add Customer</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2">
            <MessageSquare className="h-6 w-6" />
            <span className="text-sm">View Leads</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2">
            <TrendingUp className="h-6 w-6" />
            <span className="text-sm">View Reports</span>
          </Button>
        </div>
      </div>

      {/* Lead Dossier Popup */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[700px] bg-white rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedLead(null)}
                className="absolute top-6 right-6 h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-all z-20"
              >
                <X className="h-5 w-5 text-black" />
              </button>

              <div className="flex flex-col md:flex-row overflow-hidden">
                {/* Left Side: Vehicle Info */}
                <div className="md:w-[300px] bg-[#023468] p-8 text-white flex flex-col shrink-0">
                  <div className="mb-8">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Customer Inquiry For</p>
                     <h3 className="text-2xl font-black">{selectedLead.vehicles?.name || "General Inquiry"}</h3>
                  </div>

                  {selectedLead.vehicles?.images && (
                    <div className="relative h-40 rounded-2xl overflow-hidden mb-6 bg-white/5 border border-white/10 p-2">
                        <Image 
                         src={(Array.isArray(selectedLead.vehicles.images) ? selectedLead.vehicles.images[0] : selectedLead.vehicles.images) || "/placeholder-car.png"} 
                         alt={selectedLead.vehicles.name} 
                         fill
                         className="object-cover rounded-xl" 
                       />


                    </div>
                  )}


                  <div className="space-y-4 mt-auto">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Vehicle Price</p>
                      <p className="text-lg font-bold">{selectedLead.vehicles?.price_ex_showroom ? `₹ ${selectedLead.vehicles.price_ex_showroom.toLocaleString()}*` : "N/A"}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Inquiry Type</p>
                      <p className="text-lg font-bold">{selectedLead.inquiry_type || "Direct"}</p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Customer Details */}
                <div className="flex-1 p-8 lg:p-10 overflow-y-auto no-scrollbar">
                  <div className="mb-10">
                    <h2 className="text-3xl font-black text-[#023468] mb-1">Lead Details</h2>
                    <p className="text-black/40 text-xs font-bold flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Received on {new Date(selectedLead.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 bg-zinc-50 rounded-2xl border border-black/5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-black/30 mb-2 flex items-center gap-2">
                          <Users className="h-3 w-3" /> Full Name
                        </p>
                        <p className="text-base font-black text-black">{selectedLead.customer_name}</p>
                      </div>
                      <div className="p-5 bg-zinc-50 rounded-2xl border border-black/5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-black/30 mb-2 flex items-center gap-2">
                          <Phone className="h-3 w-3" /> Phone Number
                        </p>
                        <p className="text-base font-black text-black">{selectedLead.customer_phone}</p>
                      </div>
                    </div>

                    <div className="p-5 bg-zinc-50 rounded-2xl border border-black/5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-black/30 mb-2 flex items-center gap-2">
                        <Mail className="h-3 w-3" /> Email Address
                      </p>
                      <p className="text-base font-black text-black">{selectedLead.customer_email || "Not Provided"}</p>
                    </div>

                    {/* Message */}
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-black/30 mb-3 flex items-center gap-2">
                        <MessageSquare className="h-3 w-3" /> Inquiry Message
                      </p>
                      <div className="p-6 bg-[#E7F8F2] rounded-3xl border border-[#059669]/10">
                        <p className="text-sm text-black/70 leading-relaxed italic whitespace-pre-wrap">
                          &quot;{selectedLead.message || "Customer is interested in hearing more about this vehicle."}&quot;
                        </p>

                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="pt-6 border-t border-black/5 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                             <MapPin className="h-4 w-4" />
                          </div>
                          <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Source: Inventory Page</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{selectedLead.status}</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

