export const openingQuestion = {
  id: "productNeed",
  text: "Anh chị đang muốn làm vật dụng gì cho không gian nào?",
  hint: "Ví dụ: tủ giày cho lối vào, kệ sách cho phòng làm việc, bàn học cho phòng ngủ.",
}

const productProfiles = {
  "shoe-cabinet": {
    name: "tủ giày",
    aliases: ["tủ giày", "tu giay", "giày", "giay", "dép", "dep", "lối vào", "loi vao", "hành lang", "hanh lang"],
    questions: [
      {
        id: "usage",
        text: "Với tủ giày này, anh chị cần cất khoảng bao nhiêu đôi giày và có thêm đồ nhỏ như chìa khóa, mũ bảo hiểm hay túi xách không?",
        hint: "Ví dụ: khoảng 15 đôi giày, thêm chìa khóa và vài món nhỏ khi ra vào.",
      },
      {
        id: "style",
        text: "Anh chị muốn tủ giày nhìn kín gọn, có khe thoáng, có ghế ngồi thay giày hay có ngăn kéo nhỏ?",
        hint: "Ví dụ: cánh kín có khe thoáng, thêm ghế ngồi và ngăn kéo nhỏ.",
      },
    ],
    reply: "Mình hiểu anh chị đang cần một tủ giày. Mình sẽ hỏi thêm về sức chứa và cách đóng mở để chọn mẫu phù hợp hơn.",
  },
  bookshelf: {
    name: "kệ sách",
    aliases: ["kệ sách", "ke sach", "sách", "sach", "hồ sơ", "ho so", "tài liệu", "tai lieu", "trưng bày", "trung bay"],
    questions: [
      {
        id: "usage",
        text: "Kệ này sẽ để sách, hồ sơ, đồ trang trí hay thiết bị nào là chính?",
        hint: "Ví dụ: sách và hồ sơ là chính, thêm vài món trang trí nhỏ.",
      },
      {
        id: "style",
        text: "Anh chị thích kệ mở nhiều ô, có khoang kín phía dưới, hay có ngăn kéo để giấu đồ?",
        hint: "Ví dụ: nhiều khoang mở phía trên, có khoang kín phía dưới.",
      },
    ],
    reply: "Mình hiểu anh chị đang cần một kệ sách hoặc kệ trưng bày. Mình sẽ hỏi thêm về đồ đặt lên kệ và mức độ mở kín.",
  },
  "study-desk": {
    name: "bàn học",
    aliases: ["bàn học", "ban hoc", "bàn làm việc", "ban lam viec", "laptop", "màn hình", "man hinh", "đèn học", "den hoc"],
    questions: [
      {
        id: "usage",
        text: "Bàn này cần đặt những gì: laptop, màn hình, sách vở, đèn học hay đồ dùng cá nhân?",
        hint: "Ví dụ: laptop, một màn hình, sách vở và đèn học.",
      },
      {
        id: "style",
        text: "Anh chị muốn bàn tối giản ít ngăn, có hộc kéo, hay có nhiều ngăn để phân loại đồ?",
        hint: "Ví dụ: có hộc kéo một bên, mặt bàn rộng và có lỗ luồn dây.",
      },
    ],
    reply: "Mình hiểu anh chị đang cần một bàn học hoặc bàn làm việc. Mình sẽ hỏi thêm về đồ dùng trên bàn và kiểu lưu trữ.",
  },
  wardrobe: {
    name: "tủ quần áo",
    aliases: ["tủ quần áo", "tu quan ao", "quần áo", "quan ao", "phòng ngủ", "phong ngu", "treo đồ", "treo do", "cánh lùa", "canh lua"],
    questions: [
      {
        id: "usage",
        text: "Tủ quần áo này cần treo đồ, xếp đồ gấp, cất chăn mỏng hay thêm ngăn phụ kiện?",
        hint: "Ví dụ: treo áo dài, xếp đồ gấp và có vài ngăn nhỏ cho phụ kiện.",
      },
      {
        id: "style",
        text: "Anh chị muốn tủ cánh lùa, cánh mở, có ngăn kéo dưới hay chia nhiều khoang kín?",
        hint: "Ví dụ: cánh lùa màu sáng, có khoang treo và ngăn kéo thấp.",
      },
    ],
    reply: "Mình hiểu anh chị đang cần một tủ quần áo. Mình sẽ hỏi thêm về cách treo, xếp đồ và kiểu cánh.",
  },
  "tv-console": {
    name: "kệ tivi",
    aliases: ["kệ tivi", "ke tivi", "tivi", "tv", "đầu thu", "dau thu", "loa", "phòng khách", "phong khach"],
    questions: [
      {
        id: "usage",
        text: "Kệ tivi này cần đặt thiết bị nào: đầu thu, loa, máy chơi game, router hay chỉ để đồ trang trí?",
        hint: "Ví dụ: đặt đầu thu, loa nhỏ, router và vài đồ trang trí.",
      },
      {
        id: "style",
        text: "Anh chị muốn kệ thấp tối giản, có ngăn kéo, khoang mở cho thiết bị hay cánh kín để giấu đồ?",
        hint: "Ví dụ: ngăn kéo thấp, khoang mở ở giữa và có lỗ luồn dây.",
      },
    ],
    reply: "Mình hiểu anh chị đang cần một kệ tivi. Mình sẽ hỏi thêm về thiết bị và cách giấu dây.",
  },
  "kitchen-cabinet": {
    name: "tủ bếp phụ",
    aliases: ["tủ bếp", "tu bep", "bếp phụ", "bep phu", "đồ khô", "do kho", "chén bát", "chen bat", "gia vị", "gia vi"],
    questions: [
      {
        id: "usage",
        text: "Tủ bếp phụ này chủ yếu để đồ khô, chén bát nhẹ, gia vị hay thiết bị nhỏ?",
        hint: "Ví dụ: đồ khô, gia vị và một ít chén bát nhẹ.",
      },
      {
        id: "style",
        text: "Anh chị muốn tủ cánh kín dễ lau, khoang mở lấy nhanh hay kết hợp thêm ngăn kéo?",
        hint: "Ví dụ: cánh kín màu kem, có một ngăn kéo nhỏ và bề mặt dễ lau.",
      },
    ],
    reply: "Mình hiểu anh chị đang cần một tủ bếp phụ. Mình sẽ hỏi thêm về đồ lưu trữ và cách đóng mở.",
  },
  sideboard: {
    name: "tủ trang trí",
    aliases: ["tủ trang trí", "tu trang tri", "sideboard", "tủ thấp", "tu thap", "phòng ăn", "phong an", "máy pha cà phê", "may pha ca phe"],
    questions: [
      {
        id: "usage",
        text: "Tủ trang trí này cần cất đồ gì và mặt trên có đặt thiết bị hay đồ decor không?",
        hint: "Ví dụ: cất chén bát nhẹ, khăn bàn và đặt máy pha cà phê phía trên.",
      },
      {
        id: "style",
        text: "Anh chị thích tủ thấp có khoang kín, ngăn kéo nhỏ hay có một phần khoang mở để trưng bày?",
        hint: "Ví dụ: khoang kín phía dưới, mặt trên trưng bày và vài ngăn kéo nhỏ.",
      },
    ],
    reply: "Mình hiểu anh chị đang cần một tủ trang trí. Mình sẽ hỏi thêm về đồ cất bên trong và mặt trên.",
  },
}

