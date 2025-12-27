// components/admin/addDoctor/admin-doctor-list.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import EditDoctorModal from "./edit-doctor-modal"

const supabase = createClient()

type Hospital = {
  name: string
}

type HospitalDoctor = {
  id: string
  hospitals: Hospital | null
}

type Doctor = {
  id: string
  name: string
  experience_years: number
  rating: number | null
  hospital_doctors: HospitalDoctor[]
}


export default function AdminDoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

    async function fetchDoctors() {
  const { data, error } = await supabase
    .from("doctors")
    .select(`
      id,
      name,
      experience_years,
      rating,
      hospital_doctors (
        id,
        hospitals ( name )
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  setDoctors((data ?? []) as unknown as Doctor[])
}


  async function deleteDoctor(id: string) {
    if (!confirm("Delete doctor?")) return
    await supabase.from("doctors").delete().eq("id", id)
    fetchDoctors()
  }

  async function unassign(hospitalDoctorId: string) {
    if (!confirm("Unassign doctor from hospital?")) return

    await supabase
      .from("hospital_doctors")
      .delete()
      .eq("id", hospitalDoctorId)

    fetchDoctors()
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Doctors List</h2>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Experience</th>
            <th className="p-3">Hospitals</th>
            <th className="p-3">Rating</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {doctors.map((d) => (
            <tr key={d.id} className="border-t">
              <td className="p-3">{d.name}</td>
              <td className="p-3">{d.experience_years} yrs</td>

              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  {d.hospital_doctors.length ? (
                    d.hospital_doctors.map((hd) =>
                      hd.hospitals ? (
                        <span
                          key={hd.id}
                          className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                        >
                          {hd.hospitals.name}
                          <button
                            onClick={() => unassign(hd.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </span>
                      ) : null
                    )
                  ) : (
                    <span className="text-gray-400 text-xs">Not assigned</span>
                  )}
                </div>
              </td>

              <td className="p-3">{d.rating ? `⭐ ${d.rating}` : "-"}</td>

              <td className="p-3 text-right space-x-2">
                <button
                  onClick={() => setEditDoctor(d)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteDoctor(d.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editDoctor && (
        <EditDoctorModal
          doctor={editDoctor}
          onCloseAction={() => {
            setEditDoctor(null)
            fetchDoctors()
          }}
        />
      )}
    </div>
  )
}

