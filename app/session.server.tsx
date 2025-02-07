import { createThemeSessionResolver } from "remix-themes"
import {createCookieSessionStorage} from "@remix-run/node";

// You can default to 'development' if process.env.NODE_ENV is not set
const isProduction = process.env.NODE_ENV === "production"

const themeSessionStorage = createCookieSessionStorage({
    cookie: {
        name: "theme",
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secrets: ["s3cr3t"],
        // Set domain and secure only if in production
        ...(isProduction
            ? { domain: "robbiebooth.com", secure: true }
            : {}),
    },
});
export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "_session", // use any name you want here
        sameSite: "lax", // Required for sending cookies over third party sign in
        maxAge: 60 * 60 * 24 * 7, // Expire after a week so that we can make new jwt
        path: "/", // remember to add this so the cookie will work in all routes
        httpOnly: true, // for security reasons, make this cookie http only
        secrets: ["s3cr3t"], // replace this with an actual secret
        secure: process.env.NODE_ENV === "production", // enable this in prod only
    },
});

export const themeSessionResolver = createThemeSessionResolver(themeSessionStorage);

// Helper functions for authentication
export const { getSession, commitSession, destroySession } = sessionStorage;
