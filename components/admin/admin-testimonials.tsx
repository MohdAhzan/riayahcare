"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Trash2, Edit2, Plus } from "lucide-react"

interface Testimonial {
  id: string
  patient_name: string
  patient_country: string
  procedure: string
  rating: number
  title: string
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    patient_name: "",
    patient_country: "",
    procedure: "",
    rating: 5,
    title: "",
    content: "",
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("testimonials").select("*")
    setTestimonials(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const { error } = await supabase.from("testimonials").insert([formData])

    if (!error) {
      setFormData({
        patient_name: "",
        patient_country: "",
        procedure: "",
        rating: 5,
        title: "",
        content: "",
      })
      setShowForm(false)
      fetchTestimonials()
    }
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from("testimonials").delete().eq("id", id)
    fetchTestimonials()
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
      >
        <Plus className="w-5 h-5" />
        Add Testimonial
      </button>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Add New Testimonial</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Patient Name"
              value={formData.patient_name}
              onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Country"
              value={formData.patient_country}
              onChange={(e) => setFormData({ ...formData, patient_country: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Procedure"
              value={formData.procedure}
              onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <textarea
              placeholder="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg h-24"
              required
            />
            <button
              type="submit"
              className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg"
            >
              Add Testimonial
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Patient Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Procedure</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {testimonials.map((testimonial) => (
              <tr key={testimonial.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{testimonial.patient_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{testimonial.procedure}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{testimonial.rating}★</td>
                <td className="px-6 py-4 text-sm text-gray-600">{testimonial.title}</td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(testimonial.id)} className="text-red-600 hover:text-red-800">
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
