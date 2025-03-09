import { LoaderFunction, redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { sessionStorage } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
    const user = await authenticator.authenticate("microsoft", request);

    const session = await sessionStorage.getSession(request.headers.get("cookie"));
    session.set("user", user);

    if (!user) {
        throw redirect("/login");
    }

    const setCookie = await sessionStorage.commitSession(session);
    console.log("Set-Cookie Header:", setCookie); // Debugging

    return redirect("/dashboard", {
        headers: {
            "Set-Cookie": setCookie,
        },
    });
};
