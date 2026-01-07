

// components/admin/faqs/admin-faqs.tsx


"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import FAQFormModal from "./faq-form-modal"
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"


import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"

import { CSS } from "@dnd-kit/utilities"

/* ----------------------------- TYPES ----------------------------- */

interface FAQ {
  id: string
  section: string
  entity_type?: string | null
  entity_id?: string | null
  question: string
  answer: string
  is_active: boolean
  position: number
}
const SECTIONS = [
  "landing",
  "hospitals",
  "hospital_detail",
  "doctors",
  "doctor_detail",
  "procedures",
  "procedure_detail",
  "blogs",
  "testimonials",
  "contact",
]


/* ------------------------- SORTABLE ROW ------------------------- */

function SortableRow({
  faq,
  children,
}: {
    faq: FAQ
    children: React.ReactNode
  }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
  useSortable({ id: faq.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[32px_160px_160px_1fr_100px_160px] items-center border-t bg-white"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 flex justify-center"
      >
        ☰
      </div>
      {children}
    </div>
  )
}

/* ----------------------------- MAIN ----------------------------- */

export default function AdminFAQs() {
  const supabase = createClient()

  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FAQ | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  /* --------------------------- FETCH --------------------------- */

  const fetchFaqs = async () => {
    const { data } = await supabase
      .from("faqs")
      .select("*")
      .order("section")
      .order("position")

    setFaqs(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  /* -------------------------- HELPERS -------------------------- */

  const toggleActive = async (faq: FAQ) => {
    await supabase
    .from("faqs")
    .update({ is_active: !faq.is_active })
    .eq("id", faq.id)

    fetchFaqs()
  }

  const deleteFaq = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return
    await supabase.from("faqs").delete().eq("id", id)
    fetchFaqs()
  }

  /* ---------------------- GROUP BY SECTION ---------------------- */

  const groupedFaqs = faqs.reduce<Record<string, FAQ[]>>((acc, faq) => {
    acc[faq.section] = acc[faq.section] || []
    acc[faq.section].push(faq)
    return acc
  }, {})

  /* ------------------------- DRAG END ------------------------- */

  const handleDragEnd = async (section: string, event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    // get ONLY this section's items
    const sectionItems = faqs
    .filter((f) => f.section === section)
    .sort((a, b) => a.position - b.position)

    const oldIndex = sectionItems.findIndex((i) => i.id === active.id)
    const newIndex = sectionItems.findIndex((i) => i.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(sectionItems, oldIndex, newIndex)

    // 🔥 1. UPDATE UI STATE IMMEDIATELY (THIS WAS MISSING)
    setFaqs((prev) =>
      prev.map((faq) => {
        const index = reordered.findIndex((r) => r.id === faq.id)
        if (index === -1) return faq
        return { ...faq, position: index }
      })
    )

    // 🔥 2. PERSIST ORDER
    await supabase.from("faqs").upsert(
      reordered.map((faq, index) => ({
        id: faq.id,
        position: index,
      }))
    )
  }


  if (loading) return <p>Loading FAQs…</p>

  /* ----------------------------- UI ----------------------------- */

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">FAQs</h2>
        <button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Add FAQ
        </button>
      </div>

      {/* HEADER */}
      <div className="grid grid-cols-[32px_160px_160px_1fr_100px_160px] bg-gray-100 p-2 font-semibold">
        <div />
        <div>Section</div>
        <div>Target</div>
        <div>Question</div>
        <div>Active</div>
        <div>Actions</div>
      </div>

      {/* SECTIONS */}
      {Object.entries(groupedFaqs).map(([section, sectionFaqs]) => (
        <div key={section} className="border rounded">
          <div className="bg-green-50 p-3 font-semibold text-green-700">
            {section.toUpperCase()}
          </div>


          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={(e) => handleDragEnd(section, e)}
          >
            <SortableContext
              items={sectionFaqs.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {[...sectionFaqs]
                .sort((a, b) => a.position - b.position)
                .map((faq) => (
                  <SortableRow key={faq.id} faq={faq}>
                    <>
                      <div>{faq.section}</div>
                      <div className="text-xs text-gray-600">
                        {faq.entity_type ?? "Global"}
                      </div>
                      <div className="truncate">{faq.question}</div>
                      <div>
                        <input
                          type="checkbox"
                          checked={faq.is_active}
                          onChange={() => toggleActive(faq)}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditing(faq)
                            setOpen(true)
                          }}
                          className="text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteFaq(faq.id)}
                          className="text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  </SortableRow>
                ))}
            </SortableContext>
          </DndContext>
        </div>
      ))}

      {open && (
      <FAQFormModal
  faq={editing}
  sections={SECTIONS}   // ✅ FIX
  onClose={() => setOpen(false)}
  onSaved={fetchFaqs}
/>
      )}
    </div>
  )
}



