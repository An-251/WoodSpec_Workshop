const requirementPresets = {
  "shoe-cabinet": {
    room: "Lối vào, hành lang hoặc khu vực gần cửa chính.",
    usage: "Giày dép hằng ngày, dép khách, mũ bảo hiểm hoặc đồ nhỏ khi ra vào.",
    placement: "Đặt sát tường, cần kiểm tra nẹp chân tường và độ bằng phẳng của sàn.",
    accessories: "Cánh đóng êm, khe thoáng hoặc chân tăng chỉnh nếu sàn không đều.",
  },
  bookshelf: {
    room: "Phòng làm việc, phòng khách hoặc góc đọc sách.",
    usage: "Sách, hồ sơ, đồ trang trí và một phần vật dụng sử dụng thường xuyên.",
    placement: "Đặt sát tường; với kệ cao nên xác nhận nhu cầu chống lật.",
    accessories: "Có thể cần khoang kín, đợt kệ chịu tải tốt hoặc lỗ luồn dây nếu đặt thiết bị.",
  },
  "study-desk": {
    room: "Phòng học, phòng làm việc hoặc góc làm việc tại nhà.",
    usage: "Laptop, màn hình, sách vở, tài liệu và đồ dùng cá nhân.",
    placement: "Cần kiểm tra ổ điện, hướng ngồi, ánh sáng và khoảng trống để kéo ghế.",
    accessories: "Ray kéo êm, khay bàn phím, lỗ luồn dây hoặc hộc kéo theo nhu cầu.",
  },
  sideboard: {
    room: "Phòng khách, phòng ăn hoặc khu vực bếp khô.",
    usage: "Đồ dùng gia đình, chén bát nhẹ, khăn bàn, đồ trang trí hoặc thiết bị nhỏ.",
    placement: "Đặt sát tường, cần kiểm tra ổ điện nếu đặt máy pha cà phê, đèn hoặc loa.",
    accessories: "Ray kéo êm, tay nắm âm, chân tăng chỉnh và lỗ luồn dây nếu có thiết bị.",
  },
  wardrobe: {
    room: "Phòng ngủ hoặc phòng thay đồ.",
    usage: "Quần áo treo, quần áo gấp, chăn mỏng, túi xách và phụ kiện cá nhân.",
    placement: "Cần đo chiều cao trần, chiều rộng tường, lối mở cánh và lối vận chuyển.",
    accessories: "Ray treo đồ, bản lề hoặc ray lùa, tay nắm dọc và chân tăng chỉnh.",
  },
  "tv-console": {
    room: "Phòng khách hoặc phòng giải trí gia đình.",
    usage: "Tivi, đầu thu, loa nhỏ, điều khiển, dây sạc và đồ trang trí thấp.",
    placement: "Đặt dưới tivi, cần kiểm tra ổ điện, dây tín hiệu và khoảng thoáng phía sau.",
    accessories: "Lỗ luồn dây, khe thoáng thiết bị, ray kéo êm và tay nắm gọn.",
  },
  "kitchen-cabinet": {
    room: "Khu bếp nhỏ, bếp khô hoặc khu lưu trữ đồ ăn.",
    usage: "Đồ khô, chén bát nhẹ, hộp gia vị và một vài thiết bị nhỏ.",
    placement: "Cần kiểm tra độ ẩm, ổ điện, khoảng mở cánh và mặt sàn khu bếp.",
    accessories: "Bản lề đóng êm, tay nắm gọn, chân tăng chỉnh và bề mặt dễ lau.",
  },
}

const doorStyleLabels = {
  open: "Khoang mở",
  "two-doors": "Hai cánh",
  slatted: "Cánh có khe thoáng",
  drawers: "Ngăn kéo",
}

const handleStyleLabels = {
  none: "Không tay nắm",
  "edge-pull": "Khoét cạnh",
  "round-knob": "Núm tròn",
  "vertical-bar": "Tay nắm dọc",
}

const shelfStyleLabels = {
  none: "Không chia kệ",
  grid: "Chia ô đều",
  flat: "Đợt ngang",
  tilted: "Đợt nghiêng",
}

const backPanelLabels = {
  none: "Không hậu",
  partial: "Hậu một phần",
  closed: "Hậu kín",
  accent: "Hậu nhấn màu",
}

