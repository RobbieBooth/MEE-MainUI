import {AppSidebar, sidebarItem} from "~/components/dashboard/appSidebar2"
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
import {BookOpen, Bot, Settings2, SquareTerminal, GraduationCap} from "lucide-react";

import {ReactNode, useEffect, useState} from "react";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "~/components/ui/resizable";

export const loader: LoaderFunction = async ({ request }):Promise<{user:OAuthUser}> => {
    const user = await authenticate(request, "/dashboard");
    // use the user data here

    return { user };
};

export default function Dashboard() {
    const { user } = useLoaderData<typeof loader>() as {user: OAuthUser};

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
                        <span className="font-semibold">Three</span>
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
        const classSidebar:sidebarItem = {
            title: "Classes",
            url: "/class",
            children:newSidebarItems,
            isActive: true,
            icon: GraduationCap
        }


        setSidebarItems([classSidebar]);
        //Update links for classes
    }, [userData]);


    return (
        <SidebarProvider>
            <AppSidebar user={user} sidebarItems={sidebarItems} />
            <SidebarInset>
                <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1"/>
                    <Separator orientation="vertical" className="mr-2 h-4"/>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block"/>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                {/*<div className="p-4">*/}
                {/*    {loading && <p>Loading user data...</p>}*/}
                {/*    {error && <p className="text-red-500">Error: {error}</p>}*/}
                {/*    {userData && (*/}
                {/*        <div>*/}
                {/*            <h1 className="text-xl font-bold">User Info</h1>*/}
                {/*            <p>ID: {userData.id}</p>*/}
                {/*            <p>Class: {userData.classes.length}</p>*/}
                {/*        </div>*/}
                {/*    )}*/}
                {/*</div>*/}
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}