


// components/modals/whatsapp-modal.tsx
"use client"

import { X, MessageCircle } from "lucide-react"

interface WhatsAppModalProps {
  lead: any
  onClose: () => void
}

export default function WhatsAppModal({ lead, onClose }: WhatsAppModalProps) {
  const sendWhatsApp = () => {
    const phone = lead.phone?.replace(/\D/g, "") // Remove non-digits
    const message = `Hi ${lead.patient_name || "there"}, this is RiayahCare regarding your inquiry.`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">Send WhatsApp</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Sending to:</p>
            <p className="font-semibold text-gray-900">{lead.patient_name}</p>
            <p className="text-gray-700">{lead.phone}</p>
          </div>

          <button
            onClick={sendWhatsApp}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Open WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}


//// components/modals/whatsapp-modal.tsx
//"use client"
//
//import { X, MessageCircle } from "lucide-react"
//
//interface WhatsAppModalProps {
//  lead: any
//  onClose: () => void
//}
//
//export default function WhatsAppModal({ lead, onClose }: WhatsAppModalProps) {
//  const sendWhatsApp = () => {
//    const phone = lead.phone?.replace(/\D/g, "") // Remove non-digits
//    const message = `Hi ${lead.patient_name || "there"}, this is RiayahCare regarding your inquiry.`
//    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
//    window.open(url, "_blank")
//    onClose()
//  }
//
//  return (
//    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
//        <div className="flex items-center justify-between p-6 border-b">
//          <div className="flex items-center gap-3">
//            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
//              <MessageCircle className="w-6 h-6 text-green-600" />
//            </div>
//            <h2 className="text-xl font-bold">Send WhatsApp</h2>
//          </div>
//          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
//            <X className="w-6 h-6" />
//          </button>
//        </div>
//
//        <div className="p-6 space-y-4">
//          <div className="bg-gray-50 rounded-lg p-4">
//            <p className="text-sm text-gray-600 mb-2">Sending to:</p>
//            <p className="font-semibold text-gray-900">{lead.patient_name}</p>
//            <p className="text-gray-700">{lead.phone}</p>
//          </div>
//
//          <button
//            onClick={sendWhatsApp}
//            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
//          >
//            Open WhatsApp
//          </button>
//        </div>
//      </div>
//    </div>
//  )
//}
//
