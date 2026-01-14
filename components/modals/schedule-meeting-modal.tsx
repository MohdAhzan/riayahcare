"use client"

type Props = {
  data: any
  closeAction: () => void
}

export default function ScheduleMeetingModal({ data, closeAction }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Schedule meeting with {data.patient_name}
      </h2>

      <iframe
        src={`https://calendly.com/YOUR_USERNAME/consultation?email=${data.email}&name=${data.patient_name}`}
        className="w-full h-[600px] rounded-md border"
      />

      <button onClick={closeAction} className="btn-glass w-full">
        Close
      </button>
    </div>
  )
}

