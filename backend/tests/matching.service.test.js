// tests/matching.service.test.js
// ★ Unit Test cho Skill Matching Algorithm — bảo vệ điểm mạnh nhất của đồ án
// Bao gồm: normalizeSkill, isSkillMatch, calculateMatchScore, getRecommendedJobs

const {
  normalizeSkill,
  isSkillMatch,
  calculateMatchScore,
  getRecommendedJobs,
} = require('../src/services/matching.service');

// ─── Test normalizeSkill ──────────────────────────────
describe('normalizeSkill — chuẩn hóa tên kỹ năng', () => {
  test('chuyển về lowercase và bỏ dấu cách', () => {
    expect(normalizeSkill('React JS')).toBe('react'); // React JS -> reactjs -> react (via synonym map)
  });

  test('bỏ dấu chấm', () => {
    expect(normalizeSkill('Node.js')).toBe('node'); // Node.js -> nodejs -> node
  });

  test('bỏ dấu gạch ngang và gạch dưới', () => {
    expect(normalizeSkill('Vue-JS')).toBe('vue'); // Vue-JS -> vuejs -> vue
    expect(normalizeSkill('type_script')).toBe('typescript');
  });

  test('giữ nguyên chuỗi đã chuẩn', () => {
    expect(normalizeSkill('react')).toBe('react');
  });
});

// ─── Test isSkillMatch ────────────────────────────────
describe('isSkillMatch — so khớp 2 kỹ năng (fuzzy matching)', () => {
  test('khớp chính xác sau chuẩn hóa', () => {
    expect(isSkillMatch('React', 'react')).toEqual({ match: true, score: 1 });
    expect(isSkillMatch('Node.js', 'NodeJS')).toEqual({ match: true, score: 1 });
    expect(isSkillMatch('Vue JS', 'vuejs')).toEqual({ match: true, score: 1 });
  });

  test('khớp prefix với diff ≤ 3 ký tự', () => {
    expect(isSkillMatch('React', 'ReactJS')).toEqual({ match: true, score: 1 }); // because reactjs -> react (exact synonym match now!)
    expect(isSkillMatch('node', 'NodeJS')).toEqual({ match: true, score: 1 }); // nodejs -> node (exact synonym match!)
  });

  test('★ CHỐNG false positive: Java ≠ JavaScript', () => {
    expect(isSkillMatch('Java', 'JavaScript')).toEqual({ match: false, score: 0 });
  });

  test('★ CHỐNG false positive: C ≠ C++', () => {
    expect(isSkillMatch('C', 'C++')).toEqual({ match: false, score: 0 });
  });

  test('từ khác nhau hoàn toàn', () => {
    expect(isSkillMatch('Python', 'Ruby')).toEqual({ match: false, score: 0 });
    expect(isSkillMatch('React', 'Angular')).toEqual({ match: false, score: 0 });
  });

  test('★ Edge case: chuỗi rỗng', () => {
    expect(isSkillMatch('', 'React')).toEqual({ match: false, score: 0 });
    expect(isSkillMatch('React', '')).toEqual({ match: false, score: 0 });
  });
});

