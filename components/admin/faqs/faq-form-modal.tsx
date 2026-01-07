
//components/admin/faqs/faq-form-modal.tsx


// components/admin/faqs/faq-form-modal.tsx

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"


type Entity = {
  id: string
  name: string
}

export default function FAQFormModal({
  faq,
  sections,
  onClose,
  onSaved,
}: any) {
  const supabase = createClient()

  const [section, setSection] = useState( faq?.section ?? sections?.[0] ?? "landing")

  const [entityType, setEntityType] = useState<string | null>(
    faq?.entity_type || null
  )
  const [entityId, setEntityId] = useState<string | null>(
    faq?.entity_id || null
  )

  const [entities, setEntities] = useState<Entity[]>([])
  const [loadingEntities, setLoadingEntities] = useState(false)
  useEffect(() => {
  if (faq?.entity_id && entities.length > 0) {
    setEntityId(faq.entity_id)
  }
}, [entities])


  const [question, setQuestion] = useState(faq?.question || "")
  const [answer, setAnswer] = useState(faq?.answer || "")
  const [saving, setSaving] = useState(false)

  const isDynamic =
    section === "hospital_detail" ||
    section === "doctor_detail" ||
    section === "procedure_detail"

  /* -------------------------------
     Auto-set entityType from section
  -------------------------------- */
  useEffect(() => {
    if (!isDynamic) {
      setEntityType(null)
      setEntityId(null)
      setEntities([])
      return
    }

    if (section === "hospital_detail") setEntityType("hospital")
    if (section === "doctor_detail") setEntityType("doctor")
    if (section === "procedure_detail") setEntityType("procedure")
  }, [section, isDynamic])

  /* -------------------------------
     Fetch entity list
  -------------------------------- */
  useEffect(() => {
    if (!entityType) return

    const fetchEntities = async () => {
      setLoadingEntities(true)

      const table =
        entityType === "hospital"
          ? "hospitals"
          : entityType === "doctor"
          ? "doctors"
          : "procedures"

      const { data, error } = await supabase
        .from(table)
        .select("id, name")
        .order("name")

      if (!error && data) {
        setEntities(data)
      }

      setLoadingEntities(false)
    }

    fetchEntities()
  }, [entityType])

  /* -------------------------------
     Save FAQ
  -------------------------------- */
  const saveFAQ = async () => {
  if (isDynamic && !entityId) {
    alert(`Please select a ${entityType}`)
    return
  }

  setSaving(true)

  const res = await fetch("/api/faqs", {
    method: faq?.id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: faq?.id,
      section,
      entity_type: isDynamic ? entityType : null,
      entity_id: isDynamic ? entityId : null,
      question,
      answer,
    }),
  })

  setSaving(false)

  if (res.ok) {
    onSaved()
    onClose()
  } else {
    alert("Failed to save FAQ")
  }
}

  //const saveFAQ = async () => {
  //  setSaving(true)
  //
  //  const res = await fetch("/api/faqs", {
  //    method: faq?.id ? "PUT" : "POST",
  //    headers: { "Content-Type": "application/json" },
  //    body: JSON.stringify({
  //      id: faq?.id,
  //      section,
  //      entity_type: isDynamic ? entityType : null,
  //      entity_id: isDynamic ? entityId : null,
  //      question,
  //      answer,
  //    }),
  //  })
  //
  //  setSaving(false)
  //
  //  if (res.ok) {
  //    onSaved()
  //    onClose()
  //  } else {
  //    alert("Failed to save FAQ")
  //  }
  //}

  return (
    //<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">

      <div className="bg-white w-full max-w-xl p-6 rounded-xl space-y-4">
        <h3 className="text-xl font-bold">
          {faq ? "Edit FAQ" : "Add FAQ"}
        </h3>

        {/* SECTION */}
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="w-full border p-2 rounded"
        >
          {sections.map((s: string) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* ENTITY SELECT (NAME, NOT ID) */}
        {isDynamic && (
          <select
            value={entityId ?? ""}
            onChange={(e) => setEntityId(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">
              {loadingEntities
                ? "Loading..."
                : `Select ${entityType}`}
            </option>

            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        )}

        {/* QUESTION */}
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question (English)"
          className="w-full border p-2 rounded"
        />

        {/* ANSWER */}
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Answer (English)"
          className="w-full border p-2 rounded min-h-[120px]"
        />

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={saveFAQ}
            disabled={saving}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}

