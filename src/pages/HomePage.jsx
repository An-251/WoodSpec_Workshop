import { Link } from "react-router-dom"
import { ArrowRight, Bot, CheckCircle2, ClipboardCheck, MessageSquareText, Ruler, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"

const heroImage =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2200&q=85"

const images = {
  living: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1500&q=82",
  workshop: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=82",
  kitchen: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1400&q=82",
  bedroom: "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1400&q=82",
  entry: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1400&q=82",
  studio: "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=1400&q=82",
  storage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=82",
}

const featureBlocks = [
  {
    icon: MessageSquareText,
    title: "Đối đáp bằng AI",
    text: "Khách hàng mô tả nhu cầu bằng lời nói hoặc văn bản, WoodSpec hỏi tiếp để hiểu đúng món đồ cần làm.",
  },
  {
    icon: Sparkles,
    title: "Đề xuất mẫu phù hợp",
    text: "Prompt sau đối đáp được chuẩn hóa để chọn mẫu có sẵn hoặc tạo mẫu mới theo đúng cấu trúc hệ thống.",
  },
  {
    icon: Ruler,
    title: "Chỉnh trên mô hình 3D",
    text: "Người dùng chỉnh kích thước, vật liệu, số ô, độ dày ván, tay nắm, khe thoáng và các chi tiết nhìn thấy.",
  },
  {
    icon: ClipboardCheck,
    title: "Tạo bảng thông số",
    text: "Các lựa chọn được gom lại thành bảng yêu cầu rõ ràng để gửi xưởng báo giá.",
  },
]

const collections = [
  {
    title: "Lối vào",
    text: "Tủ giày, ghế ngồi, khoang cất đồ nhỏ và giải pháp thoáng khí.",
    image: images.entry,
  },
  {
    title: "Phòng khách",
    text: "Kệ tivi, tủ trang trí, sideboard và hệ lưu trữ thấp.",
    image: images.living,
  },
  {
    title: "Bếp và bàn ăn",
    text: "Tủ phụ, tủ chén, khoang trưng bày và mặt kệ tiện dụng.",
    image: images.kitchen,
  },
]

const showcaseItems = [
  {
    category: "Tủ giày",
    title: "Tủ giày có ghế ngồi",
    text: "Cất giày dép hằng ngày, chìa khóa, ví và đồ nhỏ khi ra khỏi nhà.",
    image: images.entry,
  },
  {
    category: "Kệ tivi",
    title: "Kệ tivi phòng khách",
    text: "Đặt đầu thu, loa nhỏ, điều khiển, dây sạc và đồ trang trí thấp.",
    image: images.living,
  },
  {
    category: "Tủ quần áo",
    title: "Tủ quần áo cánh lùa",
    text: "Treo quần áo, xếp đồ gấp, cất chăn mỏng và phụ kiện cá nhân.",
    image: images.bedroom,
  },
  {
    category: "Tủ trang trí",
    title: "Tủ trang trí phòng ăn",
    text: "Cất chén bát nhẹ, khăn bàn, đồ dùng nhỏ và đặt máy pha cà phê phía trên.",
    image: images.storage,
  },
]

const processSteps = [
  ["01", "Đối đáp", "AI xác định người dùng muốn làm vật dụng gì, đặt ở đâu và cần công năng nào."],
  ["02", "Chọn mẫu", "WoodSpec đề xuất mẫu phù hợp nhất sau khi prompt đã được chốt."],
  ["03", "Chỉnh 3D", "Người dùng sửa từng chi tiết nhìn thấy trên mô hình trước khi tạo bảng thông số."],
  ["04", "Gửi yêu cầu", "Bảng thông số được tạo để xưởng hiểu cùng một cách trước khi báo giá."],
]

function HomePage() {
  return (
    <div className="overflow-hidden bg-[#ffffff] text-[#0a0a0a]">
      <section id="home" className="relative min-h-[calc(100vh-5rem)] scroll-mt-24 overflow-hidden">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#0a0a0a]/42" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0a0a0a]/72 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 lg:px-10 lg:pb-24">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e5e5e5]">WoodSpec Atelier</p>
          <h1 className="font-editorial mt-5 max-w-5xl text-5xl font-semibold leading-tight text-white md:text-7xl">
            Nội thất gỗ được phác thảo từ chính nhu cầu của bạn.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#f5f5f4] md:text-lg">
            WoodSpec giúp khách hàng đối đáp với AI, chọn mẫu phù hợp, xem mô hình 3D và tạo bảng thông số rõ ràng trước khi gửi xưởng báo giá.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to={ROUTES.login}>
              <Button size="lg" className="bg-[#0a0a0a] px-7 text-white hover:bg-[#262626]">
                Đăng nhập để bắt đầu
                <ArrowRight />
              </Button>
            </Link>
            <a href="#collections">
              <Button size="lg" variant="outline" className="border-white/60 bg-white/10 px-7 text-white backdrop-blur hover:bg-white hover:text-[#0a0a0a]">
                Xem bộ sưu tập
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[#fafafa] py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[0.95fr_1fr] lg:items-center lg:px-10">
          <div className="overflow-hidden">
            <img src={images.workshop} alt="" className="h-[620px] w-full object-cover" />
          </div>
          <div className="max-w-xl lg:ml-auto">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f665c]">Không gian được cá nhân hóa</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-[#0a0a0a] md:text-6xl">
              Từ mô tả mơ hồ đến một cấu hình có thể kiểm tra.
            </h2>
            <p className="mt-6 text-base leading-8 text-[#525252]">
              Thay vì bắt khách hàng đọc bản vẽ ngay từ đầu, WoodSpec bắt đầu bằng cuộc trò chuyện. Khi nhu cầu đã rõ, hệ thống mới đưa người dùng vào phần chỉnh chi tiết trên mô hình 3D.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {featureBlocks.map((feature) => (
                <div key={feature.title} className="border-t border-[#d4d4d4] pt-5">
                  <feature.icon className="size-8 text-[#6f665c]" />
                  <h3 className="mt-4 text-lg font-semibold text-[#0a0a0a]">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#525252]">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="collections" className="scroll-mt-24 bg-[#ffffff] py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f665c]">Bộ sưu tập</p>
            <h2 className="mt-4 text-4xl font-black text-[#0a0a0a] md:text-6xl">Chọn theo không gian</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {collections.map((collection) => (
              <article key={collection.title} className="group relative min-h-[540px] overflow-hidden bg-[#0a0a0a]">
                <img src={collection.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/72 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                  <h3 className="text-3xl font-black">{collection.title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-[#f5f5f4]">{collection.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fafafa] py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f665c]">Mẫu nổi bật</p>
              <h2 className="mt-4 text-4xl font-black text-[#0a0a0a] md:text-6xl">Có sẵn để bắt đầu nhanh</h2>
            </div>
            <Link to={ROUTES.login} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#6f665c]">
              Đăng nhập để cấu hình
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {showcaseItems.map((item) => (
              <article key={item.title} className="group">
                <div className="h-72 overflow-hidden border border-[#e5e5e5] bg-[#f5f5f4]">
                  <img src={item.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#6f665c]">{item.category}</p>
                <h3 className="mt-2 text-2xl font-black text-[#0a0a0a]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#525252]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="scroll-mt-24 bg-[#0a0a0a] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d4d4d4]">Quy trình</p>
              <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
                Đủ nhẹ cho khách hàng, đủ rõ cho xưởng.
              </h2>
            </div>
            <div className="grid gap-px overflow-hidden border border-white/12 bg-white/12 md:grid-cols-2">
              {processSteps.map(([number, title, text]) => (
                <article key={title} className="bg-[#0a0a0a] p-8">
                  <p className="text-sm font-bold text-[#d4d4d4]">{number}</p>
                  <h3 className="mt-10 text-2xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#d4d4d4]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 bg-[#fafafa] py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <img src={images.bedroom} alt="" className="h-[520px] w-full object-cover" />
            </div>
            <div className="lg:pl-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f665c]">Bắt đầu trong khu vực khách hàng</p>
              <h2 className="mt-5 text-4xl font-black leading-tight text-[#0a0a0a] md:text-6xl">
                Mô tả sản phẩm, chọn mẫu, rồi chỉnh từng chi tiết.
              </h2>
              <div className="mt-8 space-y-4">
                {["Đối đáp bằng giọng nói hoặc văn bản", "Xem mẫu được đề xuất theo prompt", "Chỉnh trực tiếp trên mô hình 3D", "Tạo bảng thông số gửi xưởng"].map((item) => (
                  <div key={item} className="flex items-center gap-3 border-t border-[#d4d4d4] pt-4 text-sm font-semibold text-[#0a0a0a]">
                    <CheckCircle2 className="size-5 text-[#6f665c]" />
                    {item}
                  </div>
                ))}
              </div>
              <Link to={ROUTES.login}>
                <Button size="lg" className="mt-9 bg-[#0a0a0a] px-7 text-white hover:bg-[#262626]">
                  Mở WoodSpec
                  <Bot />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
