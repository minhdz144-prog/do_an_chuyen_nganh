const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const IT_SKILLS = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust', 'TypeScript',
  'React', 'Angular', 'Vue', 'Next.js', 'Nuxt.js', 'Svelte', 'HTML', 'CSS', 'Tailwind', 'Bootstrap',
  'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'ASP.NET',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra', 'Oracle',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab', 'CI/CD',
  'Machine Learning', 'Data Science', 'AI', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision',
  'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence',
  'Figma', 'Sketch', 'Adobe XD', 'UI/UX',
  'Linux', 'Bash', 'Shell', 'Nginx', 'Apache'
];

/**
 * Parses text and extracts IT skills
 * @param {string} text - The raw text
 * @returns {string[]} - Array of matched skills
 */
const extractSkillsFromText = (text) => {
  const normalizedText = text.replace(/\s+/g, ' ');
  const matchedSkills = new Set();
  
  IT_SKILLS.forEach(skill => {
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    
    if (regex.test(normalizedText)) {
      matchedSkills.add(skill);
    }
  });
  
  return Array.from(matchedSkills);
};

/**
 * Parses PDF buffer and extracts IT skills
 */
const extractSkillsFromPDF = async (dataBuffer) => {
  try {
    const data = await pdfParse(dataBuffer);
    return extractSkillsFromText(data.text);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return [];
  }
};

/**
 * Parses Docx buffer and extracts IT skills
 */
const extractSkillsFromDocx = async (dataBuffer) => {
  try {
    const data = await mammoth.extractRawText({ buffer: dataBuffer });
    return extractSkillsFromText(data.value);
  } catch (error) {
    console.error('Error parsing Docx:', error);
    return [];
  }
};

module.exports = {
  extractSkillsFromPDF,
  extractSkillsFromDocx,
  extractSkillsFromText,
  IT_SKILLS
};
