export type User = {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  bio?: string;
  facebookId?: string;
  linkedinId?: string;
  twitterId?: string;
  imageURL?: string;
  imageFileName?: string;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
};
