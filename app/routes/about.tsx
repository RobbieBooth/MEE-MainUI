import type { MetaFunction } from "@remix-run/node";
import {Button} from "~/components/ui/button";
import {SidebarProvider, SidebarTrigger} from "~/components/ui/sidebar";
import {AppSidebar, FlagManager} from "~/components/quizSection/quizSideBar";
import React from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";

export const meta: MetaFunction = () => {
    return [
        { title: "About" },
        { name: "description", content: "About Page" },
    ];
};

export interface Question {
    uuid: string;
    isFlagged: boolean;
}

// export default function Index() {
//     const [questions, setQuestions] = React.useState<Question[]>([
//         { uuid: "1a2b3c4d5e", isFlagged: false },
//         { uuid: "2b3c4d5e6f", isFlagged: true },
//         { uuid: "3c4d5e6f7g", isFlagged: false },
//         { uuid: "4d5e6f7g8h", isFlagged: true },
//         { uuid: "5e6f7g8h9i", isFlagged: false },
//         { uuid: "6f7g8h9i0j", isFlagged: false },
//         { uuid: "7g8h9i0j1k", isFlagged: true },
//         { uuid: "8h9i0j1k2l", isFlagged: false },
//         { uuid: "9i0j1k2l3m", isFlagged: true },
//         { uuid: "0j1k2l3m4n", isFlagged: false },
//         { uuid: "1k2l3m4n5o", isFlagged: true },
//         { uuid: "2l3m4n5o6p", isFlagged: false },
//         { uuid: "3m4n5o6p7q", isFlagged: true },
//         { uuid: "4n5o6p7q8r", isFlagged: false },
//         { uuid: "5o6p7q8r9s", isFlagged: true },
//     ]);
//     const [currentQuestion, setCurrentQuestion] = React.useState(questions[0]);
//
//     function setFlagged(question:Question, flag: boolean){
//         const newQuestions = questions.map((question1)=>{
//            if(question1.uuid === question.uuid){
//                question.isFlagged = flag;
//            }
//            return question1;
//         });
//         setQuestions(newQuestions);
//
//     }
//
//     return (
//         // <div className="flex h-screen items-center justify-center">
//         //     <Button>Click me</Button>
//         // </div>
//         <div>
//         <SidebarProvider defaultOpen={true}>
//             <AppSidebar questions={questions} currentQuestion={currentQuestion} setCurrentQuestion={setCurrentQuestion} setFlagged={setFlagged}/>
//             <main className="w-full flex flex-col h-screen">
//                 <div>
//                     <SidebarTrigger/>
//                     <span
//                         className="h-min">Question {questions.findIndex(question => question.uuid === currentQuestion.uuid) + 1}</span>
//                     <FlagManager isFlagged={currentQuestion.isFlagged}
//                                  setFlagged={(flag: boolean) => setFlagged(currentQuestion, flag)}/>
//
//                 </div>
//                 <div className="grow"></div>
//                 <div className="flex self-end gap-4 px-4 pb-4">
//                     <Button>Save</Button>
//                     <Button>Submit</Button>
//                 </div>
//                 <div className="flex justify-between self-end w-full pb-4 px-4">
//                     <Button><ChevronLeft/>Previous</Button>
//                     <Button>Next<ChevronRight/></Button>
//                 </div>
//             </main>
//         </SidebarProvider>
//         </div>
//     );
// }