//components/modals/send-email-modal.tsx

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { X, Mail, Send, Check, AlertCircle } from "lucide-react"

interface SendEmailModalProps {
  lead: any
  onClose: () => void
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
}

export default function SendEmailModal({ lead, onClose }: SendEmailModalProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const supabase = createClient()

  // const email = lead.email || lead.source_details?.email
  //const email = lead.email ?? lead.source_details?.email ?? lead.source_email ?? null

  const [email, setEmail] = useState<string | null>(
    lead.email ?? lead.source_details?.email ?? lead.source_email ?? null
  )


  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const { data } = await supabase
        .from("email_templates")
        .select("*")
        .eq("is_active", true)
        .order("name")

      if (data) {
        setTemplates(data)
      }
    } catch (error) {
      console.error("Error loading templates:", error)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setSubject(replaceVariables(template.subject))
      setBody(replaceVariables(template.body))
    }
  }

  const replaceVariables = (text: string) => {
    const variables: Record<string, string> = {
      patient_name: lead.patient_name || "there",
      phone: lead.phone || "",
      country: lead.country || "",
      specialty: lead.specialty || "",
      medical_problem: lead.medical_problem || "",
    }

    let result = text
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value)
    })
    return result
  }

  // ....... Avoids Fast refresh crash by returning null asap 
  if (!lead) return null

  const sendEmail = async () => {
    if (!email) {
      setMessage({ type: "error", text: "No email address available for this lead" })
      return
    }

    if (!subject || !body) {
      setMessage({ type: "error", text: "Please provide both subject and body" })
      return
    }

    setSending(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          //lead_id: lead.lead_id,
          lead_id: lead.id ?? lead.lead_id,
          template_id: selectedTemplate || null,
          to: email,
          custom_subject: subject,
          custom_body: body,
          variables: {
            patient_name: lead.patient_name,
            phone: lead.phone,
            country: lead.country,
            specialty: lead.specialty,
            medical_problem: lead.medical_problem,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: "Email sent successfully!" })
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 1500)
      } else {
        setMessage({ type: "error", text: data.error || "Failed to send email" })
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to send email" })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Send Email</h2>
              <p className="text-sm text-gray-600">Compose and send email to lead</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Lead Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 text-sm">Recipient Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{lead.patient_name || "—"}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium">{email || "Not provided"}</span>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <span className="ml-2 font-medium">{lead.phone || "—"}</span>
              </div>
              <div>
                <span className="text-gray-600">Source:</span>
                <span className="ml-2 font-medium capitalize">{lead.source}</span>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${
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

          {!email && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ No email address available for this lead. Please update the lead information
                first.
              </p>
            </div>
          )}

          {/* Template Selection */}
          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              If leads don't have email yet enter manually
            </label>
            <input
              type="email"
              value={email ?? ""}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter email if not available"
            />
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Use Template (Optional)
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Custom Email --</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Email subject"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Email body"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can use variables like {`{{patient_name}}`}, {`{{phone}}`}, {`{{country}}`}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={sendEmail}
            disabled={sending || !email}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