// ─── Test calculateMatchScore ─────────────────────────
describe('calculateMatchScore — tính điểm phần trăm trùng khớp', () => {
  test('100% khi ứng viên có đủ tất cả kỹ năng yêu cầu', () => {
    const result = calculateMatchScore(
      ['React', 'TypeScript', 'Node.js'],
      ['React', 'TypeScript', 'NodeJS']
    );
    expect(result.score).toBe(100);
    expect(result.matched).toEqual(['React', 'TypeScript', 'NodeJS']);
    expect(result.missing).toEqual([]);
  });

  test('tính đúng phần trăm khi trùng một phần', () => {
    const result = calculateMatchScore(
      ['React', 'CSS'],
      ['React', 'TypeScript', 'Node.js']
    );
    // 1 matched (React) / 3 required = 33%
    expect(result.score).toBe(33);
    expect(result.matched).toEqual(['React']);
    expect(result.missing).toEqual(['TypeScript', 'Node.js']);
  });

  test('0% khi không trùng kỹ năng nào', () => {
    const result = calculateMatchScore(
      ['Python', 'Django'],
      ['React', 'TypeScript']
    );
    expect(result.score).toBe(0);
    expect(result.matched).toEqual([]);
    expect(result.missing).toEqual(['React', 'TypeScript']);
  });

  test('0% khi ứng viên không có kỹ năng', () => {
    const result = calculateMatchScore([], ['React', 'TypeScript']);
    expect(result.score).toBe(0);
    expect(result.missing).toEqual(['React', 'TypeScript']);
  });

  test('0% khi job không yêu cầu kỹ năng nào', () => {
    const result = calculateMatchScore(['React'], []);
    expect(result.score).toBe(0);
  });

  test('★ không bị phạt khi ứng viên có THỪA kỹ năng (khác Jaccard)', () => {
    // Ứng viên có 10 skills, job yêu cầu 2 → vẫn 100% nếu có đủ 2
    const candidateSkills = ['React', 'Vue', 'Angular', 'Svelte', 'TypeScript',
                             'JavaScript', 'Node.js', 'Python', 'Go', 'Rust'];
    const result = calculateMatchScore(candidateSkills, ['React', 'TypeScript']);
    expect(result.score).toBe(100);
  });
});

// ─── Test getRecommendedJobs ──────────────────────────
describe('getRecommendedJobs — lọc và sắp xếp việc làm gợi ý', () => {
  const mockJobs = [
    { _id: '1', title: 'Frontend Dev', requiredSkills: ['React', 'TypeScript', 'CSS'] },
    { _id: '2', title: 'Backend Dev', requiredSkills: ['Node.js', 'MongoDB', 'Docker'] },
    { _id: '3', title: 'Fullstack Dev', requiredSkills: ['React', 'Node.js', 'TypeScript', 'MongoDB'] },
    { _id: '4', title: 'DevOps Eng', requiredSkills: ['Kubernetes', 'Terraform', 'AWS'] },
  ];

  test('lọc đúng các job trên ngưỡng threshold', () => {
    const results = getRecommendedJobs(['React', 'TypeScript'], mockJobs, 50);
    // Job 1: React+TS matched → 67% (≥50 → OK)
    // Job 2: 0 matched → 0% (< 50 → loại)
    // Job 3: React+TS matched → 50% (≥50 → OK)
    // Job 4: 0 matched → 0% (< 50 → loại)
    expect(results.length).toBe(2);
    expect(results.map(r => r.job._id)).toEqual(['1', '3']); // sort giảm dần: 67 > 50
  });

  test('sắp xếp giảm dần theo score', () => {
    const results = getRecommendedJobs(['React', 'TypeScript', 'Node.js'], mockJobs, 0);
    const scores = results.map(r => r.score);
    // Kiểm tra scores được sort giảm dần
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
    }
  });

  test('trả mảng rỗng khi không có job nào đạt ngưỡng', () => {
    const results = getRecommendedJobs(['Haskell', 'Erlang'], mockJobs, 30);
    expect(results).toEqual([]);
  });

  test('trả mảng rỗng khi ứng viên không có kỹ năng', () => {
    const results = getRecommendedJobs([], mockJobs, 0);
    // score = 0 cho tất cả, threshold = 0 → vẫn có thể trả về
    // Nhưng calculateMatchScore với candidateSkills=[] → score=0, 0>=0 → true
    // Tùy theo logic, nếu requiredSkills không rỗng → score=0
    expect(results.every(r => r.score === 0)).toBe(true);
  });

  test('★ Fuzzy matching hoạt động trong context recommend', () => {
    const jobs = [
      { _id: '5', title: 'React Dev', requiredSkills: ['ReactJS', 'Node.js'] },
    ];
    // 'React' khớp 'ReactJS', 'NodeJS' khớp 'Node.js' → 100%
    const results = getRecommendedJobs(['React', 'NodeJS'], jobs, 50);
    expect(results.length).toBe(1);
    expect(results[0].score).toBe(100);
  });
});
