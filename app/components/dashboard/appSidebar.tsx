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

//Composite Pattern
export interface sidebarItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    children?: sidebarItem[];
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: OAuthUser;
    sidebarItems: sidebarItem[];
}

export function AppSidebar({ user, sidebarItems, ...props }: AppSidebarProps) {
    return (
        <Sidebar {...props}>
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
