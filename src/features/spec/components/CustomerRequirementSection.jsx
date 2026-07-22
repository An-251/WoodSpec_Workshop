import { CheckCircle2, ClipboardCheck, MessageSquareText } from "lucide-react"

function CustomerRequirementSection({ sections = [] }) {
  if (!sections.length) {
    return null
  }

  return (
    <article className="rounded-xl border border-[#ead8ca] bg-white p-6 shadow-[0_4px_20px_rgba(43,33,24,0.08)]">
      <div className="flex flex-col gap-3 border-b border-[#ead8ca] pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-[#fff1e8] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#854f19]">
            <ClipboardCheck className="size-4" />
            Dành cho khách hàng
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-[#231a11]">Yêu cầu tối thiểu cần xác nhận</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#635348]">
            Đây là các thông tin người dùng có thể tự trả lời trước khi gửi xưởng. Những chi tiết kỹ thuật sản xuất sẽ do thợ mộc hoặc xưởng xử lý ở bước sau.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#ead8ca] bg-[#fffaf6] px-4 py-2 text-sm font-semibold text-[#735b2d]">
          <MessageSquareText className="size-4" />
          Ngôn ngữ dễ hiểu
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <section key={section.title} className="rounded-lg border border-[#ead8ca] bg-[#fffaf6] p-5">
            <h3 className="text-lg font-semibold text-[#231a11]">{section.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#635348]">{section.description}</p>

            <div className="mt-4 space-y-3">
              {section.items.map((item) => (
                <div key={`${section.title}-${item.label}`} className="rounded-lg bg-white p-3 text-sm shadow-[0_1px_8px_rgba(43,33,24,0.05)]">
                  <div className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#854f19]" />
                    <div>
                      <p className="font-semibold text-[#231a11]">{item.label}</p>
                      <p className="mt-1 leading-6 text-[#635348]">{item.value}</p>
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
