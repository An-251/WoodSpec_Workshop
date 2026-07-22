/**
 * DashboardCharts – Analytics section for the Workshop Dashboard
 * Follows premium UI/UX chart standards:
 *   - Custom tooltips matching the design system
 *   - Gradient fills on area charts
 *   - No unnecessary grid noise
 *   - Smooth entrance animations
 *   - Donut chart with center KPI
 */
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// ─── Mock analytics data ──────────────────────────────────────────────────────

const revenueData = [
  { month: "T2", revenue: 42_000_000, orders: 3 },
  { month: "T3", revenue: 67_500_000, orders: 5 },
  { month: "T4", revenue: 55_000_000, orders: 4 },
  { month: "T5", revenue: 89_000_000, orders: 7 },
  { month: "T6", revenue: 74_000_000, orders: 6 },
  { month: "T7", revenue: 112_000_000, orders: 9 },
]

const categoryData = [
  { name: "Tủ & Kệ", value: 38 },
  { name: "Bàn làm việc", value: 27 },
  { name: "Bàn ăn", value: 20 },
  { name: "Giường", value: 10 },
  { name: "Khác", value: 5 },
]

const statusData = [
  { name: "Yêu cầu mở", value: 2, color: "#f59e0b" },
  { name: "Đang báo giá", value: 1, color: "#6b7280" },
  { name: "Đang sản xuất", value: 3, color: "#d5695d" },
  { name: "Hoàn tất", value: 4, color: "#22c55e" },
]

// ─── Color helpers ────────────────────────────────────────────────────────────

const BRAND_PRIMARY = "#d5695d"
const BRAND_MUTED = "#ebd6d2"
const BAR_COLORS = ["#d5695d", "#e8907e", "#f0b8a8", "#f5d4cd", "#fae8e5"]

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const { revenue, orders } = payload[0].payload
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.96)",
        border: "1px solid #ebd6d2",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 8px 32px rgba(27,11,9,0.12)",
        backdropFilter: "blur(8px)",
        minWidth: 140,
      }}
    >
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b5d5b" }}>
        {label}
      </p>
      <p style={{ margin: "6px 0 2px", fontSize: 20, fontWeight: 800, color: "#1b0b09" }}>
        {(revenue / 1_000_000).toFixed(0)} <span style={{ fontSize: 13, fontWeight: 600 }}>triệu ₫</span>
      </p>
      <p style={{ margin: 0, fontSize: 12, color: "#6b5d5b" }}>{orders} đơn hoàn tất</p>
    </div>
  )
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.96)",
        border: "1px solid #ebd6d2",
        borderRadius: 10,
        padding: "8px 12px",
        boxShadow: "0 4px 20px rgba(27,11,9,0.1)",
        backdropFilter: "blur(8px)",
      }}
    >
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1b0b09" }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: "#d5695d" }}>
        <strong>{payload[0].value}%</strong> tổng đơn
      </p>
    </div>
  )
}

// ─── Donut center label ───────────────────────────────────────────────────────

function DonutLabel({ cx, cy, total }) {
  return (
    <>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#1b0b09" style={{ fontSize: 26, fontWeight: 800, fontFamily: "Be Vietnam Pro, Inter, sans-serif" }}>
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#6b5d5b" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        đơn hàng
      </text>
    </>
  )
}

// ─── Section title ────────────────────────────────────────────────────────────

function ChartTitle({ title, subtitle }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-widest text-primary">{subtitle}</p>
      <h3 className="mt-0.5 text-lg font-bold text-foreground">{title}</h3>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function DashboardCharts() {
  const totalOrders = statusData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      {/* ── Area chart: Doanh thu ── */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-gallery-sm">
        <ChartTitle title="Doanh thu ước tính 6 tháng" subtitle="Hiệu suất" />
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND_PRIMARY} stopOpacity={0.22} />
                <stop offset="100%" stopColor={BRAND_PRIMARY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={BRAND_MUTED} vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b5d5b", fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b5d5b", fontSize: 11 }}
              tickFormatter={(v) => `${v / 1_000_000}tr`}
            />
            <Tooltip content={<RevenueTooltip />} cursor={{ stroke: BRAND_PRIMARY, strokeWidth: 1, strokeDasharray: "4 3" }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={BRAND_PRIMARY}
              strokeWidth={2.5}
              fill="url(#revenueGrad)"
              dot={{ r: 4, fill: "#fff", stroke: BRAND_PRIMARY, strokeWidth: 2.5 }}
              activeDot={{ r: 6, fill: BRAND_PRIMARY, stroke: "#fff", strokeWidth: 2 }}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Donut chart: Trạng thái đơn ── */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-gallery-sm">
        <ChartTitle title="Phân bổ trạng thái" subtitle="Đơn hàng" />
        <div className="flex items-center gap-4">
          <div style={{ flex: "0 0 140px", height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                  animationBegin={100}
                  animationDuration={800}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <DonutLabel cx={70} cy={70} total={totalOrders} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex flex-col gap-2.5">
            {statusData.map((item) => (
              <li key={item.name} className="flex items-center gap-2.5">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
                <span className="text-sm text-muted-foreground">{item.name}</span>
                <span className="ml-auto pl-3 text-sm font-bold text-foreground">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Horizontal bar: Phân bổ sản phẩm ── */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-gallery-sm xl:col-span-2">
        <ChartTitle title="Top danh mục sản phẩm" subtitle="Phân bổ đơn theo loại" />
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={categoryData}
            layout="vertical"
            margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
            barCategoryGap="28%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={BRAND_MUTED} horizontal={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b5d5b", fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 45]}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#1b0b09", fontSize: 13, fontWeight: 600 }}
              width={110}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: "#f4eeeb" }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={900} animationEasing="ease-out">
              {categoryData.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
