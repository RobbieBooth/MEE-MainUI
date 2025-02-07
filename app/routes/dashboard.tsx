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
import {BookOpen, Bot, Settings2, SquareTerminal} from "lucide-react";

export const loader: LoaderFunction = async ({ request }):Promise<{user:OAuthUser}> => {
    const user = await authenticate(request, "/dashboard");
    // use the user data here

    return { user };
};

export default function Dashboard() {
    const { user } = useLoaderData<typeof loader>() as {user: OAuthUser};

    // return (
    //     <div>
    //         <h1>Welcome, {user.email}</h1>
    //         <p>Your UUID: {user.openId}</p>
    //         <p>Your Name: {user.name}</p>
    //         <p>Your Db Roles: {user.associatedDBUser?.roles}</p>
    //         {/*<p>Your Roles: {user.roles.join(", ")}</p>*/}
    //         <a href="/logout">Logout</a>
    //     </div>
    // );
    const sidebarItems:sidebarItem[] = [
            {
                title: "Playground",
                url: "#",
                icon: SquareTerminal,
                isActive: true,
                children: [
                    {
                        title: "History",
                        url: "#",
                    },
                    {
                        title: "Starred",
                        url: "#",
                    },
                    {
                        title: "Settings",
                        url: "#",
                    },
                ],
            },
            {
                title: "Models",
                url: "#",
                icon: Bot,
                children: [
                    {
                        title: "Genesis",
                        url: "#",
                    },
                    {
                        title: "Explorer",
                        url: "#",
                    },
                    {
                        title: "Quantum",
                        url: "#",
                    },
                ],
            },
            {
                title: "Documentation",
                url: "#",
                icon: BookOpen,
                children: [
                ],
            },
            {
                title: "Settings",
                url: "#",
                icon: Settings2,
                children: [
                    {
                        title: "General",
                        url: "#",
                    },
                    {
                        title: "Documentation",
                        url: "#",
                        icon: BookOpen,
                        children: [
                            {
                                title: "Introduction",
                                url: "#",
                            },
                            {
                                title: "Get Started",
                                url: "#",
                            },
                            {
                                title: "Tutorials",
                                url: "#",
                            },
                            {
                                title: "Changelog",
                                url: "#",
                            },
                        ],
                    },
                    {
                        title: "Billing",
                        url: "#",
                    },
                    {
                        title: "Limits",
                        url: "#",
                    },
                ],
            },
        ];
    return (
        <SidebarProvider>
            <AppSidebar   user={user} sidebarItems={sidebarItems}/>
            <SidebarInset>
                <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                    Building Your Application
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div
                            key={index}
                            className="aspect-video h-24 w-full rounded-lg bg-muted/50"
                        />
                    ))}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
