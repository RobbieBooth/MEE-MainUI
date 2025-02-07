import { LoaderFunction } from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import { useLoaderData } from "@remix-run/react";
import {IUser} from "~/db/model/user";

export const loader: LoaderFunction = async ({ request }):Promise<{user:OAuthUser}> => {
    const user = await authenticate(request, "/dashboard");
    // use the user data here

    return { user };
};

export default function Dashboard() {
    const { user } = useLoaderData<typeof loader>() as {user: OAuthUser};

    return (
        <div>
            <h1>Welcome, {user.email}</h1>
            <p>Your UUID: {user.openId}</p>
            <p>Your Name: {user.name}</p>
            <p>Your Db Roles: {user.associatedDBUser?.roles}</p>
            {/*<p>Your Roles: {user.roles.join(", ")}</p>*/}
            <a href="/logout">Logout</a>
        </div>
    );
}
