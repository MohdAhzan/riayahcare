//components/admin/lead-actions.tsx

"use client"

import { useModal } from "@/components/modal/modal-provider"

export default function LeadActions({ lead }: { lead: any }) {
  const { setModal } = useModal()

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setModal({ type: "schedule", data: lead })}
        className="btn-glass"
      >
        Schedule
      </button>

      <button
        onClick={() => setModal({ type: "whatsapp", data: lead })}
        className="btn-glass"
      >
        WhatsApp
      </button>

      <button
        onClick={() => setModal({ type: "email", data: lead })}
        className="btn-glass"
      >
        Email
      </button>
    </div>
  )
}

