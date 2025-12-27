
// components/admin/addDoctor/admin-modal.tsx


"use client"

import AdminDoctors from "./admin-doctors"

type Props = {
  doctor: any
  onCloseAction: () => void
}

export default function EditDoctorModal({
  doctor,
  onCloseAction,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onCloseAction}
          className="absolute top-3 right-3 text-gray-500"
        >
          ✕
        </button>

        <AdminDoctors
          existingDoctor={doctor}
          onSuccessAction={onCloseAction}
        />
      </div>
    </div>
  )
}

