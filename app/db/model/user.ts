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
    name: { type: String, required: true },
    roles: {
        type: [String],
        enum: [ "USER", "EDUCATOR" , "MANAGER"],
        default: ["USER"],
    },
    openId: { type: String, required: true, unique: true },
});

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;