
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Vui lòng gửi câu hỏi bằng POST."
    });
  }

  const question = req.body?.question;
  // Chi nhan du lieu hoc tap an danh, khong nhan ten hay thong tin hoc sinh.
  const rawContext = req.body?.learningContext;
  const learningContext = rawContext && typeof rawContext === "object" && !Array.isArray(rawContext)
    ? {
        score: Number.isInteger(rawContext.score) && rawContext.score >= 0 && rawContext.score <= 20 ? rawContext.score : null,
        total: Number.isInteger(rawContext.total) && rawContext.total >= 1 && rawContext.total <= 20 ? rawContext.total : null,
        mistakes: Array.isArray(rawContext.mistakes)
          ? rawContext.mistakes.filter(x => typeof x === "string").slice(0, 5).map(x => x.slice(0, 70))
          : []
      }
    : null;

  if (
    typeof question !== "string" ||
    !question.trim() ||
    question.length > 500
  ) {
    return res.status(400).json({
      error: "Câu hỏi phải có từ 1 đến 500 ký tự."
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: "Máy chủ chưa được cấu hình Gemini."
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(), 15000
    );

    let response;
    try {
      response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text:
                  "Bạn là Mây, trợ lý học tập Tin học lớp 3 " +
                  "theo bộ sách Kết nối tri thức với cuộc sống. " +
                  "Trả lời bằng tiếng Việt, ngắn gọn, thân thiện, " +
                  "dễ hiểu, tối đa khoảng 100 từ. " +
                  "Ưu tiên gợi ý từng bước để học sinh tự suy nghĩ. " +
                  "Không yêu cầu thông tin cá nhân. " +
                  "Nếu câu hỏi không liên quan đến học tập, " +
                  "hãy nhẹ nhàng hướng học sinh về bài học."
              }]
            },
            contents: [{
              role: "user",
              parts: [{ text: question.trim() + (learningContext && (learningContext.mistakes.length || learningContext.score !== null)
              ? "\\n\\nThong tin bai tap gan nhat (an danh, chi de goi y): " + JSON.stringify(learningContext) +
                "\\nHay dua ra 1 goi y cu the theo loi sai, 1 vi du tuong tu va 1 bai tap ngan. Khong khang dinh da danh gia toan bo nang luc hoc sinh."
              : "") }]
            }],
            generationConfig: {
              maxOutputTokens: 400
            }
          }),
          signal: controller.signal
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      console.error(
        "Gemini response status:",
        response.status
      );
      return res.status(502).json({
        error: "AI Mây chưa kết nối được Gemini."
      });
    }

    const data = await response.json();
    const answer = (
      data.candidates?.[0]?.content?.parts || []
    )
      .map(part => part.text || "")
      .join("")
      .trim();

    return res.status(200).json({
      answer: answer || "Mây chưa có câu trả lời."
    });
  } catch (error) {
    console.error("AI May request failed:", error.name);
    return res.status(503).json({
      error: "AI Mây tạm thời chưa hoạt động."
    });
  }
}
