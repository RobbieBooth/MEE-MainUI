"use client"

import * as React from "react"
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Command,
    Frame,
    GalleryVerticalEnd, type LucideIcon,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
} from "lucide-react"

import { NavMain } from "~/components/dashboard/navMain"
import { NavUser } from "~/components/dashboard/navUser"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "~/components/ui/sidebar"
import {OAuthUser} from "~/auth.server";

// This is sample data.
const data = {
    user: {
        name: "Robbie Booth",
        email: "robbie.booth.2021@uni.strath.ac.uk",
        avatar: "https://avatars.githubusercontent.com/u/114883936?v=4",
    },
    teams: [
        {
            name: "Acme Inc",
            logo: GalleryVerticalEnd,
            plan: "Enterprise",
        },
        {
            name: "Acme Corp.",
            logo: AudioWaveform,
            plan: "Startup",
        },
        {
            name: "Evil Corp.",
            logo: Command,
            plan: "Free",
        },
    ],
    navMain: [
        {
            title: "Playground",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
            items: [
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
            items: [
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
            items: [
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
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "Team",
                    url: "#",
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
    ],
    projects: [
        {
            name: "Design Engineering",
            url: "#",
            icon: Frame,
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: PieChart,
        },
        {
            name: "Travel",
            url: "#",
            icon: Map,
        },
    ],
}

// {
//     title: "Playground",
//         url: "#",
//     icon: SquareTerminal,
//     isActive: true,
//     items: [
//     {
//         title: "History",
//         url: "#",
//     },
//     {
//         title: "Starred",
//         url: "#",
//     },
//     {
//         title: "Settings",
//         url: "#",
//     },
// ],
// }

//Composite Pattern
export interface sidebarItem {
    title: string;
    url: string;
    // accessibility:string;
    icon?: LucideIcon;
    isActive?: boolean;
    children?: sidebarItem[];
}

// interface groupSidebarItem extends sidebarItem{
//
// }


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: OAuthUser;
    sidebarItems: sidebarItem[];
}


export function AppSidebar({ user, sidebarItems, ...props }: AppSidebarProps) {
    return (
        <Sidebar {...props}>
            {/*<SidebarHeader>*/}
            {/*    <TeamSwitcher teams={data.teams} />*/}
            {/*</SidebarHeader>*/}
            <SidebarContent>
                <NavMain items={sidebarItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
