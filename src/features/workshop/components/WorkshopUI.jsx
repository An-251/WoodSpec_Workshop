import { Check, ChevronLeft, Search } from "lucide-react"
import { Link } from "react-router-dom"

import { workflowSteps } from "@/data/reference/workshopFlow"

const toneClasses = {
  amber: "border border-warning/20 bg-warning/10 text-warning",
  green: "border border-success/20 bg-success/10 text-success",
  neutral: "border border-border bg-secondary text-secondary-foreground",
  muted: "border border-border bg-muted text-muted-foreground",
}

export function WorkshopPageHeader({ title, subtitle, backTo, backLabel }) {
  return (
    <header className="sticky top-0 z-20 -mx-4 -mt-6 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:-mx-8 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-foreground">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-9 min-w-64 items-center gap-2 rounded-full border border-input bg-card px-3 text-sm text-muted-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]">
            <Search className="size-4" />
            <input
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70"
              placeholder="Tìm khách hàng hoặc mã đơn..."
            />
          </label>
          {backTo ? (
            <Link className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-primary" to={backTo}>
              <ChevronLeft className="size-4" />
              {backLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export function StatusPill({ children, tone = "amber" }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  )
}

export function Thumbnail({ label, tone = "amber" }) {
  const initials = label
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")

  return (
    <div
      className={`flex size-12 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
        tone === "green"
          ? "bg-success/10 text-success"
          : tone === "neutral"
            ? "bg-secondary text-secondary-foreground"
            : "bg-warning/10 text-warning"
      }`}
    >
      {initials}
    </div>
  )
}

export function WorkshopCard({ children, className = "", ref }) {
  return (
    <section ref={ref} className={`rounded-lg border border-border bg-card shadow-gallery-sm ${className}`}>
      {children}
    </section>
  )
}

export function WorkflowSteps({ activeIndex = 0, completedThrough = activeIndex - 1 }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      {workflowSteps.map((step, index) => {
        const isCompleted = index <= completedThrough
        const isActive = index === activeIndex

        return (
          <div
            key={step.id}
            className={`rounded-lg border p-4 transition-[border-color,box-shadow,background-color] duration-200 ${
              isCompleted
                ? "border-success/25 bg-success/10"
                : isActive
                  ? "border-primary/35 bg-card shadow-gallery-sm"
                  : "border-border bg-card"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isCompleted
                    ? "bg-success text-success-foreground"
                    : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="size-4" /> : index + 1}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{step.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function FieldGrid({ items }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-md border border-border bg-surface-elevated p-4">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 font-medium text-foreground">{value}</p>
        </div>
      ))}
    </div>
  )
}