function getPreset(configuration) {
  return requirementPresets[configuration.product?.id] ?? requirementPresets.bookshelf
}

function getLayoutRequirement(layout) {
  if (!layout) {
    return "Xác nhận lại số khoang mở, khoang kín hoặc ngăn kéo mong muốn."
  }

  if ((layout.drawers ?? 0) > 0) {
    return "Xác nhận đồ sẽ để trong ngăn kéo và có cần ray kéo êm hay không."
  }

  if ((layout.doors ?? 0) > 0) {
    return "Xác nhận kiểu tay nắm, hướng mở cánh và có cần đóng êm hay không."
  }

  return "Xác nhận các khoang mở dùng để trưng bày, để sách nặng hay đồ dùng hằng ngày."
}

function getCellSize(dimensions, designDetails = {}) {
  const board = designDetails.boardThickness ?? 18
  const shelf = designDetails.shelfThickness ?? 18
  const columns = Math.max(1, designDetails.compartmentColumns ?? 3)
  const rows = Math.max(1, designDetails.compartmentRows ?? 3)

  return {
    width: Math.max(0, Math.round((dimensions.width - board * 2 - board * (columns - 1)) / columns)),
    height: Math.max(0, Math.round((dimensions.height - board * 2 - shelf * (rows - 1)) / rows)),
    depth: Math.max(0, Math.round(dimensions.depth - board)),
  }
}

function getExtraDetails(designDetails) {
  const extraDetails = [
    designDetails.cableHole ? "Có lỗ luồn dây" : null,
    designDetails.ventSlots ? "Có khe thoáng" : null,
    designDetails.toeKick ? "Có nẹp chân/đế lùi" : null,
    designDetails.seatPad ? "Có đệm ngồi" : null,
  ].filter(Boolean)

  return extraDetails.length > 0 ? extraDetails.join(", ") : "Không có lựa chọn thêm."
}

