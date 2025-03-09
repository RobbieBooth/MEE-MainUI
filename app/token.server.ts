import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET as string;

export function generateJwt(uuid: string, role: string[]) {
    return jwt.sign({ uuid, role }, SECRET_KEY, { expiresIn: "7d" });
}

export function generateThrowAwayJwt(uuid: string, role: string[]) {
    return jwt.sign({ uuid, role }, SECRET_KEY, { expiresIn: "5m" });
}
