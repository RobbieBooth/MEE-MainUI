import { IUser, User } from "~/db/model/user";
import connectDB from "./connect";
import {generateThrowAwayJwt} from "~/token.server";

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
export const createUser = async (userData: IUser, accessJWT?:string): Promise<IUser> => {
    await connectDB();
    const newUser = new User(userData);
    const savedUser = await newUser.save();

    //Needed to solve a very very annoying bug where string != UUID!
    if(accessJWT == undefined){
        accessJWT = generateThrowAwayJwt(savedUser.id, savedUser.roles);
    }
    await addAnonymousUserBackend(savedUser.id, accessJWT);

    return savedUser; // Return the saved metadata entry
};

const addAnonymousUserBackend = async (userUUID: string, accessJWT: string): Promise<string> => {
    try {
        const response = await fetch(`http://localhost:8080/v1/api/user/${userUUID}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessJWT}` // Pass the access token here
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to add user. Status: ${response.status}, Message: ${response.statusText}`);
        }

        const data: {id:string} = await response.json();
        return data.id;
    } catch (error) {
        console.error("Error adding user:", error);
        throw error;
    }
};

/**
 * Fetch users by a list of emails
 * @param emails Array of email addresses
 * @returns Array of IUser objects
 */
export const getUsersByEmails = async (emails: string[]): Promise<IUser[]> => {
    await connectDB(); // Ensure the database is connected
    return User.find({ email: { $in: emails } }).exec();
};

/**
 * Fetch existing users by email and create missing ones
 * @param emails Array of email addresses
 * @returns Array of IUser objects
 */
export const getOrCreateUsersByEmails = async (emails: string[], accessJWT: string): Promise<IUser[]> => {
    await connectDB();

    // Fetch existing users
    const existingUsers = await User.find({ email: { $in: emails } }).exec();

    // Find emails that are missing
    const existingEmails = existingUsers.map(user => user.email);
    const missingEmails = emails.filter(email => !existingEmails.includes(email));

    // Create users for missing emails
    const newUsers = await User.insertMany(
        missingEmails.map(email => ({ email }))
    );
    const newUsersIds = newUsers.map((user)=> user.id);
    if(newUsersIds.length > 0) {
        await addManyAnonymousUsersBackend(newUsersIds, accessJWT);
    }


    // Combine existing and new users
    return [...existingUsers, ...newUsers];
};

/**
 * Function to fetch multiple users and map UUID to name and email
  */
export async function getUsersDetailsByIds(userIds: string[]): Promise<Map<string, { email: string; name: string }>> {
    await connectDB();
    try {
        // Query for users whose _id is in the list
        const users = await User.find({ _id: { $in: userIds } }, "email name").exec();

        // Convert to a Map of UUID to { email, name }
        const userMap = new Map<string, { email: string; name: string }>();
        for (const user of users) {
            userMap.set(user._id, { email: user.email, name: user.name });
        }

        return userMap;
    } catch (error) {
        console.error("Error fetching users by IDs:", error);
        throw error;
    }
}

const addManyAnonymousUsersBackend = async (userUUIDs: string[], accessJWT: string): Promise<string> => {
    try {
        const response = await fetch("http://localhost:8080/v1/api/user/createmany", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessJWT}` // Pass the access token here
            },
            body:JSON.stringify(userUUIDs)
        });

        if (!response.ok) {
            throw new Error(`Failed to add user. Status: ${response.status}, Message: ${response.statusText}`);
        }

        const data: {id:string} = await response.json();
        return data.id;
    } catch (error) {
        console.error("Error adding user:", error);
        throw error;
    }
};