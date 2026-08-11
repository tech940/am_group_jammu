"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, Input, Select } from "@/components/ui/field"
import { Badge } from "@/components/ui/feedback"
import { SearchGlyph } from "@/components/system/marks"

/* Admin density is a 36px control, but the desk gets used on phones, so every
   control keeps the 44px touch floor below md. */
const DENSE = "min-h-11 md:min-h-0"

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

type Tone = "neutral" | "success" | "warning" | "danger" | "info"

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Status colour is a semantic token now, not Tailwind's default palette.
  const getStatusTone = (status: string): Tone => {
    switch (status) {
      case 'VIP': return 'info'
      case 'Active': return 'success'
      case 'New': return 'neutral'
      case 'Inactive': return 'neutral'
      default: return 'neutral'
    }
  }

  const totalRevenue = customers.reduce((sum, c) => sum + parseFloat(c.totalSpent.replace(/[₹L]/g, '')), 0)
  const activeCustomers = customers.filter(c => c.status === 'Active' || c.status === 'VIP').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-h2 uppercase text-ink">Customer Management</h1>
          <p className="text-small text-ink-2">Manage your customer base and relationships</p>
        </div>
        <Button type="button" variant="primary">
          Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-line bg-surface p-4">
          <p className="text-meta uppercase text-success-text">+12%</p>
          <h3 className="mt-3 font-display text-h2 text-ink" data-num>{customers.length}</h3>
          <p className="text-small text-ink-2">Total Customers</p>
        </div>

        <div className="border border-line bg-surface p-4">
          <p className="text-meta uppercase text-success-text">+18%</p>
          <h3 className="mt-3 font-display text-h2 text-ink" data-num>{activeCustomers}</h3>
          <p className="text-small text-ink-2">Active Customers</p>
        </div>

        <div className="border border-line bg-surface p-4">
          <p className="text-meta uppercase text-success-text">+23%</p>
          <h3 className="mt-3 font-display text-h2 text-ink" data-num>₹ {totalRevenue.toFixed(1)}L</h3>
          <p className="text-small text-ink-2">Total Revenue</p>
        </div>

        <div className="border border-line bg-surface p-4">
          <p className="text-meta uppercase text-ink-3">&mdash;</p>
          <h3 className="mt-3 font-display text-h2 text-ink" data-num>{customers.reduce((sum, c) => sum + c.totalPurchases, 0)}</h3>
          <p className="text-small text-ink-2">Total Purchases</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Field label="Search customers" hideLabel className="flex-1">
          {(a11y) => (
            <div className="relative">
              <SearchGlyph className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <Input
                {...a11y}
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </Field>
        <Field label="Filter by status" hideLabel className="md:w-[180px]">
          {(a11y) => (
            <Select
              {...a11y}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="VIP">VIP</option>
              <option value="Active">Active</option>
              <option value="New">New</option>
              <option value="Inactive">Inactive</option>
            </Select>
          )}
        </Field>
        <Button type="button" variant="secondary">
          More Filters
        </Button>
      </div>

      {/* Customers Table */}
      <div className="border border-line bg-surface">
        <div
          role="region"
          aria-label="Customer list table"
          tabIndex={0}
          className="overflow-x-auto overscroll-x-contain no-scrollbar"
        >
          <table className="w-full min-w-[920px] text-table">
            <thead className="sticky top-0 z-10 bg-ground-2">
              <tr className="border-b border-line">
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Customer</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Contact</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Purchases</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Total Spent</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Status</th>
                <th className="text-left px-4 py-3 text-meta uppercase text-ink-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-line hover:bg-ground-2 transition-colors duration-(--duration-1)">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 shrink-0 rounded-full bg-deep flex items-center justify-center font-display text-h4 text-on-deep">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-label text-ink">{customer.name}</p>
                        <p className="text-small text-ink-2">{customer.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-small text-ink-2">{customer.email}</p>
                      <p className="text-small text-ink-2" data-num>{customer.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-label text-ink" data-num>{customer.totalPurchases}</p>
                    <p className="text-small text-ink-2">Last: <span data-num>{customer.lastPurchase}</span></p>
                  </td>
                  <td className="px-4 py-3 text-label text-ink" data-num>{customer.totalSpent}</td>
                  <td className="px-4 py-3">
                    <Badge tone={getStatusTone(customer.status)}>
                      {customer.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="ghost" size="sm" className={DENSE}>
                        View
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className={DENSE}>
                        Email
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <p className="border-t border-line px-4 py-12 text-center text-body text-ink-2">
            No customers found
          </p>
        )}
      </div>
    </div>
  )
}
