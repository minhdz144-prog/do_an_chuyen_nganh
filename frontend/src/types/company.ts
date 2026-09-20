export interface SocialLinks {
  linkedin?: string;
  facebook?: string;
  github?: string;
}

export interface Company {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  location?: string;
  size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  employeeCount?: number;
  foundedYear?: number;
  techStack?: string[];
  benefits?: string[];
  coverImage?: string;
  socialLinks?: SocialLinks;
  industry?: string;
  ownerId: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
