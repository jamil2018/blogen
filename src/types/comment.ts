import type { User } from "./user";

export type Comment = {
  id: string;
  text: string;
  author: User | string;
  createdAt?: string;
  updatedAt?: string;
};
