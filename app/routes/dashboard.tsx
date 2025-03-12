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
import {ClassTable, updateClassHolder} from "~/components/classes/classTable";
import {Button} from "~/components/ui/button";
import {useNavigate} from "react-router";
import {ClassForm} from "~/components/classes/creation/classCreation";
import {ScrollArea} from "~/components/ui/scroll-area";

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
    const navigator = useNavigate();

    const [classesHolder, setClassesHolder] = useState<Class[]>(classes);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        setClassesHolder(classes);
    }, [classes]);

    return (
        <MySidebar user={user} refreshKey={refreshKey}>
            <ResizablePanelGroup
                direction="vertical"
                className="h-screen w-full rounded-lg border"
            >
                <ResizablePanel defaultSize={15}>
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={50}>
                            <div className="flex h-full items-center justify-center p-6">
                                <h2 className="mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                                    Welcome back!
                                </h2>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle/>
                        <ResizablePanel defaultSize={50}>
                            <div className="flex h-full items-center justify-center p-6">
                                <Button onClick={()=> navigator("/class")}>View My Classes</Button>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>
                    <div className="pt-4 pl-4">

                    </div>
                    <ScrollArea className="flex h-full w-full items-center justify-center p-6">
                        <div className="block w-full h-full">
                            <div className="pb-4">
                                <ClassForm userEmail={user.email!} classFormFields={{className:"", classDescription: "", classEducatorEmails: [], classStudentEmails:[]}} createOrEdit={"Create"} updateOrEditClass={updatedClass => {
                                    updateClassHolder(classesHolder, updatedClass, setClassesHolder);
                                    triggerSidebarRefresh(setRefreshKey);
                                }}/>
                            </div>
                            <ClassTable user={user} classes={classesHolder} triggerRefresh={() => triggerSidebarRefresh(setRefreshKey)}/>
                        </div>
                    </ScrollArea>
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
    currentClassID?: string; //Optional string to open the classes properties if it's the current class
    refreshKey?: number;//Used to refresh the side bar if class is added or updated etc - however is not required unless you are wanting to refresh the sidebar
    // sidebarItems: sidebarItem[]; // Replace with proper sidebar items type
};



export function MySidebar({ children, user, currentClassID, refreshKey}:SidebarProps) {
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
    }, [user.associatedDBUser, refreshKey]);

    useEffect(() => {
        if(userData == null){
            return;
        }


        const newSidebarItems:sidebarItem[] = userData.classes.map((classInfo) =>{
            const classURL = `/class/${classInfo.classUUID}`;

            const gradeSidebar:sidebarItem ={
                title: "My Attempts",
                url: classURL+"/grade/"
            }
            const quizSidebar:sidebarItem ={
                title: "Quizzes",
                url: classURL+"/quiz/"
            }

            const side: sidebarItem = {
                title: classInfo.className,
                url: classURL,
                isActive: currentClassID != undefined && classInfo.classUUID === currentClassID,
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

export const triggerSidebarRefresh = (setRefreshKey: (value: React.SetStateAction<number>) => void) => {
    setRefreshKey((prev) => prev + 1);
};