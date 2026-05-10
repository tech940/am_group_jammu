"use client"

import { useState } from "react"
import { Users, Search, Filter, Eye, Mail, Phone, Calendar, ShoppingBag, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

const customers = [
  { 
    id: 1, 
    name: "Rahul Sharma", 
    email: "rahul@email.com", 
    phone: "+91 98765 43210",
    address: "Jammu, J&K",
    totalPurchases: 2,
    totalSpent: "₹ 45.5L",
    lastPurchase: "2025-04-15",
    status: "Active",
    joinedDate: "2024-01-10"
  },
  { 
    id: 2, 
    name: "Priya Singh", 
    email: "priya@email.com", 
    phone: "+91 87654 32109",
    address: "Srinagar, J&K",
    totalPurchases: 1,
    totalSpent: "₹ 25.0L",
    lastPurchase: "2025-03-22",
    status: "Active",
    joinedDate: "2024-02-15"
  },
  { 
    id: 3, 
    name: "Amit Kumar", 
    email: "amit@email.com", 
    phone: "+91 76543 21098",
    address: "Kathua, J&K",
    totalPurchases: 3,
    totalSpent: "₹ 82.3L",
    lastPurchase: "2025-05-08",
    status: "VIP",
    joinedDate: "2023-11-20"
  },
  { 
    id: 4, 
    name: "Sneha Verma", 
    email: "sneha@email.com", 
    phone: "+91 65432 10987",
    address: "Udhampur, J&K",
    totalPurchases: 1,
    totalSpent: "₹ 18.7L",
    lastPurchase: "2025-02-10",
    status: "Active",
    joinedDate: "2024-03-05"
  },
  { 
    id: 5, 
    name: "Vikram Mehta", 
    email: "vikram@email.com", 
    phone: "+91 54321 09876",
    address: "Ladakh",
    totalPurchases: 0,
    totalSpent: "₹ 0",
    lastPurchase: "-",
    status: "New",
    joinedDate: "2025-05-01"
  },
]

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VIP': return 'bg-purple-100 text-purple-600'
      case 'Active': return 'bg-green-100 text-green-600'
      case 'New': return 'bg-blue-100 text-blue-600'
      case 'Inactive': return 'bg-zinc-100 text-zinc-600'
      default: return 'bg-zinc-100 text-zinc-600'
    }
  }

  const totalRevenue = customers.reduce((sum, c) => sum + parseFloat(c.totalSpent.replace(/[₹L]/g, '')), 0)
  const activeCustomers = customers.filter(c => c.status === 'Active' || c.status === 'VIP').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Customer Management</h1>
          <p className="text-black/60">Manage your customer base and relationships</p>
        </div>
        <Button className="bg-[#023468] hover:bg-[#01254a]">
          <Users className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="h-4 w-4" />
              +12%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-black">{customers.length}</h3>
          <p className="text-sm text-black/60">Total Customers</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="h-4 w-4" />
              +18%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-black">{activeCustomers}</h3>
          <p className="text-sm text-black/60">Active Customers</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="h-4 w-4" />
              +23%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-black">₹ {totalRevenue.toFixed(1)}L</h3>
          <p className="text-sm text-black/60">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-black">{customers.reduce((sum, c) => sum + c.totalPurchases, 0)}</h3>
          <p className="text-sm text-black/60">Total Purchases</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
          <input
            type="text"
            placeholder="Search customers..."
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
          <option value="VIP">VIP</option>
          <option value="Active">Active</option>
          <option value="New">New</option>
          <option value="Inactive">Inactive</option>
        </select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-black/5">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Purchases</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Total Spent</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-black/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-black/5 hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-[#023468] flex items-center justify-center text-white font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-black">{customer.name}</p>
                        <p className="text-sm text-black/60">{customer.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-black/80">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black/80">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-black">{customer.totalPurchases}</p>
                    <p className="text-sm text-black/60">Last: {customer.lastPurchase}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-black">{customer.totalSpent}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4 text-black/60" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-black/20 mx-auto mb-4" />
            <p className="text-black/60">No customers found</p>
          </div>
        )}
      </div>
    </div>
  )
}
