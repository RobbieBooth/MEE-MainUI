import {AppSidebar, sidebarItem} from "~/components/dashboard/appSidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "~/components/ui/sidebar"
import { LoaderFunction } from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import { useLoaderData } from "@remix-run/react";
import {IUser} from "~/db/model/user";
import {BookOpen, Bot, Settings2, SquareTerminal, GraduationCap, LayoutDashboard} from "lucide-react";

import {ReactNode, useEffect, useState} from "react";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "~/components/ui/resizable";
import {Class, getClassFromBackend} from "~/routes/class.$classUUID._index";
import {ClassTable} from "~/components/classes/classTable";

export async function getClassesFromBackend(user: OAuthUser) {
    const response = await fetch("http://localhost:8080/v1/api/class/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.backendJWT}`
        },
    });

    if (!response.ok) {
        throw new Response("Failed to fetch class data", {status: response.status});
    }
    const jsonResponse = await response.json()
    const classesData: Class[] = jsonResponse;

    return classesData;
}

export const loader: LoaderFunction = async ({ request }):Promise<{user:OAuthUser, classes: Class[]}> => {
    const user = await authenticate(request, "/dashboard");
    // use the user data here

    //Fetch the class data from backend API
    const classes = await getClassesFromBackend(user);

    return { user, classes };
};

export default function Dashboard() {
    const { user, classes } = useLoaderData<typeof loader>() as {user: OAuthUser, classes: Class[]};

    return (
        <MySidebar user={user}>
            <ResizablePanelGroup
                direction="vertical"
                className="h-screen w-full rounded-lg border"
            >
                <ResizablePanel defaultSize={15}>
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={50}>
                            <div className="flex h-full items-center justify-center p-6">
                                <span className="font-semibold">One</span>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={50}>
                            <div className="flex h-full items-center justify-center p-6">
                                <span className="font-semibold">Two</span>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>
                    <div className="flex h-full items-center justify-center p-6">
                        <ClassTable user={user} classes={classes}/>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>

        </MySidebar>
    )
}

type UserRoles = "STUDENT" | "EDUCATOR"; // Replace with actual roles if available

// ClassInfo interface
interface ClassInfo {
    classUUID: string; // UUID as a string
    className: string;
    userRole: UserRoles;
}

// User interface
interface User {
    id: string; // UUID as a string
    classes: ClassInfo[];
}

type SidebarProps = {
    children: ReactNode;
    user: OAuthUser; // Replace with proper user type
    // sidebarItems: sidebarItem[]; // Replace with proper sidebar items type
};



export function MySidebar({ children, user }:SidebarProps) {
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarItems,setSidebarItems] = useState<sidebarItem[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8080/v1/api/user/${user.associatedDBUser?._id}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${user.backendJWT}` // Pass the access token here
                        },
                    });
                if (!response.ok) {
                    throw new Error(`Error fetching user: ${response.statusText}`);
                }
                const data: User = await response.json();
                setUserData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [user.associatedDBUser]);

    useEffect(() => {
        if(userData == null){
            return;
        }


        const newSidebarItems:sidebarItem[] = userData.classes.map((classInfo) =>{
            const classURL = `/class/${classInfo.classUUID}`;

            const gradeSidebar:sidebarItem ={
                title: "Grades",
                url: classURL+"/grade/"
            }
            const quizSidebar:sidebarItem ={
                title: "Quizzes",
                url: classURL+"/quiz/"
            }

            const side: sidebarItem = {
                title: classInfo.className,
                url: classURL,
                isActive: false,
                children: [
                    gradeSidebar,
                    quizSidebar
                ],
            };
            return side;
        });
        const dashboardSidebarItem:sidebarItem = {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard
        };
        const classSidebar:sidebarItem = {
            title: "Classes",
            url: "/class",
            children:newSidebarItems,
            isActive: true,
            icon: GraduationCap
        };


        setSidebarItems([dashboardSidebarItem, classSidebar]);
        //Update links for classes
    }, [userData]);


    return (
        <SidebarProvider>
            <AppSidebar user={user} sidebarItems={sidebarItems} />
            <SidebarInset>
                <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1"/>
                    <Separator orientation="vertical" className="mr-2 h-4"/>
                    {/*<Breadcrumb>*/}
                    {/*    <BreadcrumbList>*/}
                    {/*        <BreadcrumbItem className="hidden md:block">*/}
                    {/*            <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>*/}
                    {/*        </BreadcrumbItem>*/}
                    {/*        /!*<BreadcrumbSeparator className="hidden md:block"/>*!/*/}
                    {/*        /!*<BreadcrumbItem>*!/*/}
                    {/*        /!*    <BreadcrumbPage>Data Fetching</BreadcrumbPage>*!/*/}
                    {/*        /!*</BreadcrumbItem>*!/*/}
                    {/*    </BreadcrumbList>*/}
                    {/*</Breadcrumb>*/}
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}