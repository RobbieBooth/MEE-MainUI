"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "~/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "~/components/ui/sidebar"
import {sidebarItem} from "~/components/dashboard/appSidebar";
import {v4 as uuidv4} from "uuid";
import React, {useEffect, useState} from "react";

export function NavMain({
                            items,
                        }: {
    items: sidebarItem[]
}) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>ME Environment</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarItem item={item} key={uuidv4()}/>
                    // <Collapsible
                    //     key={item.title}
                    //     asChild
                    //     defaultOpen={item.isActive}
                    //     className="group/collapsible"
                    // >
                    //     <SidebarMenuItem>
                    //         <CollapsibleTrigger asChild>
                    //             <SidebarMenuButton tooltip={item.title}>
                    //                 {item.icon && <item.icon />}
                    //                 <span>{item.title}</span>
                    //                 <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    //             </SidebarMenuButton>
                    //         </CollapsibleTrigger>
                    //         <CollapsibleContent>
                    //             <SidebarMenuSub>
                    //                 {item.children?.map((subItem) => (
                    //                     <SidebarMenuSubItem key={subItem.title}>
                    //                         <SidebarMenuSubButton asChild>
                    //                             <a href={subItem.url}>
                    //                                 <span>{subItem.title}</span>
                    //                             </a>
                    //                         </SidebarMenuSubButton>
                    //                     </SidebarMenuSubItem>
                    //                 ))}
                    //             </SidebarMenuSub>
                    //         </CollapsibleContent>
                    //     </SidebarMenuItem>
                    // </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}

function SidebarItem({item}: { item: sidebarItem}) {
    const [open, setOpen] = useState(item.isActive ?? false);

    useEffect(() => {
        setOpen(item.isActive ?? false);
    }, [item.isActive]);

    return(
        <div>
            {item.children == undefined || item.children.length === 0 ?
                <SidebarMenuItem
                    // key={componentKey}
                >
                    <SidebarMenuButton asChild>
                        <a href={item.url} className="w-full">
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </a>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                :
                <Collapsible
                    // key={componentKey}
                    asChild
                    defaultOpen={open}
                    open={open}
                    onOpenChange={setOpen}

                    className="group/collapsible"

                >
                    <SidebarMenuItem>

                        <SidebarMenuButton tooltip={item.title}>
                            <a href={item.url} className="inline-flex space-x-1 w-full">
                                {item.icon && <item.icon/>}
                                <span>{item.title}</span>
                            </a>
                            {/*Changed to this to fix bug with nested collapse chevrons not swapping sides on open*/}
                            <CollapsibleTrigger asChild>
                                {open ?
                                    <ChevronRight className="ml-auto transition-transform duration-200 rotate-90"/> :
                                    <ChevronRight className="ml-auto transition-transform duration-200"/>}
                            </CollapsibleTrigger>
                            {/*<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />*/}
                        </SidebarMenuButton>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {item.children.map((subItem) => (
                                    <SidebarItem item={subItem} key={uuidv4()}/>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            }
        </div>
    );
}
