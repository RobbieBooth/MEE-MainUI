import { LoaderFunction, redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { sessionStorage } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
    const user = await authenticator.authenticate("microsoft", request);
    console.log("Authenticated user:", user); // Debugging

    const session = await sessionStorage.getSession(request.headers.get("cookie"));
    session.set("user", user);

    return redirect("/dashboard", {
        headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
        },
    });
};
