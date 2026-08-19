import { signIn, signUp, type SignUpInput } from "../actions/auth";
import {
  deleteUsersByIds,
  getAllUsers as getAllUsersAction,
  getCuratedUsers,
  getLatestUsers as getLatestUsersAction,
  getUserById as getUserByIdAction,
  updateProfile,
  updateUserById as updateUserByIdAction,
  type ProfileInput,
} from "../actions/users";

export const signInUser = signIn;
export const getAllUsers = getAllUsersAction;
export const getLatestUsers = getLatestUsersAction;
export const getUserById = getUserByIdAction;
export const getCuratedUserList = getCuratedUsers;

export function createUser(userData: SignUpInput) {
  return signUp(userData);
}

export function updateUser(updatedUserData: ProfileInput) {
  return updateProfile(updatedUserData);
}

export function updateUserById(updatedUserData: {
  userId: string;
  values: ProfileInput;
}) {
  return updateUserByIdAction(updatedUserData);
}

export function deleteMultipleUsersById(userId: string[]) {
  return deleteUsersByIds(userId);
}
