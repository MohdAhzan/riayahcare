//components/admin/addDoctor/admin-assignDoctorHospital.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

type Doctor = {
  id: string
  name: string
}

type Hospital = {
  id: string
  name: string
}

type Props = {
  onAssignedAction?: () => void
}

export default function AssignDoctorToHospital({
  onAssignedAction,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [assignedHospitalIds, setAssignedHospitalIds] = useState<string[]>([])

  const [form, setForm] = useState({
    doctor_id: "",
    hospital_id: "",
    specialties: "",
    consultation_fee: "",
    availability: "",
  })

  useEffect(() => {
    supabase.from("doctors").select("id,name").then(({ data }) => {
      setDoctors(data || [])
    })

    supabase.from("hospitals").select("id,name").then(({ data }) => {
      setHospitals(data || [])
    })
  }, [])

  useEffect(() => {
    if (!form.doctor_id) return

    supabase
      .from("hospital_doctors")
      .select("hospital_id")
      .eq("doctor_id", form.doctor_id)
      .then(({ data }) =>
        setAssignedHospitalIds(data?.map((d) => d.hospital_id) || [])
      )
  }, [form.doctor_id])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return

    setLoading(true)

    try {
      const { error } = await supabase.from("hospital_doctors").insert({
        doctor_id: form.doctor_id,
        hospital_id: form.hospital_id,
        specialties: form.specialties.split(",").map((s) => s.trim()),
        consultation_fee: form.consultation_fee
          ? Number(form.consultation_fee)
          : null,
        availability: form.availability,
      })

      if (error) throw error

      onAssignedAction?.()

      alert("Doctor assigned successfully")
      setForm({
        doctor_id: "",
        hospital_id: "",
        specialties: "",
        consultation_fee: "",
        availability: "",
      })
    } catch (err: any) {
      alert(err.message || "Assignment failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-bold">Assign Doctor to Hospital</h2>

      <select name="doctor_id" value={form.doctor_id} onChange={handleChange} required className="w-full border px-4 py-2 rounded">
        <option value="">Select Doctor</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>

      <select name="hospital_id" value={form.hospital_id} onChange={handleChange} required className="w-full border px-4 py-2 rounded">
        <option value="">Select Hospital</option>
        {hospitals.map((h) => (
          <option key={h.id} value={h.id} disabled={assignedHospitalIds.includes(h.id)}>
            {h.name}{assignedHospitalIds.includes(h.id) ? " (Assigned)" : ""}
          </option>
        ))}
      </select>

      <input name="specialties" placeholder="Specialties" value={form.specialties} onChange={handleChange} className="w-full border px-4 py-2 rounded" />
      <input name="consultation_fee" type="number" placeholder="Fee" value={form.consultation_fee} onChange={handleChange} className="w-full border px-4 py-2 rounded" />
      <input name="availability" placeholder="Availability" value={form.availability} onChange={handleChange} className="w-full border px-4 py-2 rounded" />

      <button className="w-full bg-green-600 text-white py-3 rounded font-semibold">
        Assign Doctor
      </button>
    </form>
  )
}

