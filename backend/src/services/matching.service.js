// src/services/matching.service.js
const SYNONYM_MAP = {
  'js': 'javascript', 'ts': 'typescript', 'py': 'python',
  'k8s': 'kubernetes', 'tf': 'terraform', 'gql': 'graphql',
  'reactjs': 'react', 'vuejs': 'vue', 'nodejs': 'node',
  'dotnet': '.net', 'mssql': 'sqlserver', 'pg': 'postgresql',
  'mongo': 'mongodb', 'redis': 'redis', 'es': 'elasticsearch',
  'ci/cd': 'cicd', 'ml': 'machinelearning', 'dl': 'deeplearning',
  'oop': 'objectoriented', 'restapi': 'rest', 'aws': 'amazonaws',
  'amazonwebservices': 'amazonaws',
  'gcp': 'googlecloud', 'az': 'azure',
};

const normalizeSkill = (skill) => {
  const normalized = skill.toLowerCase().replace(/[\s\.\-\_\/]/g, '');
  return SYNONYM_MAP[normalized] || normalized;
};

const isSkillMatch = (candidateSkill, requiredSkill) => {
  const c = normalizeSkill(candidateSkill);
  const r = normalizeSkill(requiredSkill);
  if (c === r) return { match: true, score: 1.0 }; // Exact or Synonym match
  
  const shorter = c.length <= r.length ? c : r;
  const longer  = c.length <= r.length ? r : c;
  
  const isPrefix = shorter.length >= 3 && longer.startsWith(shorter) && (longer.length - shorter.length <= 3);
  if (isPrefix) return { match: true, score: 0.5 }; // Partial match
  
  return { match: false, score: 0 };
};

const calculateMatchScore = (candidateSkills = [], requiredSkills = []) => {
  if (!requiredSkills.length) return { score: 0, matched: [], missing: [] };
  if (!candidateSkills.length) return { score: 0, matched: [], missing: [...requiredSkills] };
  
  const matched = [];
  const missing = [];
  let totalScore = 0;
  
  for (const reqSkill of requiredSkills) {
    let bestScore = 0;
    for (const cSkill of candidateSkills) {
      const { match, score } = isSkillMatch(cSkill, reqSkill);
      if (match && score > bestScore) bestScore = score;
    }
    
    if (bestScore > 0) {
      matched.push(reqSkill);
      totalScore += bestScore;
    } else {
      missing.push(reqSkill);
    }
  }
  
  const finalScore = Math.round((totalScore / requiredSkills.length) * 100);
  return { score: finalScore, matched, missing };
};

const getRecommendedJobs = (candidateSkills, jobs, threshold = 30) =>
  jobs
    .map((job) => ({
      job,
      ...calculateMatchScore(candidateSkills, job.requiredSkills || job.skills || []),
    }))
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score);

const rankCandidatesForJob = (requiredSkills, candidates) =>
  candidates
    .map((candidate) => ({
      candidate,
      ...calculateMatchScore(candidate.candidateProfile?.skills || [], requiredSkills),
    }))
    .sort((a, b) => b.score - a.score);

module.exports = {
  normalizeSkill, isSkillMatch, calculateMatchScore, getRecommendedJobs, rankCandidatesForJob,
};