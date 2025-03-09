
// Finally, we need to export a loader function to check if the user is already
// authenticated and redirect them to the dashboard
import {LoaderFunctionArgs, redirect} from "@remix-run/node";
import {Route} from "react-router";
import {sessionStorage} from "~/session.server";
import {GalleryVerticalEnd} from "lucide-react";
import {LoginForm} from "~/components/login/loginForm";

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await sessionStorage.getSession(request.headers.get("cookie"));
    const user = session.get("user");
    console.log(user);
    if (user) throw redirect("/dashboard");
    return null;
}

export default function Login() {
    // return (
    //     <div>
    //         <h1>Login</h1>
    //         <a href="/auth/github/">Login with GitHub</a>
    //         <a href="/auth/microsoft/">Login with Microsoft</a>
    //     </div>
    // );
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <GalleryVerticalEnd className="size-4"/>
                    </div>
                    ME Environment.
                </a>
                <LoginForm/>
            </div>
        </div>
    )
}
