

// components/modal/modal-root.tsx
"use client"

import { useModal } from "./modal-provider"
import ScheduleMeetingModal from "../modals/schedule-meeting-modal"
import WhatsAppModal from "../modals/whatsapp-modal"
import SendEmailModal from "../modals/send-email-modal"

export default function ModalRoot() {
  const { modal, setModal } = useModal()

  if (!modal) return null

  const closeModal = () => setModal(null)

  return (
    <>
      {modal.type === "schedule" && (
        <ScheduleMeetingModal lead={modal.data} onClose={closeModal} />
      )}
      {modal.type === "whatsapp" && (
        <WhatsAppModal lead={modal.data} onClose={closeModal} />
      )}
      {modal.type === "email" && (
        <SendEmailModal lead={modal.data} onClose={closeModal} />
      )}
    </>
  )
}


