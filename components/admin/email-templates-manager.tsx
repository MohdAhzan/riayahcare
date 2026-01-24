//components/admin/email-templates-manager.tsx


"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Trash2, Eye, FileText, Check, X } from "lucide-react"

interface EmailTemplate {
  id?: string
  name: string
  subject: string
  body: string
  template_type: string
  variables: string[]
  is_active: boolean
}

export default function EmailTemplatesManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const { data } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false })

      if (data) {
        setTemplates(data)
      }
    } catch (error) {
      console.error("Error loading templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveTemplate = async (template: EmailTemplate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (template.id) {
        await supabase
          .from("email_templates")
          .update({
            ...template,
            updated_at: new Date().toISOString(),
          })
          .eq("id", template.id)
      } else {
        await supabase.from("email_templates").insert({
          ...template,
          created_by: user.id,
        })
      }

      loadTemplates()
      setEditingTemplate(null)
    } catch (error) {
      console.error("Error saving template:", error)
      alert("Failed to save template")
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      await supabase.from("email_templates").delete().eq("id", id)
      loadTemplates()
    } catch (error) {
      console.error("Error deleting template:", error)
      alert("Failed to delete template")
    }
  }

  const toggleActive = async (template: EmailTemplate) => {
    try {
      await supabase
        .from("email_templates")
        .update({ is_active: !template.is_active })
        .eq("id", template.id)
      loadTemplates()
    } catch (error) {
      console.error("Error toggling template:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
          <p className="text-gray-600">Create and manage email templates for automation</p>
        </div>
        <button
          onClick={() =>
            setEditingTemplate({
              name: "",
              subject: "",
              body: "",
              template_type: "custom",
              variables: [],
              is_active: true,
            })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      template.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {template.is_active ? "Active" : "Inactive"}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize">
                    {template.template_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Variables */}
            {template.variables && template.variables.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Available Variables:</p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((variable) => (
                    <span
                      key={variable}
                      className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-mono"
                    >
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => setPreviewTemplate(template)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setEditingTemplate(template)}
                className="flex-1 px-3 py-2 text-sm border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => toggleActive(template)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {template.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={() => deleteTemplate(template.id!)}
                className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No templates yet. Create your first template!</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingTemplate && (
        <TemplateEditor
          template={editingTemplate}
          onSave={saveTemplate}
          onCancel={() => setEditingTemplate(null)}
        />
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  )
}

function TemplateEditor({
  template,
  onSave,
  onCancel,
}: {
  template: EmailTemplate
  onSave: (template: EmailTemplate) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(template)
  const [variableInput, setVariableInput] = useState("")

  const addVariable = () => {
    if (variableInput && !formData.variables.includes(variableInput)) {
      setFormData({
        ...formData,
        variables: [...formData.variables, variableInput],
      })
      setVariableInput("")
    }
  }

  const removeVariable = (variable: string) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((v) => v !== variable),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {template.id ? "Edit Template" : "New Template"}
          </h2>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Welcome Email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <select
              value={formData.template_type}
              onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="welcome">Welcome</option>
              <option value="follow_up">Follow Up</option>
              <option value="appointment_reminder">Appointment Reminder</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Welcome to RiayahCare - {{patient_name}}"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Body *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              placeholder="Dear {{patient_name}},&#10;&#10;Thank you for contacting RiayahCare..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Variables
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={variableInput}
                onChange={(e) => setVariableInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addVariable()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="patient_name"
              />
              <button
                type="button"
                onClick={addVariable}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.variables.map((variable) => (
                <span
                  key={variable}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm flex items-center gap-2"
                >
                  {`{{${variable}}}`}
                  <button onClick={() => removeVariable(variable)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={() => onSave(formData)}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Save Template
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function TemplatePreview({
  template,
  onClose,
}: {
  template: EmailTemplate
  onClose: () => void
}) {
  const sampleData: Record<string, string> = {
    patient_name: "John Doe",
    phone: "+1-234-567-8900",
    country: "United States",
    specialty: "Cardiology",
    medical_problem: "Heart Checkup",
    scheduled_date: "2024-02-01",
    scheduled_time: "10:00 AM",
    meeting_url: "https://calendly.com/example",
  }

  const renderWithVariables = (text: string) => {
    let result = text
    Object.entries(sampleData).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value)
    })
    return result
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Template Preview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject:</label>
            <p className="text-gray-900">{renderWithVariables(template.subject)}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Body:</label>
            <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-900">
              {renderWithVariables(template.body)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
