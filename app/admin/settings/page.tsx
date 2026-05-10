"use client"

import { useState } from "react"
import { Settings, User, Bell, Shield, Database, Globe, Palette, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "database", name: "Database", icon: Database },
    { id: "appearance", name: "Appearance", icon: Palette },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Settings</h1>
        <p className="text-black/60">Manage your account and application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? "bg-[#023468] text-white"
                        : "text-black/70 hover:bg-zinc-50"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium text-sm">{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-black mb-6">Profile Settings</h2>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-20 w-20 rounded-full bg-[#023468] flex items-center justify-center text-white text-2xl font-bold">
                    A
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <p className="text-xs text-black/40 mt-1">JPG, PNG. Max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue="Admin"
                      className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue="User"
                      className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="admin@amgroup.in"
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Phone</label>
                  <input
                    type="tel"
                    defaultValue="+91 98765 43210"
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                  />
                </div>

                <div className="flex justify-end">
                  <Button className="bg-[#023468] hover:bg-[#01254a]">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-black mb-6">Notification Settings</h2>
                
                {[
                  { label: "New lead notifications", desc: "Get notified when a new lead is generated" },
                  { label: "Low stock alerts", desc: "Alert when vehicle stock is running low" },
                  { label: "Daily sales report", desc: "Receive daily sales summary via email" },
                  { label: "Customer inquiries", desc: "Notify when customers send messages" },
                  { label: "System updates", desc: "Get notified about system updates" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                    <div>
                      <p className="font-medium text-black">{item.label}</p>
                      <p className="text-sm text-black/60">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#023468]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#023468]"></div>
                    </label>
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button className="bg-[#023468] hover:bg-[#01254a]">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-black mb-6">Security Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Confirm Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                  <div>
                    <p className="font-medium text-black">Two-Factor Authentication</p>
                    <p className="text-sm text-black/60">Add an extra layer of security</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#023468]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#023468]"></div>
                  </label>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-[#023468] hover:bg-[#01254a]">
                    <Save className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "database" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-black mb-6">Database Settings</h2>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Database changes are permanent. Please backup before making changes.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Restore from Backup
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Export All Data
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-black mb-6">Appearance Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Theme</label>
                  <select className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20 bg-white">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System Default</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Primary Color</label>
                  <div className="flex gap-4">
                    {['#023468', '#E31837', '#0EA5E9', '#10B981'].map((color) => (
                      <button
                        key={color}
                        className="h-12 w-12 rounded-xl border-2 border-black/10 hover:border-black/30 transition-colors"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Language</label>
                  <select className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20 bg-white">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Urdu</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-[#023468] hover:bg-[#01254a]">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
