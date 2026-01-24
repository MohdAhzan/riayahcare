

// components/modals/email-modal.tsx
"use client"

import { X, Mail } from "lucide-react"

interface EmailModalProps {
  lead: any
  onClose: () => void
}

export default function EmailModal({ lead, onClose }: EmailModalProps) {
  const sendEmail = () => {
    const email = lead.email || lead.source_details?.email
    const subject = `RiayahCare - Your Inquiry`
    const body = `Hi ${lead.patient_name || "there"},\n\nThank you for reaching out to RiayahCare.\n\nBest regards,\nRiayahCare Team`
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    onClose()
  }

  const email = lead.email || lead.source_details?.email

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold">Send Email</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Sending to:</p>
            <p className="font-semibold text-gray-900">{lead.patient_name}</p>
            <p className="text-gray-700">{email || "No email provided"}</p>
          </div>

          {email ? (
            <button
              onClick={sendEmail}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Open Email Client
            </button>
          ) : (
            <p className="text-sm text-red-600">No email address available for this lead.</p>
          )}
        </div>
      </div>
    </div>
  )
}
