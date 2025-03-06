import {LoaderFunction} from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import {useLoaderData} from "@remix-run/react";
import {sidebarItem} from "~/components/dashboard/appSidebar2";
import {BookOpen, Bot, Settings2, SquareTerminal} from "lucide-react";
import {MySidebar} from "~/routes/dashboard";
import {Button} from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "~/components/ui/dialog";
import {Label} from "~/components/ui/label";
import {Input} from "~/components/ui/input";
import {ClassForm} from "~/components/classes/creation/classCreation";
import {ClassTable} from "~/components/classes/classTable";

export const loader: LoaderFunction = async ({ request }):Promise<{user:OAuthUser}> => {
    const user = await authenticate(request, "/class");
    // use the user data here

    return { user };
};

export default function Dashboard() {
    const { user } = useLoaderData<typeof loader>() as {user: OAuthUser};

    return (
        <MySidebar user={user}>
            <div>
                <ClassForm userEmail={user.email!} classFormFields={{className:"", classDescription: "", classEducatorEmails: [], classStudentEmails:[]}} createOrEdit={"Create"}/>
                {/*<ClassTable classes={}/>*/}
            </div>
        </MySidebar>
    )
}
