
// components/admin/addDoctor/admin-modal.tsx

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AdminDoctors from "./admin-doctors"

const supabase = createClient()

type Props = {
  doctor: { id: string }
  onCloseAction: () => void
}

export default function EditDoctorModal({ doctor, onCloseAction }: Props) {
  const [fullDoctor, setFullDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!doctor?.id) return

    supabase
      .from("doctors")
      .select("*")
      .eq("id", doctor.id)
      .single()
      .then(({ data }) => {
        setFullDoctor(data)
        setLoading(false)
      })
  }, [doctor.id])

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      {/* MODAL CONTAINER */}
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col relative">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Edit Doctor</h2>
          <button
            onClick={onCloseAction}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="overflow-y-auto px-6 py-4">
          {loading ? (
            <p className="text-center py-10">Loading doctor…</p>
          ) : (
            <AdminDoctors
              existingDoctor={fullDoctor}
              onSuccessAction={onCloseAction}
            />
          )}
        </div>
      </div>
    </div>
  )
}


//
//"use client"
//
//import AdminDoctors from "./admin-doctors"
//
//type Props = {
//  doctor: any
//  onCloseAction: () => void
//}
//
//export default function EditDoctorModal({
//  doctor,
//  onCloseAction,
//}: Props) {
//  return (
//    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
//      <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
//        <button
//          onClick={onCloseAction}
//          className="absolute top-3 right-3 text-gray-500"
//        >
//          ✕
//        </button>
//
//        <AdminDoctors
//          existingDoctor={doctor}
//          onSuccessAction={onCloseAction}
//        />
//      </div>
//    </div>
//  )
//}
//
