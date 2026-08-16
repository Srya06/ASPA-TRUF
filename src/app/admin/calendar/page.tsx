import { getAdminSlots } from "@/lib/queries/admin";
import { AdminCalendar } from "@/components/admin/AdminCalendar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const revalidate = 5;

export default async function AdminCalendarPage(props: {
  searchParams: Promise<{ date?: string; view?: string }>;
}) {
  const searchParams = await props.searchParams;
  const dateParam = searchParams.date || new Date().toISOString().slice(0, 10);
  const view = searchParams.view || "day"; // "day", "week", "month"

  const baseDate = new Date(dateParam);
  let startDate = new Date(baseDate);
  let endDate = new Date(baseDate);

  if (view === "week") {
    // start of week (Sunday)
    startDate.setDate(baseDate.getDate() - baseDate.getDay());
    // end of week (Saturday)
    endDate.setDate(startDate.getDate() + 6);
  } else if (view === "month") {
    startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  }

  const startDateStr = startDate.toISOString().slice(0, 10);
  const endDateStr = endDate.toISOString().slice(0, 10);

  const slots = await getAdminSlots(startDateStr, endDateStr);

  const prevDate = new Date(baseDate);
  const nextDate = new Date(baseDate);

  if (view === "day") {
    prevDate.setDate(baseDate.getDate() - 1);
    nextDate.setDate(baseDate.getDate() + 1);
  } else if (view === "week") {
    prevDate.setDate(baseDate.getDate() - 7);
    nextDate.setDate(baseDate.getDate() + 7);
  } else if (view === "month") {
    prevDate.setMonth(baseDate.getMonth() - 1);
    nextDate.setMonth(baseDate.getMonth() + 1);
  }

  const prevDateStr = prevDate.toISOString().slice(0, 10);
  const nextDateStr = nextDate.toISOString().slice(0, 10);

  const formattedDate = view === "day"
    ? baseDate.toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" })
    : view === "week"
    ? `${startDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`
    : baseDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <>
      <AdminHeader title="Live Calendar" />
      <div className="p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">
            Live Calendar
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              {["day", "week", "month"].map((v) => (
                <Link
                  key={v}
                  href={`/admin/calendar?date=${dateParam}&view=${v}`}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold capitalize rounded-md transition-colors",
                    view === v ? "bg-truf-lime text-truf-dark" : "text-white/50 hover:text-white"
                  )}
                >
                  {v}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 bg-truf-card rounded-lg p-1 border border-white/5">
              <Link
                href={`/admin/calendar?date=${prevDateStr}&view=${view}`}
                className="rounded px-3 py-1 text-sm text-white/50 hover:bg-white/10 hover:text-white"
              >
                &larr;
              </Link>
              <span className="text-sm font-bold text-white px-2 whitespace-nowrap min-w-[140px] text-center">
                {formattedDate}
              </span>
              <Link
                href={`/admin/calendar?date=${nextDateStr}&view=${view}`}
                className="rounded px-3 py-1 text-sm text-white/50 hover:bg-white/10 hover:text-white"
              >
                &rarr;
              </Link>
            </div>
          </div>
        </div>

        <AdminCalendar slots={slots} view={view} />
      </div>
    </>
  );
}
