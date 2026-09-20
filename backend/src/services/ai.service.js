// src/services/ai.service.js
// ★ Generative AI Service — Plug & Play, không đụng chạm Schema/Logic cũ
// Sử dụng Google Gemini API (free-tier) cho 2 tính năng:
// 1. Sinh câu hỏi phỏng vấn kỹ thuật
// 2. Sinh Cover Letter chuyên nghiệp

const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let model = null;
if (GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  console.log('🤖 [AI Service] Google Gemini initialized successfully');
} else {
  console.warn('⚠️ [AI Service] GEMINI_API_KEY not set — AI features will return demo data');
}

// Wrapper to add timeout to API calls
const generateContentWithTimeout = async (prompt, timeoutMs = 35000) => {
  return Promise.race([
    model.generateContent(prompt),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`AI Request timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

/**
 * Sinh 5 câu hỏi phỏng vấn kỹ thuật dựa trên kỹ năng ứng viên + yêu cầu job
 */
const generateInterviewQuestions = async ({ candidateSkills, jobRequiredSkills, jobTitle }) => {
  const matchedSkills = candidateSkills.filter(s => 
    jobRequiredSkills.some(r => r.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = jobRequiredSkills.filter(r => 
    !candidateSkills.some(s => s.toLowerCase() === r.toLowerCase())
  );

  const prompt = `Bạn là chuyên gia tuyển dụng IT hàng đầu Việt Nam. Hãy sinh ra ĐÚNG 5 câu hỏi phỏng vấn kỹ thuật cho vị trí "${jobTitle}".

THÔNG TIN:
- Kỹ năng ứng viên CÓ: [${candidateSkills.join(', ')}]
- Kỹ năng job YÊU CẦU: [${jobRequiredSkills.join(', ')}]
- Kỹ năng TRÙNG KHỚP: [${matchedSkills.join(', ')}]
- Kỹ năng ỨNG VIÊN THIẾU: [${missingSkills.join(', ')}]

QUY TẮC:
1. 2-3 câu đầu: Hỏi sâu về kỹ năng ứng viên ĐÃ CÓ (kiểm tra thật hay chém gió).
2. 1-2 câu giữa: Hỏi về kỹ năng ứng viên THIẾU (đánh giá khả năng học hỏi).
3. 1 câu cuối: Câu hỏi tình huống thực tế (problem-solving).
4. Mỗi câu hỏi phải CỤ THỂ, không chung chung.
5. Viết bằng tiếng Việt.

TRẢ LỜI DƯỚI DẠNG JSON ARRAY (chỉ trả JSON, không thêm text nào khác):
[
  { "question": "...", "category": "matched_skill", "skill": "React", "difficulty": "medium" },
  ...
]

Trong đó:
- category: "matched_skill" | "missing_skill" | "problem_solving"
- difficulty: "easy" | "medium" | "hard"`;

  const fallbackData = [
    { question: `Hãy mô tả kiến trúc component trong ${matchedSkills[0] || 'framework'} mà bạn thường áp dụng trong dự án thực tế.`, category: 'matched_skill', skill: matchedSkills[0] || 'General', difficulty: 'medium' },
    { question: `Bạn xử lý state management như thế nào trong ứng dụng ${matchedSkills[1] || 'web'} lớn?`, category: 'matched_skill', skill: matchedSkills[1] || 'General', difficulty: 'medium' },
    { question: `Nếu dự án yêu cầu sử dụng ${missingSkills[0] || 'công nghệ mới'}, bạn sẽ có kế hoạch tự học và áp dụng nó trong bao lâu?`, category: 'missing_skill', skill: missingSkills[0] || 'General', difficulty: 'medium' },
    { question: `Mô tả một lần bạn gặp bug cực kỳ khó tìm liên quan đến ${matchedSkills[0] || 'hệ thống'}. Bạn đã giải quyết nó như thế nào?`, category: 'problem_solving', skill: 'General', difficulty: 'hard' },
    { question: `Làm sao để tối ưu hóa hiệu suất (performance) cho ứng dụng ${jobTitle}?`, category: 'problem_solving', skill: 'General', difficulty: 'hard' }
  ];

  if (!model) {
    return fallbackData;
  }

  try {
    const result = await generateContentWithTimeout(prompt);
    const text = result.response.text();
    // Chặn lỗi JSON parse nếu AI trả về kèm markdown
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('🤖 [AI Error] Interview Questions:', error.message);
    console.log('⚠️ Returning fallback data due to AI error');
    return fallbackData;
  }
};

/**
 * Sinh Cover Letter chuyên nghiệp dựa trên profile ứng viên + mô tả job
 */
const generateCoverLetter = async ({ candidateName, candidateSkills, jobTitle, jobDescription, companyName }) => {
  const prompt = `Bạn là chuyên gia viết thư xin việc (Cover Letter) chuyên nghiệp cho ngành IT tại Việt Nam.

THÔNG TIN ỨNG VIÊN:
- Tên: ${candidateName}
- Kỹ năng: [${candidateSkills.join(', ')}]

THÔNG TIN VIỆC LÀM:
- Vị trí: ${jobTitle}
- Công ty: ${companyName || 'Công ty'}
- Mô tả: ${(jobDescription || '').substring(0, 500)}

YÊU CẦU:
1. Viết một Cover Letter bằng tiếng Việt, chuyên nghiệp, nhiệt huyết nhưng không sáo rỗng.
2. Độ dài: 150-250 từ (vừa đủ, không quá dài).
3. Cấu trúc: Mở đầu gây ấn tượng → Nêu bật kỹ năng phù hợp → Thể hiện động lực → Kết thúc chuyên nghiệp.
4. KHÔNG dùng mẫu câu cũ rích ("Em xin tự giới thiệu...", "Em rất mong...").
5. Phải nhắc đến CỤ THỂ 2-3 kỹ năng liên quan nhất.
6. CHỈ TRẢ VỀ NỘI DUNG COVER LETTER, không thêm tiêu đề, không dùng markdown.`;

  const fallbackData = `Kính gửi Nhà tuyển dụng,

Tôi là ${candidateName}, ứng viên cho vị trí ${jobTitle} tại ${companyName || 'Quý công ty'}. Với nền tảng vững chắc về ${candidateSkills.slice(0, 3).join(', ')}, tôi tin rằng mình có thể đóng góp giá trị thực cho đội ngũ kỹ thuật của Quý công ty.

Trong quá trình làm việc, tôi đã tích lũy kinh nghiệm thực tế với ${candidateSkills[0] || 'các công nghệ hiện đại'} và ${candidateSkills[1] || 'phát triển phần mềm'}. Tôi luôn tìm cách cải thiện quy trình làm việc và sẵn sàng học hỏi những công nghệ mới để đáp ứng yêu cầu dự án.

Tôi rất mong có cơ hội trao đổi thêm về cách tôi có thể đóng góp cho ${companyName || 'Quý công ty'}.

Trân trọng,
${candidateName}`;

  if (!model) {
    return fallbackData;
  }

  try {
    const result = await generateContentWithTimeout(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('🤖 [AI Error] Cover Letter:', error.message);
    console.log('⚠️ Returning fallback data due to AI error');
    return fallbackData;
  }
};

/**
 * Sinh Job Description (dành cho Employer)
 */
const generateJobDescription = async ({ title, skills }) => {
  const prompt = `Bạn là chuyên gia tuyển dụng IT (HR). Hãy sinh ra một bản Mô tả công việc (Job Description) chuyên nghiệp dựa trên các thông tin sau:
- Chức danh: ${title}
- Kỹ năng yêu cầu: [${skills.join(', ')}]

Yêu cầu định dạng văn bản:
1. Trình bày dạng văn bản rõ ràng, KHÔNG DÙNG markdown (không dùng **, #, * v.v). Thay vào đó hãy dùng gạch ngang (-) cho các gạch đầu dòng và khoảng trắng để xuống dòng.
2. Bao gồm 3 phần chính:
   - MÔ TẢ CÔNG VIỆC: (Mô tả ngắn gọn về vai trò và trách nhiệm)
   - YÊU CẦU CÔNG VIỆC: (Dựa vào kỹ năng yêu cầu và các kỹ năng liên quan)
   - QUYỀN LỢI ĐƯỢC HƯỞNG: (Gợi ý các quyền lợi hấp dẫn chuẩn ngành IT)
3. Văn phong chuyên nghiệp, thu hút ứng viên.`;

  const fallbackData = `MÔ TẢ CÔNG VIỆC
- Tham gia phát triển và bảo trì các hệ thống cho dự án ${title}.
- Phối hợp với team để hoàn thành các tính năng theo yêu cầu.

YÊU CẦU CÔNG VIỆC
- Thành thạo các kỹ năng: ${skills.join(', ')}.
- Có khả năng làm việc độc lập và làm việc nhóm tốt.
- Tư duy logic tốt, tinh thần trách nhiệm cao.

QUYỀN LỢI ĐƯỢC HƯỞNG
- Mức lương cạnh tranh, tương xứng với năng lực.
- Lương tháng 13, thưởng dự án, review lương 2 lần/năm.
- Môi trường làm việc trẻ trung, năng động, Agile/Scrum.
- BHXH, BHYT đầy đủ theo luật Lao động.`;

  if (!model) {
    return fallbackData;
  }

  try {
    const result = await generateContentWithTimeout(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('🤖 [AI Error] JD Generator:', error.message);
    console.log('⚠️ Returning fallback data due to AI error');
    return fallbackData;
  }
};

/**
 * Đánh giá nhanh ứng viên (dành cho Employer)
 */
const assessCandidate = async ({ candidateSkills, candidateExperience, jobRequiredSkills, jobTitle }) => {
  const prompt = `Bạn là Tech Lead đang phỏng vấn ứng viên. Hãy đánh giá nhanh ứng viên này cho vị trí "${jobTitle}".
THÔNG TIN:
- Kỹ năng ứng viên có: [${candidateSkills.join(', ')}]
- Kinh nghiệm: ${candidateExperience} năm
- Kỹ năng job yêu cầu: [${jobRequiredSkills.join(', ')}]

TRẢ VỀ DUY NHẤT ĐỊNH DẠNG JSON MÀ KHÔNG CÓ BẤT KỲ VĂN BẢN NÀO KHÁC VÀ KHÔNG BỌC TRONG CODE BLOCK:
{
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "weaknesses": ["Điểm yếu 1", "Điểm yếu 2"],
  "recommendation": "Đánh giá chung (Có nên phỏng vấn không và tại sao, ngắn gọn 1-2 câu)"
}`;

  const fallbackData = {
    strengths: ["Kỹ năng phù hợp với yêu cầu", "Có kinh nghiệm nền tảng"],
    weaknesses: ["Chưa rõ mức độ chuyên sâu của một số kỹ năng"],
    recommendation: "Ứng viên tiềm năng, nên phỏng vấn để đánh giá thêm."
  };

  if (!model) {
    return fallbackData;
  }

  try {
    const result = await generateContentWithTimeout(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('🤖 [AI Error] Candidate Assessment:', error.message);
    console.log('⚠️ Returning fallback data due to AI error');
    return fallbackData;
  }
};

/**
 * Gợi ý Lộ trình nghề nghiệp (dành cho Candidate)
 */
const suggestCareerPath = async ({ candidateSkills }) => {
  const prompt = `Bạn là Chuyên gia Tư vấn Nghề nghiệp IT. Dựa vào bộ kỹ năng hiện tại của ứng viên, hãy gợi ý lộ trình học tập tiếp theo.
- Kỹ năng hiện tại: [${candidateSkills.join(', ')}]

TRẢ VỀ DUY NHẤT ĐỊNH DẠNG JSON MÀ KHÔNG CÓ BẤT KỲ VĂN BẢN NÀO KHÁC VÀ KHÔNG BỌC TRONG CODE BLOCK:
{
  "nextSkills": ["Kỹ năng 1", "Kỹ năng 2", "Kỹ năng 3"],
  "careerAdvice": "Lời khuyên tổng quan về định hướng phát triển (ví dụ: nên hướng tới Fullstack hay DevOps, ngắn gọn 2-3 câu)"
}`;

  const fallbackData = {
    nextSkills: ["Docker", "Kubernetes", "AWS"],
    careerAdvice: "Với bộ kỹ năng hiện tại, bạn có thể tìm hiểu thêm về DevOps hoặc Cloud computing để mở rộng cơ hội nghề nghiệp."
  };

  if (!model) {
    return fallbackData;
  }

  try {
    const result = await generateContentWithTimeout(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('🤖 [AI Error] Career Path:', error.message);
    console.log('⚠️ Returning fallback data due to AI error');
    return fallbackData;
  }
};

module.exports = { 
  generateInterviewQuestions, 
  generateCoverLetter,
  generateJobDescription,
  assessCandidate,
  suggestCareerPath
};