const fallbackProfile = {
  name: "sản phẩm nội thất gỗ",
  questions: [
    {
      id: "usage",
      text: "Vật dụng này sẽ dùng để chứa, đặt hoặc trưng bày những gì là chính?",
      hint: "Ví dụ: giày dép, sách hồ sơ, laptop, đồ trang trí hoặc đồ dùng cá nhân.",
    },
    {
      id: "style",
      text: "Anh chị thích kiểu mở thoáng, có cánh kín, có ngăn kéo hay tối giản?",
      hint: "Ví dụ: nhiều khoang mở, có cánh kín, có hộc kéo hoặc ít chi tiết.",
    },
  ],
  reply: "Mình chưa chắc món đồ cụ thể, nên sẽ hỏi thêm về công năng và kiểu bố cục để chọn mẫu gần nhất.",
}

function normalizeText(value = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function detectProductIntent(input = "") {
  const normalizedInput = normalizeText(input)
  const scoredProfiles = Object.entries(productProfiles).map(([id, profile]) => {
    const score = profile.aliases.filter((keyword) => normalizedInput.includes(normalizeText(keyword))).length

    return { id, ...profile, score }
  })
  const bestProfile = scoredProfiles.sort((first, second) => second.score - first.score)[0]

  return bestProfile?.score > 0 ? bestProfile : { id: "unknown", ...fallbackProfile, score: 0 }
}

export function getDesignInterviewQuestions(answers = {}) {
  const intent = detectProductIntent(answers.productNeed)

  return [
    openingQuestion,
    ...intent.questions,
  ]
}

export function getInterviewReply(answers = {}, questionIndex = 0) {
  if (questionIndex === 0) {
    return "Mình sẽ bắt đầu bằng việc xác định đúng món đồ anh chị muốn làm."
  }

  return detectProductIntent(answers.productNeed).reply
}

export function getFallbackInterviewTurn(answers = {}, turnCount = 1) {
  const intent = detectProductIntent(answers.productNeed)
  const scriptedQuestion = intent.questions[turnCount - 1]

  if (scriptedQuestion) {
    return {
      reply: intent.reply,
      question: scriptedQuestion.text,
      hint: scriptedQuestion.hint,
      ready: false,
      prompt: "",
    }
  }

  if (turnCount === 3) {
    return {
      reply: "Mình đã hiểu thêm về kiểu sử dụng. Mình hỏi thêm một chút về cảm giác nhìn và màu hoàn thiện để chọn mẫu sát hơn.",
      question: "Anh chị thích màu gỗ sáng, gỗ tự nhiên, gỗ đậm hay màu trắng sạch?",
      hint: "Ví dụ: màu gỗ sáng, nhìn ấm và dễ vệ sinh.",
      ready: false,
      prompt: "",
    }
  }

  return {
    reply: "Thông tin hiện tại đã đủ để tạo prompt chính và chọn mẫu gần nhất.",
    question: "",
    hint: "",
    ready: true,
    prompt: buildInterviewPrompt(answers),
  }
}

export function buildInterviewPrompt(answers) {
  const intent = detectProductIntent(answers.productNeed)
  const dynamicAnswers = Object.keys(answers)
    .filter((key) => key.startsWith("extra-"))
    .sort()
    .map((key) => answers[key])
  const answerText = [answers.productNeed, answers.usage, answers.style, ...dynamicAnswers]
    .map((item) => item?.trim())
    .filter(Boolean)
    .join(". ")

  if (!answerText) {
    return ""
  }

  return `Khách hàng muốn làm ${intent.name}. ${answerText}.`
}
