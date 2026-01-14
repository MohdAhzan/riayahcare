// components/admin/lead-activity-item.tsx

"use client"

import { useState } from "react"

type Props = {
  item: any
}

export default function LeadActivityItem({ item }: Props) {
  const [editing, setEditing] = useState(false)
  const [note, setNote] = useState(item.note)

  async function saveEdit() {
    await fetch(`/api/admin/leads/${item.id}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    })
    setEditing(false)
    location.reload()
  }

  async function deleteNote() {
    if (!confirm("Delete this note?")) return
    await fetch(`/api/admin/leads/${item.id}/notes`, {
      method: "DELETE",
    })
    location.reload()
  }

  if (item.type !== "note") return null

  return (
    <div className="bg-muted/40 p-3 rounded-md border-l-4 border-blue-400">
      {editing ? (
        <>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input-field w-full h-20"
          />
          <div className="flex gap-2 mt-2">
            <button onClick={saveEdit} className="btn-glass text-sm">
              Save
            </button>
            <button onClick={() => setEditing(false)} className="text-sm">
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm">{item.note}</p>
          <div className="flex gap-3 text-xs mt-1">
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={deleteNote}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}