export function generateSpec(configuration) {
  const preset = getPreset(configuration)
  const details = configuration.requestDetails ?? {}
  const designDetails = configuration.designDetails ?? {}
  const columns = Math.max(1, designDetails.compartmentColumns ?? configuration.layout?.columns ?? 3)
  const rows = Math.max(1, designDetails.compartmentRows ?? configuration.layout?.rows ?? 3)
  const cellSize = getCellSize(configuration.dimensions, designDetails)

  return {
    productName: configuration.productName,
    dimensions: configuration.dimensions,
    material: configuration.material?.name ?? configuration.material,
    color: configuration.color?.name ?? configuration.color,
    layout: configuration.layout?.name ?? configuration.layout,
    estimatedPrice: configuration.estimatedPrice,
    placement: details.placement || preset.room,
    usage: details.usage || preset.usage,
    referenceImage: details.referenceImage || "Chưa có hình tham khảo.",
    budget: details.budget,
    expectedTimeline: details.expectedTimeline,
    installationCondition: details.installationCondition,
    customerRequirements: [
      {
        title: "Vị trí sử dụng",
        description: "Những thông tin này giúp xưởng hiểu sản phẩm sẽ nằm ở đâu trong nhà.",
        items: [
          { label: "Không gian dự kiến", value: details.placement || preset.room },
          { label: "Cách đặt sản phẩm", value: preset.placement },
          {
            label: "Điều kiện lắp đặt",
            value:
              details.installationCondition ||
              "Cần xác nhận lối vận chuyển, ổ điện, tường ẩm hoặc vị trí khó lắp đặt.",
          },
        ],
      },
      {
        title: "Nhu cầu sử dụng",
        description: "Khách hàng chỉ cần mô tả đồ sẽ cất hoặc đặt lên sản phẩm.",
        items: [
          ...(details.initialPrompt ? [{ label: "Mô tả ban đầu", value: details.initialPrompt }] : []),
          { label: "Đồ dùng chính", value: details.usage || preset.usage },
          {
            label: "Mức tải mong muốn",
            value: "Nhẹ, trung bình hoặc nặng; nếu có sách dày, máy in, màn hình, hãy ghi rõ.",
          },
          { label: "Số ngăn/tầng/cánh", value: details.compartmentNote || getLayoutRequirement(configuration.layout) },
        ],
      },
      {
        title: "Hoàn thiện nhìn thấy",
        description: "Các lựa chọn khách hàng có thể cảm nhận và quyết định bằng mắt thường.",
        items: [
          { label: "Vật liệu đang chọn", value: configuration.material?.name ?? configuration.material },
          { label: "Màu hoàn thiện", value: configuration.color?.name ?? configuration.color },
          { label: "Hình tham khảo", value: details.referenceImage || "Chưa có hình tham khảo." },
        ],
      },
      {
        title: "Chi tiết bản vẽ đã chọn",
        description: "Các thông số này giúp khách hàng kiểm tra sơ bộ bố cục trước khi gửi yêu cầu.",
        items: [
          { label: "Số ô/khoang", value: `${columns} cột x ${rows} hàng, tổng ${columns * rows} ô` },
          {
            label: "Kích thước một ô ước tính",
            value: `${cellSize.width} x ${cellSize.height} x ${cellSize.depth} mm`,
          },
          { label: "Độ dày ván chính", value: `${designDetails.boardThickness ?? 18} mm` },
          { label: "Độ dày cánh", value: `${designDetails.doorThickness ?? 18} mm` },
          { label: "Độ dày đợt/kệ", value: `${designDetails.shelfThickness ?? 18} mm` },
          { label: "Kiểu mặt/cánh", value: doorStyleLabels[designDetails.doorStyle] ?? "Khoang mở" },
          { label: "Kiểu tay nắm", value: handleStyleLabels[designDetails.handleStyle] ?? "Khoét cạnh" },
          { label: "Kiểu kệ/khoang", value: shelfStyleLabels[designDetails.shelfStyle] ?? "Chia ô đều" },
          { label: "Hậu sản phẩm", value: backPanelLabels[designDetails.backPanel] ?? "Hậu một phần" },
          { label: "Chi tiết thêm", value: getExtraDetails(designDetails) },
        ],
      },
      {
        title: "Phụ kiện người dùng có thể chọn",
        description: "Không yêu cầu khách chọn mã phụ kiện; xưởng sẽ quy đổi sang mã kỹ thuật sau.",
        items: [
          {
            label: "Đóng mở",
            value: details.accessories || "Có cần đóng êm cho cánh tủ hoặc ray kéo êm cho ngăn kéo không.",
          },
          { label: "Tay nắm", value: "Tay nắm nổi, tay nắm âm, khoét cạnh hoặc không tay nắm." },
          { label: "Chân/đế", value: preset.accessories },
        ],
      },
      {
        title: "Giao nhận và lắp đặt",
        description: "Các điều kiện thực tế này ảnh hưởng trực tiếp đến báo giá và lịch thi công.",
        items: [
          { label: "Dịch vụ mong muốn", value: "Chỉ giao hàng, giao và lắp đặt, hoặc cần khảo sát trước." },
          {
            label: "Đường vận chuyển",
            value:
              details.installationCondition ||
              "Tầng cao, thang máy, cầu thang hẹp, hẻm nhỏ hoặc thời gian được phép giao hàng.",
          },
          {
            label: "Thời gian dự kiến",
            value: details.expectedTimeline || "Ngày cần nhận hàng hoặc khoảng thời gian có thể lắp đặt.",
          },
        ],
      },
      {
        title: "Ngân sách và phạm vi gửi",
        description: "Giúp lọc xưởng phù hợp và tránh gửi yêu cầu quá rộng.",
        items: [
          {
            label: "Ngân sách dự kiến",
            value: details.budget ? `${details.budget.toLocaleString("vi-VN")} đ` : "Chưa xác định.",
          },
          { label: "Khu vực gửi báo giá", value: details.region || "Chưa chọn khu vực." },
        ],
      },
    ],
    notes: [
      "Bảng này dùng để gửi yêu cầu sơ bộ cho xưởng báo giá.",
      "Các chi tiết chuyên môn như liên kết, dung sai, danh sách cắt và bản vẽ sản xuất sẽ do xưởng xác nhận sau.",
      "Giá hiện tại là ước tính ban đầu, chưa phải báo giá sản xuất cuối cùng.",
    ],
  }
}
