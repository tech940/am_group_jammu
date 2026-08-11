"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, Input, Select } from "@/components/ui/field"
import { Alert } from "@/components/ui/feedback"

/* The toggle is hand-rolled because there is no Switch primitive yet. The
   input stays the real control — it is only visually hidden — so keyboard and
   screen-reader behaviour is the native checkbox's. */
const SWITCH_TRACK =
  "relative block h-6 w-11 rounded-full border border-line-strong bg-ground-2 " +
  "transition-colors duration-(--duration-1) " +
  "after:absolute after:left-[2px] after:top-[2px] after:h-[18px] after:w-[18px] " +
  "after:rounded-full after:border after:border-line-strong after:bg-surface " +
  "after:transition-transform after:duration-(--duration-1) after:content-[''] " +
  "peer-checked:border-deep peer-checked:bg-deep " +
  "peer-checked:after:translate-x-[20px] peer-checked:after:border-deep " +
  "peer-focus-visible:outline peer-focus-visible:outline-2 " +
  "peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    { id: "profile", name: "Profile" },
    { id: "notifications", name: "Notifications" },
    { id: "security", name: "Security" },
    { id: "database", name: "Database" },
    { id: "appearance", name: "Appearance" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-h2 uppercase text-ink">Settings</h1>
        <p className="text-small text-ink-2">Manage your account and application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="border border-line bg-surface p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                  className={`flex h-11 w-full items-center rounded-sm px-4 text-nav transition-colors duration-(--duration-1) ${
                    activeTab === tab.id
                      ? "bg-deep text-on-deep"
                      : "text-ink-2 hover:bg-ground-2 hover:text-ink"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="border border-line bg-surface p-4 md:p-6">
            {activeTab === "profile" && (
              <div className="space-y-5">
                <h2 className="font-display text-h3 uppercase text-ink">Profile Settings</h2>

                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 shrink-0 rounded-full bg-deep flex items-center justify-center font-display text-h2 text-on-deep">
                    A
                  </div>
                  <div>
                    <Button type="button" variant="secondary" size="sm" className="min-h-11 md:min-h-0">Change Photo</Button>
                    <p className="text-caption text-ink-2 mt-1">JPG, PNG. Max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="First Name">
                    {(a11y) => <Input {...a11y} type="text" defaultValue="Admin" />}
                  </Field>
                  <Field label="Last Name">
                    {(a11y) => <Input {...a11y} type="text" defaultValue="User" />}
                  </Field>
                </div>

                <Field label="Email">
                  {(a11y) => <Input {...a11y} type="email" defaultValue="admin@amgroup.in" />}
                </Field>

                <Field label="Phone">
                  {(a11y) => <Input {...a11y} type="tel" defaultValue="+91 98765 43210" />}
                </Field>

                <div className="flex justify-end">
                  <Button type="button" variant="primary">
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-5">
                <h2 className="font-display text-h3 uppercase text-ink">Notification Settings</h2>

                {[
                  { label: "New lead notifications", desc: "Get notified when a new lead is generated" },
                  { label: "Low stock alerts", desc: "Alert when vehicle stock is running low" },
                  { label: "Daily sales report", desc: "Receive daily sales summary via email" },
                  { label: "Customer inquiries", desc: "Notify when customers send messages" },
                  { label: "System updates", desc: "Get notified about system updates" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between gap-4 border border-line bg-ground-2 p-4">
                    <div>
                      <p className="text-label text-ink">{item.label}</p>
                      <p className="text-small text-ink-2">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex h-11 shrink-0 cursor-pointer items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        aria-label={item.label}
                        className="peer sr-only"
                      />
                      <span className={SWITCH_TRACK} />
                    </label>
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button type="button" variant="primary">
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-5">
                <h2 className="font-display text-h3 uppercase text-ink">Security Settings</h2>

                <Field label="Current Password">
                  {(a11y) => <Input {...a11y} type="password" />}
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="New Password">
                    {(a11y) => <Input {...a11y} type="password" />}
                  </Field>
                  <Field label="Confirm Password">
                    {(a11y) => <Input {...a11y} type="password" />}
                  </Field>
                </div>

                <div className="flex items-center justify-between gap-4 border border-line bg-ground-2 p-4">
                  <div>
                    <p className="text-label text-ink">Two-Factor Authentication</p>
                    <p className="text-small text-ink-2">Add an extra layer of security</p>
                  </div>
                  <label className="relative inline-flex h-11 shrink-0 cursor-pointer items-center">
                    <input
                      type="checkbox"
                      aria-label="Two-Factor Authentication"
                      className="peer sr-only"
                    />
                    <span className={SWITCH_TRACK} />
                  </label>
                </div>

                <div className="flex justify-end">
                  <Button type="button" variant="primary">
                    Update Password
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "database" && (
              <div className="space-y-5">
                <h2 className="font-display text-h3 uppercase text-ink">Database Settings</h2>

                <Alert tone="info">
                  <strong>Note:</strong> Database changes are permanent. Please backup before making changes.
                </Alert>

                <div className="space-y-4">
                  <Button type="button" variant="secondary" className="w-full justify-start">
                    Backup Database
                  </Button>
                  <Button type="button" variant="secondary" className="w-full justify-start">
                    Restore from Backup
                  </Button>
                  <Button type="button" variant="secondary" className="w-full justify-start">
                    Clear Cache
                  </Button>
                  <Button type="button" variant="secondary" className="w-full justify-start">
                    Export All Data
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-5">
                <h2 className="font-display text-h3 uppercase text-ink">Appearance Settings</h2>

                <Field label="Theme">
                  {(a11y) => (
                    <Select {...a11y}>
                      <option>Light</option>
                      <option>Dark</option>
                      <option>System Default</option>
                    </Select>
                  )}
                </Field>

                <div>
                  <p className="text-label text-ink mb-1.5">Primary Color</p>
                  <div className="flex gap-4">
                    {/* Swatches are the system's own tokens. The incumbent
                        template's navy/red pair does not exist here. */}
                    {[
                      { name: "Deep", className: "bg-deep" },
                      { name: "Accent", className: "bg-accent" },
                      { name: "Ink", className: "bg-ink" },
                      { name: "Ground", className: "bg-ground-2" },
                    ].map((swatch) => (
                      <button
                        key={swatch.name}
                        type="button"
                        aria-label={`Primary colour: ${swatch.name}`}
                        className={`h-12 w-12 rounded-sm border border-line-strong transition-colors duration-(--duration-1) hover:border-ink-2 ${swatch.className}`}
                      />
                    ))}
                  </div>
                </div>

                <Field label="Language">
                  {(a11y) => (
                    <Select {...a11y}>
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Urdu</option>
                    </Select>
                  )}
                </Field>

                <div className="flex justify-end">
                  <Button type="button" variant="primary">
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
