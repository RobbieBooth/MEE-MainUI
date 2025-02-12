// app/utils/auth.server.ts
import {CodeChallengeMethod, OAuth2Strategy} from "remix-auth-oauth2";
import {Authenticator} from "remix-auth";
import {redirect} from "@remix-run/node";
import {sessionStorage} from "./session.server";
import {IUser} from "~/db/model/user";
import {createUser, getUserByEmail} from "~/db/userService";
import {generateJwt} from "~/token.server";
import {MicrosoftStrategy} from "remix-auth-microsoft";

export const authenticator = new Authenticator<OAuthUser>();
type JWT = string;
export type OAuthUser = {
    openId: string;
    name: string;
    email: string | null;
    avatar: {
        requestPictureWithAccessToken: boolean;
        avatarUrl: string;
    };
    accessToken: string;
    associatedDBUser: IUser | undefined;
    backendJWT: JWT | undefined;
};

if(!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET || !process.env.MICROSOFT_TENANT_ID){
    throw new Error("Oauth ClientID or Client secret not defined")
}


const microsoftStrategy = new MicrosoftStrategy(
    {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        tenantId: process.env.MICROSOFT_TENANT_ID, // optional - necessary for organization without multitenant (see below)
        redirectURI: "http://localhost:5173/auth/microsoft/callback",
        
        scopes: ["openid", "profile", "email","User.Read"], // optional
        prompt: "login", // optional
    },
    async ({ request, tokens }) => {
        // Here you can fetch the user from database or return a user object based on profile
        const accessToken = tokens.accessToken();
        const user = await getMicrosoftUser(accessToken, request);
        let userDB = await getUserByEmail(user.email!);
        if(userDB == null) {
            userDB = await createUser({
                email: user.email!,
                name: user.name,
                openId: user.openId,
            } as any);
        }
        user.associatedDBUser = userDB;
        user.backendJWT = generateJwt(userDB._id, userDB.roles);
        return user;

        // The returned object is stored in the session storage you are using by the authenticator

        // If you're using cookieSessionStorage, be aware that cookies have a size limit of 4kb

        // Retrieve or create user using id received from userinfo endpoint
        // https://graph.microsoft.com/oidc/userinfo

        // DO NOT USE EMAIL ADDRESS TO IDENTIFY USERS
        // The email address received from Microsoft Entra ID is not validated and can be changed to anything from Azure Portal.
        // If you use the email address to identify users and allow signing in from any tenant (`tenantId` is not set)
        // it opens up a possibility of spoofing users!

        // return User.findOrCreate({ id: profile.id });
    }
);
authenticator.use(microsoftStrategy);

async function getMicrosoftUser(accessToken: string, request: Request): Promise<OAuthUser> {
    const profile = await MicrosoftStrategy.userProfile(accessToken);

    const profileJSON = profile._json;

    return {
        backendJWT: undefined,
        associatedDBUser: undefined,
        openId: profileJSON.sub,
        name: profileJSON.given_name +" "+ profileJSON.family_name,
        email: profileJSON.email, // GitHub may return null if email is private
        avatar: {
            requestPictureWithAccessToken: true,
            avatarUrl: "https://graph.microsoft.com/v1.0/me/photo/$value"
        },
        accessToken:"accessToken"
    };
}

if(!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET){
    throw new Error("Oauth ClientID or Client secret not defined")
}

authenticator.use(
    new OAuth2Strategy(
        {
            cookie: "oauth2", // Optional, can also be an object with more options

            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,

            authorizationEndpoint: "https://github.com/login/oauth/authorize",
            tokenEndpoint: "https://github.com/login/oauth/access_token",
            redirectURI: "http://localhost:5173/auth/github/callback",
            scopes: ["openid", "user:email", "profile"], // optional
            codeChallengeMethod: CodeChallengeMethod.S256, // optional
        },
        async ({ tokens, request }) => {

            const user = await getGithubUser(tokens.accessToken(), request);
            let userDB = await getUserByEmail(user.email!);
            if(userDB == null) {
                userDB = await createUser({
                    email: user.email!,
                    name: user.name,
                    openId: user.openId,
                } as any);
            }
            user.associatedDBUser = userDB;
            user.backendJWT = generateJwt(userDB._id, userDB.roles);
            return user;
        }
    ),

    "github"
);


async function getGithubUser(accessToken: string, request: Request): Promise<OAuthUser> {
    const response = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user profile from GitHub");
    }

    const profile = await response.json();
    // Fetch the user's emails
    const emailResponse = await fetch("https://api.github.com/user/emails", {
        method: "GET",
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${accessToken}`,
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });
    if (!emailResponse.ok) {
        throw new Error(`Error: ${emailResponse.status} ${emailResponse.statusText}`);
    }

    const emails = await emailResponse.json();
    const primaryEmail = emails.find((email: { primary: boolean }) => email.primary);

    if (primaryEmail) {
        console.log("Primary Email:", primaryEmail.email);
    } else {
        console.log("No primary email found.");
    }

    return {
        backendJWT: undefined,
        associatedDBUser: undefined,
        openId: profile.id.toString(),
        name: profile.name || profile.login,
        email: primaryEmail.email, // GitHub may return null if email is private
        avatar: {
            requestPictureWithAccessToken: false,
            avatarUrl: profile.avatar_url
        },
        accessToken:"accessToken"
    };
}

export async function authenticate(request: Request, returnTo?: string):Promise<OAuthUser> {
    const session = await sessionStorage.getSession(request.headers.get("cookie"));
    const user = session.get("user");
    console.log("user", user);
    console.log(returnTo);
    if (user) return user;
    if (returnTo) session.set("returnTo", returnTo);
    throw redirect("/login", {
        headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
}
