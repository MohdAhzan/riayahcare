"use client"

import { useState } from "react"
import AdminDoctors from "./admin-doctors"
import AssignDoctorHospital from "./admin-assignDoctorHospital"
import AdminDoctorList from "./admin-doctor-list"

export default function AdminDoctorsRoot() {
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = () => setRefreshKey((k) => k + 1)

  return (
    <div className="space-y-12">
      <AdminDoctors onSuccessAction={refresh} />

      <AssignDoctorHospital onAssignedAction={refresh} />

      <AdminDoctorList key={refreshKey} />
    </div>
  )
}


