// components/admin/status-badge.tsx
export function StatusBadge({ name }: { name?: string }) {
  if (!name) return null

  const colors: Record<string, string> = {
    New: "bg-blue-100 text-blue-700",
    Contacted: "bg-yellow-100 text-yellow-700",
    Scheduled: "bg-emerald-100 text-emerald-700",
    Completed: "bg-green-100 text-green-700",
    Closed: "bg-gray-200 text-gray-700",
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        colors[name] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {name}
    </span>
  )
}

