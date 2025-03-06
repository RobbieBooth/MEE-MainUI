import {LoaderFunction} from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import {useLoaderData} from "@remix-run/react";
import {sidebarItem} from "~/components/dashboard/appSidebar";
import {BookOpen, Bot, Settings2, SquareTerminal} from "lucide-react";
import {getClassesFromBackend, MySidebar} from "~/routes/dashboard";
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
import {Class} from "~/routes/class.$classUUID._index";

export const loader: LoaderFunction = async ({ request }):Promise<{user:OAuthUser, classes: Class[]}> => {
    const user = await authenticate(request, "/class");
    // use the user data here
    //Fetch the class data from backend API
    const classes = await getClassesFromBackend(user);

    return { user, classes };
};

export default function Dashboard() {
    const { user, classes } = useLoaderData<typeof loader>() as {user: OAuthUser, classes: Class[]};

    return (
        <MySidebar user={user}>
            <div className="p-2">
                <ClassForm userEmail={user.email!} classFormFields={{className:"", classDescription: "", classEducatorEmails: [], classStudentEmails:[]}} createOrEdit={"Create"}/>
                <ClassTable classes={classes} user={user}/>
            </div>
        </MySidebar>
    )
}
