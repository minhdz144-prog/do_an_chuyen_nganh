// src/services/matching.service.js
const normalizeSkill = (skill) => skill.toLowerCase().replace(/[\s\.\-\_]/g, '');

const isSkillMatch = (candidateSkill, requiredSkill) => {
  const c = normalizeSkill(candidateSkill);
  const r = normalizeSkill(requiredSkill);
  if (c === r) return true;
  const shorter = c.length <= r.length ? c : r;
  const longer  = c.length <= r.length ? r : c;
  return (
    shorter.length >= 3 &&
    longer.startsWith(shorter) &&
    longer.length - shorter.length <= 3
  );
};

const calculateMatchScore = (candidateSkills = [], requiredSkills = []) => {
  if (!requiredSkills.length) return { score: 0, matched: [], missing: [] };
  if (!candidateSkills.length) return { score: 0, matched: [], missing: [...requiredSkills] };
  const matched = [];
  const missing = [];
  for (const reqSkill of requiredSkills) {
    const found = candidateSkills.some((cSkill) => isSkillMatch(cSkill, reqSkill));
    found ? matched.push(reqSkill) : missing.push(reqSkill);
  }
  const score = Math.round((matched.length / requiredSkills.length) * 100);
  return { score, matched, missing };
};

const getRecommendedJobs = (candidateSkills, jobs, threshold = 30) =>
  jobs
    .map((job) => ({
      job,
      ...calculateMatchScore(candidateSkills, job.requiredSkills),
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