
// Finally, we need to export a loader function to check if the user is already
// authenticated and redirect them to the dashboard
import {LoaderFunctionArgs, redirect} from "@remix-run/node";
import {Route} from "react-router";
import {sessionStorage} from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await sessionStorage.getSession(request.headers.get("cookie"));
    const user = session.get("user");
    console.log(user);
    if (user) throw redirect("/dashboard");
    return null;
}

export default function Login() {
    return (
        <div>
            <h1>Login</h1>
            <a href="/auth/github/">Login with GitHub</a>
            <a href="/auth/microsoft/">Login with Microsoft</a>
        </div>
    );
}
