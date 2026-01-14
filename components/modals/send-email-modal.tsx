"use client"

import { useState } from "react"

type Props = {
  data: any
  closeAction: () => void
}

export default function SendEmailModal({ data, closeAction: close }: Props) {
  const [subject, setSubject] = useState("Regarding your consultation")
  const [body, setBody] = useState("Hello, \n\nWe are reaching out from RiayahCare.")

  async function sendEmail() {
    await fetch(`/api/admin/leads/${data.lead_id}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    })

    close()
    location.reload()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Email {data.patient_name}
      </h2>

      <input
        className="input-field w-full"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
      />

      <textarea
        className="input-field w-full h-32"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <div className="flex gap-2">
        <button onClick={sendEmail} className="btn-glass flex-1">
          Send
        </button>
        <button onClick={close} className="btn-glass">
          Cancel
        </button>
      </div>
    </div>
  )
}

