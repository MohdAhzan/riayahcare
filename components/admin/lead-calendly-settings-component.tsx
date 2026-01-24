//components/admin/lea-calendly-settings-components.tsx 


"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Settings, Check, AlertCircle } from "lucide-react"

interface CalendlySettings {
  id?: string
  calendly_api_key: string
  calendly_organization_uri: string
  default_event_type_uri: string
  is_active: boolean
}

export default function CalendlySettingsComponent() {
  const [settings, setSettings] = useState<CalendlySettings>({
    calendly_api_key: "",
    calendly_organization_uri: "",
    default_event_type_uri: "",
    is_active: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [eventTypes, setEventTypes] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("calendly_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEventTypes = async () => {
    if (!settings.calendly_api_key) {
      setMessage({ type: "error", text: "Please enter your Calendly API key first" })
      return
    }

    try {
      const response = await fetch("/api/admin/calendly/event-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: settings.calendly_api_key }),
      })

      const data = await response.json()
      if (data.collection) {
        setEventTypes(data.collection)
        setMessage({ type: "success", text: "Event types loaded successfully!" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch event types" })
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("calendly_settings")
        .upsert({
          ...settings,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setMessage({ type: "success", text: "Settings saved successfully!" })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to save settings" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-8 h-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Calendly Integration</h2>
            <p className="text-gray-600">Connect your Calendly account to automate meeting scheduling</p>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 mb-4 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Settings Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Calendly API Key *
            </label>
            <input
              type="password"
              value={settings.calendly_api_key}
              onChange={(e) => setSettings({ ...settings, calendly_api_key: e.target.value })}
              placeholder="Enter your Calendly API key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from{" "}
              <a
                href="https://calendly.com/integrations/api_webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
              >
                Calendly Settings → Integrations
              </a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Organization URI
            </label>
            <input
              type="text"
              value={settings.calendly_organization_uri}
              onChange={(e) =>
                setSettings({ ...settings, calendly_organization_uri: e.target.value })
              }
              placeholder="https://api.calendly.com/organizations/XXXXXX"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Default Event Type
              </label>
              <button
                onClick={fetchEventTypes}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Load Event Types
              </button>
            </div>
            {eventTypes.length > 0 ? (
              <select
                value={settings.default_event_type_uri}
                onChange={(e) =>
                  setSettings({ ...settings, default_event_type_uri: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="">Select an event type</option>
                {eventTypes.map((et) => (
                  <option key={et.uri} value={et.uri}>
                    {et.name} ({et.duration} min)
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={settings.default_event_type_uri}
                onChange={(e) =>
                  setSettings({ ...settings, default_event_type_uri: e.target.value })
                }
                placeholder="https://api.calendly.com/event_types/XXXXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={settings.is_active}
              onChange={(e) => setSettings({ ...settings, is_active: e.target.checked })}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Enable Calendly integration
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          How to get your Calendly API credentials:
        </h3>
        <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
          <li>Go to your Calendly account settings</li>
          <li>Navigate to Integrations → API & Webhooks</li>
          <li>Generate a new Personal Access Token</li>
          <li>Copy the API key and paste it above</li>
          <li>
            For Organization URI, you can get it from the API response or use the format:
            https://api.calendly.com/organizations/YOUR_ORG_ID
          </li>
        </ol>
      </div>
    </div>
  )
}
