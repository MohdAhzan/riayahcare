//components/admin/lead-email-settings-component.tsx

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Mail, Settings, Check, AlertCircle, Send } from "lucide-react"

interface EmailProviderSettings {
  id?: string
  provider: "resend" | "sendgrid" | "smtp"
  api_key?: string
  smtp_host?: string
  smtp_port?: number
  smtp_username?: string
  smtp_password?: string
  from_email: string
  from_name: string
  is_active: boolean
}

export default function EmailProviderSettings() {
  const [settings, setSettings] = useState<EmailProviderSettings>({
    provider: "resend",
    from_email: "",
    from_name: "RiayahCare",
    is_active: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [testEmail, setTestEmail] = useState("")
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("email_provider_settings")
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

  const saveSettings = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("email_provider_settings")
        .upsert({
          ...settings,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setMessage({ type: "success", text: "Email settings saved successfully!" })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to save settings" })
    } finally {
      setSaving(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      setMessage({ type: "error", text: "Please enter a test email address" })
      return
    }

    setTesting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: "Test email sent successfully! Check your inbox." })
      } else {
        setMessage({ type: "error", text: data.error || "Failed to send test email" })
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to send test email" })
    } finally {
      setTesting(false)
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
          <Mail className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Email Provider Settings</h2>
            <p className="text-gray-600">Configure your email sending provider</p>
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

        {/* Provider Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Provider *
            </label>
            <select
              value={settings.provider}
              onChange={(e) =>
                setSettings({ ...settings, provider: e.target.value as any })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="resend">Resend (Recommended)</option>
              <option value="sendgrid">SendGrid</option>
              <option value="smtp">Custom SMTP</option>
            </select>
          </div>

          {/* Resend Settings */}
          {settings.provider === "resend" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Resend API Key *
              </label>
              <input
                type="password"
                value={settings.api_key || ""}
                onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                placeholder="re_xxxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from{" "}
                <a
                  href="https://resend.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Resend Dashboard
                </a>
              </p>
            </div>
          )}

          {/* SendGrid Settings */}
          {settings.provider === "sendgrid" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                SendGrid API Key *
              </label>
              <input
                type="password"
                value={settings.api_key || ""}
                onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                placeholder="SG.xxxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from{" "}
                <a
                  href="https://app.sendgrid.com/settings/api_keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  SendGrid Settings
                </a>
              </p>
            </div>
          )}

          {/* SMTP Settings */}
          {settings.provider === "smtp" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SMTP Host *
                  </label>
                  <input
                    type="text"
                    value={settings.smtp_host || ""}
                    onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SMTP Port *
                  </label>
                  <input
                    type="number"
                    value={settings.smtp_port || 587}
                    onChange={(e) =>
                      setSettings({ ...settings, smtp_port: parseInt(e.target.value) })
                    }
                    placeholder="587"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SMTP Username *
                </label>
                <input
                  type="text"
                  value={settings.smtp_username || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, smtp_username: e.target.value })
                  }
                  placeholder="your-email@gmail.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SMTP Password *
                </label>
                <input
                  type="password"
                  value={settings.smtp_password || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, smtp_password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </>
          )}

          {/* From Email & Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                From Email *
              </label>
              <input
                type="email"
                value={settings.from_email}
                onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
                placeholder="noreply@riayahcare.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                From Name *
              </label>
              <input
                type="text"
                value={settings.from_name}
                onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
                placeholder="RiayahCare"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={settings.is_active}
              onChange={(e) => setSettings({ ...settings, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Enable email sending
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* Test Email */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-600" />
          Test Email Configuration
        </h3>
        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter test email address"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={sendTestEmail}
            disabled={testing || !settings.id}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {testing ? "Sending..." : "Send Test"}
          </button>
        </div>
        {!settings.id && (
          <p className="text-xs text-gray-500 mt-2">
            Save your settings first before testing
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Setup Instructions:
        </h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <p className="font-semibold">Resend (Recommended):</p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Sign up at resend.com</li>
              <li>Verify your domain or use their test domain</li>
              <li>Create an API key</li>
              <li>Paste the key above</li>
            </ol>
          </div>
          <div>
            <p className="font-semibold">SendGrid:</p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Sign up at sendgrid.com</li>
              <li>Verify your sender identity</li>
              <li>Create an API key with Mail Send permissions</li>
              <li>Paste the key above</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
