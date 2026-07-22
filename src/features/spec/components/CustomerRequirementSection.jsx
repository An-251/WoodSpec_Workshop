import { CheckCircle2, ClipboardCheck, MessageSquareText } from "lucide-react"

function CustomerRequirementSection({ sections = [] }) {
  if (!sections.length) {
    return null
  }

  return (
    <article className="rounded-xl border border-border bg-card p-6 shadow-gallery-sm">
      <div className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-primary">
            <ClipboardCheck className="size-4" />
            Dành cho khách hàng
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-foreground">Yêu cầu tối thiểu cần xác nhận</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Đây là các thông tin người dùng có thể tự trả lời trước khi gửi xưởng. Những chi tiết kỹ thuật sản xuất sẽ do thợ mộc hoặc xưởng xử lý ở bước sau.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2 text-sm font-semibold text-muted-foreground">
          <MessageSquareText className="size-4" />
          Ngôn ngữ dễ hiểu
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <section key={section.title} className="rounded-lg border border-border bg-muted/45 p-5">
            <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.description}</p>

            <div className="mt-4 space-y-3">
              {section.items.map((item) => (
                <div key={`${section.title}-${item.label}`} className="rounded-lg bg-card p-3 text-sm shadow-sm border border-border/40">
                  <div className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">{item.label}</p>
                      <p className="mt-1 leading-6 text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}

export default CustomerRequirementSection
