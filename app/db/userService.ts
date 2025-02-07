import User, { IUser } from "~/db/model/user";
import connectDB from "./connect";

/**
 * Get a user by email
 * @param email User's email
 * @returns IUser object or null
 */
export const getUserByEmail = async (email: string): Promise<IUser | null> => {
    await connectDB();
    return User.findOne({ email }).exec();
};

/**
 * Get a user by user ID
 * @param userid User's unique ID
 * @returns IUser object or null
 */
export const getUserById = async (userid: string): Promise<IUser | null> => {
    await connectDB();
    return User.findOne({ _id: userid }).exec();
};

/**
 * Create a new user
 * @param userData User details (email, userid, name, roles)
 * @returns Created IUser object
 */
export const createUser = async (userData: IUser): Promise<IUser> => {
    await connectDB();
    const newUser = new User(userData);
    return newUser.save();
};