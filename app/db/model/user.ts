import mongoose from "mongoose";
import {v4 as uuidv4} from "uuid";

export interface IUser extends mongoose.Document {
    _id: string; // Use UUID string for _id
    email: string;
    name: string;
    roles: ("USER" | "EDUCATOR" | "MANAGER")[];
    openId: string;
}

const userSchema = new mongoose.Schema<IUser>({
    _id: {
        type: String,
        default: () => uuidv4(), // Generate UUIDs for new users
    },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    roles: {
        type: [String],
        enum: [ "USER", "EDUCATOR" , "MANAGER"],
        default: ["USER"],
    },
    openId: { type: String, unique: true },
});

// const User = mongoose.models.User || mongoose.model<IUser>("user_metadata", userSchema);
export const User = mongoose.models["user_metadata"] || mongoose.model<IUser>("user_metadata", userSchema);

// // User table schema
// export interface IAnonymousUser extends mongoose.Document {
//     _id: string; // Matches the _id from user_metadata
// }
//
// const anonymousUserSchema = new mongoose.Schema<IAnonymousUser>({
//     _id: {
//         type: String,
//         required: true, // Ensure it's tied to user_metadata
//     },
// });
//
// export const AnonymousUser = mongoose.models["users"] || mongoose.model<IAnonymousUser>("users", anonymousUserSchema);


// export default {User, AnonymousUser};