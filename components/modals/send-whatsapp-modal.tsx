"use client"

type Props = {
  data: any
  closeAction: () => void
}

export default function SendWhatsappModal({ data, closeAction: close }: Props) {
  const phone = data.phone?.replace(/\D/g, "")

  function openWhatsapp() {
    const message = encodeURIComponent(
      `Hello ${data.patient_name}, this is RiayahCare regarding your consultation.`
    )
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
    close()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Send WhatsApp to {data.patient_name}
      </h2>

      <p className="text-sm text-muted-foreground">
        Phone: {data.phone}
      </p>

      <div className="flex gap-2">
        <button onClick={openWhatsapp} className="btn-glass flex-1">
          Open WhatsApp
        </button>
        <button onClick={close} className="btn-glass">
          Cancel
        </button>
      </div>
    </div>
  )
}

