
//components/modal/modal-root.tsx

"use client"

import { useModal } from "./modal-provider"
import ScheduleMeetingModal from "@/components/modals/schedule-meeting-modal"
import SendWhatsappModal from "@/components/modals/send-whatsapp-modal"
import SendEmailModal from "@/components/modals/send-email-modal"

export default function ModalRoot() {
  const { modal, setModal } = useModal()
  if (!modal.type) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-card rounded-xl w-full max-w-lg p-4">
        {modal.type === "schedule" && (
          <ScheduleMeetingModal data={modal.data} closeAction={() => setModal({ type: null })} />
        )}
        {modal.type === "whatsapp" && (
          <SendWhatsappModal data={modal.data} closeAction={() => setModal({ type: null })} />
        )}
        {modal.type === "email" && (
          <SendEmailModal data={modal.data} closeAction={() => setModal({ type: null })} />
        )}
      </div>
    </div>
  )
}

