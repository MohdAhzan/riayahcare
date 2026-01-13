
//// components/admin/lead-activity-timeline.tsx

// components/admin/lead-activity-timeline.tsx

import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/admin/status-badge"

type Props = {
  leadId: string
}

export default async function LeadActivityTimeline({ leadId }: Props) {
  const supabase = await createClient()

  // ✅ Status history
  const { data: statusHistory } = await supabase
    .from("lead_status_history")
    .select(`
id,
created_at,
old_status:old_status_id ( name ),
new_status:new_status_id ( name ),
admin:admin_users!lead_status_history_changed_by_fkey (
email,
name
)
`)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })

  // ✅ Notes
  const { data: notes } = await supabase
    .from("lead_notes")
    .select(`
id,
note,
created_at,
admin:admin_users!lead_notes_created_by_fkey (
email,
name
)
`)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })

  // ✅ Events
  const { data: events } = await supabase
    .from("lead_events")
    .select(`
id,
event_type,
payload,
created_at,
admin:admin_users!lead_events_created_by_fkey (
email,
name
)
`)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })

  const timeline = [
    ...(statusHistory ?? []).map(e => ({ type: "status", ...e })),
    ...(notes ?? []).map(e => ({ type: "note", ...e })),
    ...(events ?? [])
    .filter(e => e.event_type !== "status_changed")
    .map(e => ({ type: "event", ...e })),

  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
  )

  return (
    <div className="bg-card p-6 rounded-lg shadow space-y-4">
      <h2 className="font-semibold text-lg">Activity</h2>

      {timeline.length === 0 && (
        <p className="text-sm text-muted-foreground">No activity yet</p>
      )}

      <ul className="space-y-4">
        {timeline.map((item: any) => (
          <li
            key={item.id}
            className={`border-l-2 pl-4 relative ${
item.type === "note"
? "bg-muted/40 rounded-md p-3"
: ""
}`}
          >
            <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-primary" />

            {item.type === "status" && (
              <>
                <p className="text-sm">
                  Status changed from{" "}
                  <StatusBadge name={item.old_status?.name ?? "—"} /> to{" "}
                  <StatusBadge name={item.new_status?.name ?? "—"} />
                </p>
                <p className="text-xs text-muted-foreground">
                  by {item.admin?.email ?? "System"} ·{" "}
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </>
            )}

            {item.type === "note" && (
              <>
                <p className="text-sm">📝 {item.note}</p>
                <p className="text-xs text-muted-foreground">
                  by {item.admin?.email ?? "System"} ·{" "}
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </>
            )}

            {item.type === "event" && (
              <>
                <p className="text-sm capitalize">
                  ⚡ {item.event_type.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  by {item.admin?.email ?? "System"} ·{" "}
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

