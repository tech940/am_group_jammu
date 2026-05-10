"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Search, Filter, Eye, Phone, Mail, Calendar, Clock, X, MapPin, Users, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"

import { getLeads } from "@/lib/actions/leads"
import { Database } from "@/types/database"

type LeadWithData = Database['public']['Tables']['leads']['Row'] & {
  vehicles: (Database['public']['Tables']['vehicles']['Row'] & {
    images: string | string[] | null
  }) | null
  dealerships: { name: string } | null
}


const leads = [
  { 
    id: 1, 
    name: "Rahul Sharma", 
    email: "rahul@email.com", 
    phone: "+91 98765 43210",
    vehicle: "Hyundai IONIQ 5", 
    status: "New", 
    source: "Website",
    date: "2025-05-10 14:30",
    message: "Interested in the IONIQ 5. Please share more details."
  },
  { 
    id: 2, 
    name: "Priya Singh", 
    email: "priya@email.com", 
    phone: "+91 87654 32109",
    vehicle: "Kia EV6", 
    status: "Contacted", 
    source: "Test Drive",
    date: "2025-05-10 13:45",
    message: "Scheduled test drive for Saturday."
  },
  { 
    id: 3, 
    name: "Amit Kumar", 
    email: "amit@email.com", 
    phone: "+91 76543 21098",
    vehicle: "MG Astor", 
    status: "Hot Lead", 
    source: "Phone",
    date: "2025-05-10 12:15",
    message: "Urgent purchase decision. Need immediate attention."
  },
  { 
    id: 4, 
    name: "Sneha Verma", 
    email: "sneha@email.com", 
    phone: "+91 65432 10987",
    vehicle: "Ford Mustang", 
    status: "New", 
    source: "Website",
    date: "2025-05-10 11:30",
    message: "Looking for financing options."
  },
  { 
    id: 5, 
    name: "Vikram Mehta", 
    email: "vikram@email.com", 
    phone: "+91 54321 09876",
    vehicle: "Mahindra XUV700", 
    status: "Follow-up", 
    source: "Email",
    date: "2025-05-10 10:00",
    message: "Sent quote. Waiting for response."
  },
]


export default function LeadsPage() {

  const [data, setData] = useState<LeadWithData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedLead, setSelectedLead] = useState<LeadWithData | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const leads = await getLeads()
        setData(leads)
      } catch (error) {
        console.error("Failed to fetch leads:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredLeads = data.filter(lead => {
    const matchesSearch = lead.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.vehicles?.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-600'
      case 'Hot Lead': return 'bg-red-100 text-red-600'
      case 'Contacted': return 'bg-green-100 text-green-600'
      case 'Follow-up': return 'bg-amber-100 text-amber-600'
      case 'Closed': return 'bg-zinc-100 text-zinc-600'
      default: return 'bg-zinc-100 text-zinc-600'
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Lead Management</h1>
          <p className="text-black/60">Manage customer inquiries and leads</p>
        </div>
        <Button className="bg-[#023468] hover:bg-[#01254a]">
          <MessageSquare className="h-4 w-4 mr-2" />
          Export Leads
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['New', 'Hot Lead', 'Contacted', 'Follow-up', 'Closed'].map((status) => (
          <div key={status} className="bg-white rounded-xl p-4 border border-black/5">
            <p className="text-sm text-black/60 mb-1">{status}</p>
            <p className="text-2xl font-bold text-[#023468]">
              {leads.filter(l => l.status === status).length}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20 bg-white"
        >
          <option value="all">All Status</option>
          <option value="New">New</option>
          <option value="Hot Lead">Hot Lead</option>
          <option value="Contacted">Contacted</option>
          <option value="Follow-up">Follow-up</option>
          <option value="Closed">Closed</option>
        </select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-black/5">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Lead</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Vehicle</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Source</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-black/40">Loading leads...</td>
                </tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-black/5 hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-black">{lead.customer_name}</p>
                      <div className="flex items-center gap-2 text-sm text-black/60">
                        <Mail className="h-3 w-3" />
                        {lead.customer_email || "No Email"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black/60">
                        <Phone className="h-3 w-3" />
                        {lead.customer_phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-black/80">{lead.vehicles?.name || "General Inquiry"}</td>
                  <td className="px-6 py-4 text-black/80">{lead.inquiry_type || "Direct"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-black/60">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{new Date(lead.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-black/60">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <Eye className="h-4 w-4 text-[#023468]" />
                      </Button>

                      <Button variant="ghost" size="icon" asChild>
                        <a href={`tel:${lead.customer_phone}`}>
                          <Phone className="h-4 w-4 text-green-600" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`mailto:${lead.customer_email}`}>
                          <Mail className="h-4 w-4 text-blue-600" />
                        </a>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-black/20 mx-auto mb-4" />
            <p className="text-black/60">No leads found</p>
          </div>
        )}
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
                     <h3 className="text-2xl font-black text-white">{selectedLead.vehicles?.name || "General Inquiry"}</h3>
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
                      <p className="text-lg font-bold text-white">{selectedLead.vehicles?.price_ex_showroom ? `₹ ${selectedLead.vehicles.price_ex_showroom.toLocaleString()}*` : "N/A"}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Inquiry Type</p>
                      <p className="text-lg font-bold text-white">{selectedLead.inquiry_type || "Direct"}</p>
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
                          <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Source: {selectedLead.inquiry_type || "Digital Showroom"}</p>
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

