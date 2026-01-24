//components/modals/schedule-meeting-modal.tsx


"use client"

import { useState } from "react"
import { X, Calendar, ExternalLink, Check, AlertCircle } from "lucide-react"

interface ScheduleMeetingModalProps {
  lead: any
  onClose: () => void
}

export default function ScheduleMeetingModal({ lead, onClose }: ScheduleMeetingModalProps) {
  const [loading, setLoading] = useState(false)
  const [bookingUrl, setBookingUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const scheduleWithCalendly = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/calendly/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.lead_id,
          lead_table: "leads",
          email: lead.email || lead.source_details?.email,
          name: lead.patient_name,
        }),
      })

      const data = await response.json()

      if (data.success && data.booking_url) {
        setBookingUrl(data.booking_url)
      } else {
        setError(data.error || "Failed to create scheduling link")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (bookingUrl) {
      navigator.clipboard.writeText(bookingUrl)
      alert("Booking link copied to clipboard!")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Schedule Meeting</h2>
              <p className="text-sm text-gray-600">Create a Calendly booking link</p>
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
        <div className="p-6 space-y-6">
          {/* Lead Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900">Lead Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{lead.patient_name || "—"}</span>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <span className="ml-2 font-medium">{lead.phone || "—"}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium">
                  {lead.email || lead.source_details?.email || "Not provided"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Source:</span>
                <span className="ml-2 font-medium capitalize">{lead.source}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success - Booking URL */}
          {bookingUrl && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    Scheduling Link Created!
                  </p>
                  <p className="text-sm text-green-700">
                    Share this link with the lead to schedule a meeting
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Booking URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bookingUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Booking Page
                </a>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!bookingUrl && !error && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  This will create a unique Calendly scheduling link for this lead. You can
                  then share it via email, WhatsApp, or any other channel.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={scheduleWithCalendly}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? "Creating Link..." : "Create Calendly Link"}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {error && !bookingUrl && (
            <div className="flex gap-3">
              <button
                onClick={scheduleWithCalendly}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? "Retrying..." : "Retry"}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

//"use client"
//
//type Props = {
//  data: any
//  closeAction: () => void
//}
//
//export default function ScheduleMeetingModal({ data, closeAction }: Props) {
//  return (
//    <div className="space-y-4">
//      <h2 className="text-lg font-semibold">
//        Schedule meeting with {data.patient_name}
//      </h2>
//
//      <iframe
//        src={`https://calendly.com/YOUR_USERNAME/consultation?email=${data.email}&name=${data.patient_name}`}
//        className="w-full h-[600px] rounded-md border"
//      />
//
//      <button onClick={closeAction} className="btn-glass w-full">
//        Close
//      </button>
//    </div>
//  )
//}
//
