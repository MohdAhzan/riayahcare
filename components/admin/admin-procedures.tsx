//components/admin/admin-procedures.tsx

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Trash2, Edit2, Plus, Globe } from "lucide-react"

interface Procedure {
  id: string
  name: string
  specialty: string
  cost_min: number
  cost_max: number
  success_rate: number
  recovery_days: number
  description: string
  image_url?: string
  translations?: {
    en?: { name: string; description: string; specialty: string }
    ar?: { name: string; description: string; specialty: string }
  }
}

export default function AdminProcedures() {
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    description: "",
    cost_min: 0,
    cost_max: 0,
    recovery_days: 0,
    success_rate: 0,
    image_url: "",
  })

  const supabase = createClient()

  useEffect(() => {
    fetchProcedures()
  }, [])

  const fetchProcedures = async () => {
    try {
      const { data } = await supabase.from("procedures").select("*").order("created_at", { ascending: false })
      setProcedures(data || [])
    } catch (error) {
      console.error("Error fetching procedures:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("bucket", "procedures")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      const data = await response.json()
      if (data.url) {
        setFormData({ ...formData, image_url: data.url })
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const endpoint = editingId ? "/api/admin/procedures" : "/api/admin/procedures"
      const method = editingId ? "PUT" : "POST"
      
      const payload = editingId 
        ? { ...formData, id: editingId }
        : formData

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to save procedure")

      setFormData({
        name: "",
        specialty: "",
        description: "",
        cost_min: 0,
        cost_max: 0,
        recovery_days: 0,
        success_rate: 0,
        image_url: "",
      })
      setShowForm(false)
      setEditingId(null)
      fetchProcedures()
      alert("Procedure saved successfully!")
    } catch (error) {
      console.error("Form error:", error)
      alert("Error saving procedure. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (procedure: Procedure) => {
    setEditingId(procedure.id)
    setFormData({
      name: procedure.translations?.en?.name || procedure.name,
      specialty: procedure.translations?.en?.specialty || procedure.specialty,
      description: procedure.translations?.en?.description || procedure.description,
      cost_min: procedure.cost_min,
      cost_max: procedure.cost_max,
      recovery_days: procedure.recovery_days,
      success_rate: procedure.success_rate,
      image_url: procedure.image_url || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this procedure?")) return

    try {
      await supabase.from("procedures").delete().eq("id", id)
      fetchProcedures()
      alert("Procedure deleted successfully!")
    } catch (error) {
      console.error("Delete error:", error)
      alert("Error deleting procedure")
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div>
      <button
        onClick={() => {
          setEditingId(null)
          setFormData({
            name: "",
            specialty: "",
            description: "",
            cost_min: 0,
            cost_max: 0,
            recovery_days: 0,
            success_rate: 0,
            image_url: "",
          })
          setShowForm(!showForm)
        }}
        className="mb-6 flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md"
      >
        <Plus className="w-5 h-5" />
        Add Procedure
      </button>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{editingId ? "Edit Procedure" : "Add New Procedure"}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span>Will auto-translate to Arabic</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Procedure Name (e.g., Heart Bypass Surgery)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="Specialty (e.g., Cardiology)"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
            <input
              type="number"
              placeholder="Minimum Cost in ₹ (e.g., 100000)"
              value={formData.cost_min || ""}
              onChange={(e) => setFormData({ ...formData, cost_min: Number(e.target.value) })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
            <input
              type="number"
              placeholder="Maximum Cost in ₹ (e.g., 500000)"
              value={formData.cost_max || ""}
              onChange={(e) => setFormData({ ...formData, cost_max: Number(e.target.value) })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
            <input
              type="number"
              placeholder="Recovery Days (e.g., 14)"
              value={formData.recovery_days || ""}
              onChange={(e) => setFormData({ ...formData, recovery_days: Number(e.target.value) })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
            <input
              type="number"
              placeholder="Success Rate % (e.g., 95)"
              value={formData.success_rate || ""}
              onChange={(e) => setFormData({ ...formData, success_rate: Number(e.target.value) })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
              min="0"
              max="100"
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Procedure Image</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
                {uploading && <span className="text-sm text-gray-600">Uploading...</span>}
              </div>
              {formData.image_url && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <p className="text-sm text-green-600">✓ Image uploaded</p>
                </div>
              )}
            </div>

            <textarea
              placeholder="Detailed description of the procedure..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none min-h-32"
              required
            />
            <button
              onClick={handleSubmit}
              disabled={uploading || saving}
              className="md:col-span-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 transition-all"
            >
              {saving
                ? "Saving & Translating..."
                : editingId
                ? "Update Procedure"
                : "Add Procedure"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
              }}
              className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Image</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Specialty</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cost Range</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Success Rate</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {procedures.map((procedure) => (
              <tr key={procedure.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {procedure.image_url ? (
                    <img
                      src={procedure.image_url}
                      alt={procedure.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {procedure.translations?.en?.name || procedure.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {procedure.translations?.en?.specialty || procedure.specialty}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  ₹{procedure.cost_min.toLocaleString()} - ₹{procedure.cost_max.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{procedure.success_rate}%</td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button
                    onClick={() => handleEdit(procedure)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(procedure.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}



//"use client"
//
//import type React from "react"
//
//import { useEffect, useState } from "react"
//import { createClient } from "@/lib/supabase/client"
//import { Trash2, Edit2, Plus } from "lucide-react"
//
//interface Procedure {
//  id: string
//  name: string
//  specialty: string
//  cost_min: number
//  cost_max: number
//  success_rate: number
//  image_url?: string
//}
//
//export default function AdminProcedures() {
//  const [procedures, setProcedures] = useState<Procedure[]>([])
//  const [loading, setLoading] = useState(true)
//  const [showForm, setShowForm] = useState(false)
//  const [editingId, setEditingId] = useState<string | null>(null)
//  const [uploading, setUploading] = useState(false)
//  const [formData, setFormData] = useState({
//    name: "",
//    specialty: "",
//    description: "",
//    cost_min: 0,
//    cost_max: 0,
//    recovery_days: 0,
//    success_rate: 0,
//    image_url: "",
//  })
//
//  const supabase = createClient()
//
//  useEffect(() => {
//    fetchProcedures()
//  }, [])
//
//  const fetchProcedures = async () => {
//    try {
//      const { data } = await supabase.from("procedures").select("*")
//      setProcedures(data || [])
//    } catch (error) {
//      console.error("[v0] Error fetching procedures:", error)
//    } finally {
//      setLoading(false)
//    }
//  }
//
//  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//    const file = e.target.files?.[0]
//    if (!file) return
//
//    setUploading(true)
//    try {
//      const formDataUpload = new FormData()
//      formDataUpload.append("file", file)
//      formDataUpload.append("bucket", "procedures")
//
//      const response = await fetch("/api/upload", {
//        method: "POST",
//        body: formDataUpload,
//      })
//
//      const data = await response.json()
//      if (data.url) {
//        setFormData({ ...formData, image_url: data.url })
//      }
//    } catch (error) {
//      console.error("[v0] Upload error:", error)
//      alert("Failed to upload image")
//    } finally {
//      setUploading(false)
//    }
//  }
//
//  const handleSubmit = async (e: React.FormEvent) => {
//    e.preventDefault()
//    try {
//      if (editingId) {
//        const { error } = await supabase.from("procedures").update(formData).eq("id", editingId)
//
//        if (error) throw error
//        setEditingId(null)
//      } else {
//        const { error } = await supabase.from("procedures").insert([formData])
//
//        if (error) throw error
//      }
//
//      setFormData({
//        name: "",
//        specialty: "",
//        description: "",
//        cost_min: 0,
//        cost_max: 0,
//        recovery_days: 0,
//        success_rate: 0,
//        image_url: "",
//      })
//      setShowForm(false)
//      fetchProcedures()
//      alert("Procedure saved successfully!")
//    } catch (error) {
//      console.error("[v0] Form error:", error)
//      alert("Error saving procedure. Please try again.")
//    }
//  }
//
//  const handleEdit = (procedure: Procedure) => {
//    setEditingId(procedure.id)
//    setFormData({
//      name: procedure.name,
//      specialty: procedure.specialty,
//      description: "",
//      cost_min: procedure.cost_min,
//      cost_max: procedure.cost_max,
//      recovery_days: 0,
//      success_rate: procedure.success_rate,
//      image_url: procedure.image_url || "",
//    })
//    setShowForm(true)
//  }
//
//  const handleDelete = async (id: string) => {
//    if (!confirm("Are you sure you want to delete this procedure?")) return
//
//    try {
//      await supabase.from("procedures").delete().eq("id", id)
//      fetchProcedures()
//      alert("Procedure deleted successfully!")
//    } catch (error) {
//      console.error("[v0] Delete error:", error)
//      alert("Error deleting procedure")
//    }
//  }
//
//  if (loading) return <div className="text-center py-12">Loading...</div>
//
//  return (
//    <div>
//      <button
//        onClick={() => {
//          setEditingId(null)
//          setFormData({
//            name: "",
//            specialty: "",
//            description: "",
//            cost_min: 0,
//            cost_max: 0,
//            recovery_days: 0,
//            success_rate: 0,
//            image_url: "",
//          })
//          setShowForm(!showForm)
//        }}
//        className="mb-6 flex items-center gap-2 btn-glass text-white"
//      >
//        <Plus className="w-5 h-5" />
//        Add Procedure
//      </button>
//
//      {showForm && (
//        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//          <h3 className="text-lg font-bold mb-4">{editingId ? "Edit Procedure" : "Add New Procedure"}</h3>
//          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
//            <input
//              type="text"
//              placeholder="Procedure Name"
//              value={formData.name}
//              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//              required
//            />
//            <input
//              type="text"
//              placeholder="Specialty"
//              value={formData.specialty}
//              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
//              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//              required
//            />
//            <input
//              type="number"
//              placeholder="Min Cost"
//              value={formData.cost_min}
//              onChange={(e) => setFormData({ ...formData, cost_min: Number(e.target.value) })}
//              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//              required
//            />
//            <input
//              type="number"
//              placeholder="Max Cost"
//              value={formData.cost_max}
//              onChange={(e) => setFormData({ ...formData, cost_max: Number(e.target.value) })}
//              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//              required
//            />
//            <input
//              type="number"
//              placeholder="Recovery Days"
//              value={formData.recovery_days}
//              onChange={(e) => setFormData({ ...formData, recovery_days: Number(e.target.value) })}
//              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//              required
//            />
//            <input
//              type="number"
//              placeholder="Success Rate (%)"
//              value={formData.success_rate}
//              onChange={(e) => setFormData({ ...formData, success_rate: Number(e.target.value) })}
//              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//              required
//            />
//
//            <div className="md:col-span-2">
//              <label className="block text-sm font-semibold mb-2">Procedure Image</label>
//              <div className="flex items-center gap-3">
//                <input
//                  type="file"
//                  accept="image/*"
//                  onChange={handleImageUpload}
//                  disabled={uploading}
//                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
//                />
//                {uploading && <span className="text-sm text-gray-600">Uploading...</span>}
//              </div>
//              {formData.image_url && <p className="text-sm text-green-600 mt-2">Image uploaded</p>}
//            </div>
//
//            <textarea
//              placeholder="Description"
//              value={formData.description}
//              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//              className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//            />
//            <button
//              type="submit"
//              disabled={uploading}
//              className="md:col-span-2 btn-glass text-white font-semibold py-2 disabled:opacity-50"
//            >
//              {editingId ? "Update Procedure" : "Add Procedure"}
//            </button>
//            <button
//              type="button"
//              onClick={() => {
//                setShowForm(false)
//                setEditingId(null)
//              }}
//              className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
//            >
//              Cancel
//            </button>
//          </form>
//        </div>
//      )}
//
//      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
//        <table className="w-full">
//          <thead className="bg-gray-100 border-b">
//            <tr>
//              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
//              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Specialty</th>
//              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cost</th>
//              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Success Rate</th>
//              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
//            </tr>
//          </thead>
//          <tbody className="divide-y">
//            {procedures.map((procedure) => (
//              <tr key={procedure.id} className="hover:bg-gray-50">
//                <td className="px-6 py-4 text-sm text-gray-900">{procedure.name}</td>
//                <td className="px-6 py-4 text-sm text-gray-600">{procedure.specialty}</td>
//                <td className="px-6 py-4 text-sm text-gray-600">
//                  ₹{procedure.cost_min} - ₹{procedure.cost_max}
//                </td>
//                <td className="px-6 py-4 text-sm text-gray-600">{procedure.success_rate}%</td>
//                <td className="px-6 py-4 text-sm flex gap-2">
//                  <button
//                    onClick={() => handleEdit(procedure)}
//                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded"
//                  >
//                    <Edit2 className="w-4 h-4" />
//                  </button>
//                  <button
//                    onClick={() => handleDelete(procedure.id)}
//                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
//                  >
//                    <Trash2 className="w-4 h-4" />
//                  </button>
//                </td>
//              </tr>
//            ))}
//          </tbody>
//        </table>
//      </div>
//    </div>
//  )
//}
