export type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  bio?: string;
  facebookId?: string;
  linkedinId?: string;
  twitterId?: string;
  websiteUrl?: string;
  expertiseTopics?: string[];
  imageURL?: string;
  imageFileName?: string;
  createdAt?: string;
  updatedAt?: string;
};
