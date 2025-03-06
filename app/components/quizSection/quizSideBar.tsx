import {Calendar, Home, Inbox, Search, Settings, LogOut, BookOpen, Flag, FlagOff} from "lucide-react";

import {
    Sidebar,
    SidebarContent, SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel, SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "~/components/ui/sidebar";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "~/components/ui/carousel";
import {Card, CardContent} from "~/components/ui/card";
import {Button} from "~/components/ui/button";
import {StudentQuestionAttempt as Question} from "~/components/MEETypes/studentAttempt";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@radix-ui/react-tooltip";
import React, {Component} from "react";

export function FlagManager({isFlagged, setFlagged}:{ isFlagged:boolean, setFlagged:(flag: boolean) => void}) {
    const [isHovering, setIsHovering] = React.useState(false);

    const flagCSS = "absolute right-4";

    return (isFlagged && <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild onMouseOver={() => setIsHovering(true)} onMouseOut={() => setIsHovering(false)} onClick={()=> setFlagged(!isFlagged)}>
                {isHovering ? <FlagOff className={flagCSS} /> : <Flag className={flagCSS}/>}
            </TooltipTrigger>
            <TooltipContent>
                <p>Unflag</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>);
}

export function AppSidebar({leaveQuizFN, questions, currentQuestion, setCurrentQuestion, setFlagged}: {leaveQuizFN:()=>void, questions: Question[], currentQuestion: Question, setCurrentQuestion: (question: Question) => void, setFlagged: (question: Question, flag:boolean) => void} ){
    return (
        <Sidebar className="h-screen">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem key={"LeaveQuiz"}>
                        <SidebarMenuButton asChild>
                            <a onClick={leaveQuizFN}>
                                <LogOut className="rotate-180" />
                                <span>Leave Quiz</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Questions</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <Carousel
                                opts={{
                                    align: "start",
                                }}
                                orientation="vertical"
                                className="w-full max-w-xs"
                            >
                                <CarouselContent className="-mt-2 h-full">
                                    {questions.map((question, index) => (
                                        <CarouselItem key={index} className="pt-1 md:basis-1/2">
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent
                                                        className="relative flex items-center justify-center p-6 ">
                                                        <Button variant="secondary"
                                                                className={`text-3xl font-semibold ${(currentQuestion.studentQuestionAttemptUUID === question.studentQuestionAttemptUUID ? "underline" : "")}`}
                                                                onClick={() => setCurrentQuestion(question)}>{index + 1}</Button>
                                                        <FlagManager isFlagged={question.flagged} setFlagged={(flag:boolean) => setFlagged(question, flag)}/>

                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem key={"ReviewQuiz"}>
                        <SidebarMenuButton asChild>
                            <a href={"#"}>
                                <BookOpen />
                                <span>Review Quiz</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

