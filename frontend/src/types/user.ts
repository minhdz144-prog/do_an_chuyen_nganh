export interface CandidateProfile {
  skills?: string[];
  yearsOfExperience?: number;
  location?: string;
  bio?: string;
  educationLevel?: string;
  resumeUrl?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'candidate' | 'employer' | 'admin';
  avatar?: string;
  phone?: string;
  companyId?: string;
  candidateProfile?: CandidateProfile;
  savedJobs?: string[];
  createdAt: string;
  updatedAt: string;
}
