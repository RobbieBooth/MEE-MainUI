import { LoaderFunction, redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/session.server";

export let loader: LoaderFunction = async ({ request }) => {
    const session = await getSession(request.headers.get("Cookie"));
    return redirect("/login", {
        headers: {
            "Set-Cookie": await destroySession(session),
        },
    });
};
