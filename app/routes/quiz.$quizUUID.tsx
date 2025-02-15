import {useLoaderData, useParams} from "@remix-run/react";
import {useStompWithSend} from "~/components/hooks/stompMessageHook";
import React, {useEffect, useRef, useState} from "react";
import {SidebarProvider, SidebarTrigger} from "~/components/ui/sidebar";
import {AppSidebar, FlagManager} from "~/components/quizSection/quizSideBar";
import {Button} from "~/components/ui/button";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {Question} from "~/routes/about";
import {StudentQuestionAttempt, StudentQuizAttempt} from "~/components/MEETypes/studentAttempt";
import {LoaderFunction} from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";


export const loader: LoaderFunction = async ({ request }):Promise<{user:OAuthUser}> => {
    // @ts-ignore
    const user = await authenticate(request, `/quiz/${request.quizUUID}`);
    // use the user data here

    return { user };
};


export default function QuizPage() {
    const { user } = useLoaderData<typeof loader>() as {user: OAuthUser};
    const params = useParams();
    const { messages, sendStart, sendMessage, isConnected, quiz } = useStompWithSend(user.backendJWT!);

    const handleSubmit = () => {
            sendStart({
                genericEvent: {
                    type: "QuizEvent",
                    event: "START_QUIZ"
                },
                quizUUID: params.quizUUID as string,
                questionUUID: "",
                additionalData: {}
            });
        };

    const toggleFlag = (questionUUID: string) => {
        sendMessage({
            genericEvent: {
                type: "QuestionEvent",
                event: "TOGGLE_FLAG"
            },
            quizUUID: params.quizUUID as string,
            questionUUID: questionUUID,
            additionalData: {}
        });
    }

    useEffect(() => {
        if (isConnected) {
            handleSubmit();
        }
    }, [isConnected]); // Trigger only when `isConnected` changes to `true`

    return(
        (quiz == null ?
        <h1>Quiz Not Received</h1>
            :
            <QuizDisplay studentQuizAttempt={quiz} toggleFlagFunction={toggleFlag}/>
        )

    );
}

function QuizDisplay({studentQuizAttempt, toggleFlagFunction}:{studentQuizAttempt:StudentQuizAttempt, toggleFlagFunction:(questionUUID:string)=>void}) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeLoaded, setIframeLoaded] = useState(false); // Track iframe load state
    const [currentQuestion, setCurrentQuestion] = React.useState(studentQuizAttempt.questions[0]);

    function setFlagged(question:StudentQuestionAttempt, flag: boolean){
        toggleFlagFunction(question.studentQuestionAttemptUUID);
    }

    const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "FROM_EMBEDDED_PAGE") {
            console.log("Received data from iframe:", event.data.payload);
        }
    };

    // Function to send a request for data to the iframe
    const requestDataFromIframe = () => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: "REQUEST_DATA" }, "*");
        }
    };

    const sendMessageToIframe = () => {
        // Ensure the iframe reference is valid
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: "SEND_DATA", payload: currentQuestion.studentQuestionAttemptUUID}, "*");
        }
    };

    useEffect(() => {
        // Set up a listener for messages
        window.addEventListener("message", handleMessage);

        // Clean up the listener on unmount
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    useEffect(() => {
        // Whenever currentQuestion changes, send the updated question to the iframe
        if (iframeLoaded) {
            sendMessageToIframe();
        }
    }, [currentQuestion, iframeLoaded]); // Runs whenever currentQuestion changes

    return (
        <div>
            <SidebarProvider defaultOpen={true}>
                <AppSidebar questions={studentQuizAttempt.questions} currentQuestion={currentQuestion} setCurrentQuestion={setCurrentQuestion} setFlagged={setFlagged}/>
                <main className="w-full flex flex-col h-screen">
                    <div>
                        <SidebarTrigger/>
                        <span
                            className="h-min">Question {studentQuizAttempt.questions.findIndex(question => question.studentQuestionAttemptUUID === currentQuestion.studentQuestionAttemptUUID) + 1}</span>
                        <FlagManager isFlagged={currentQuestion.flagged}
                                     setFlagged={(flag: boolean) => setFlagged(currentQuestion, flag)}/>

                    </div>
                    <div className="grow">
                        <button onClick={requestDataFromIframe}>Request Data from Iframe</button>
                        <button onClick={sendMessageToIframe}>Send Data to Iframe</button>
                        {/*<iframe title={currentQuestion.moduleName} className="grow w-full h-full border-none" src={`http://localhost:8080/invoke/${currentQuestion.moduleName}`}/>*/}
                        <iframe ref={iframeRef} title={currentQuestion.moduleName}
                                className="grow w-full h-full border-none" src={`http://localhost:8080/invoke/${currentQuestion.moduleName}`}
                                onLoad={() => setIframeLoaded(true)} // Set iframeLoaded to true when iframe loads
                        />
                    </div>
                    <div className="flex self-end gap-4 px-4 pb-4 mt-2">
                    <Button>Save</Button>
                        <Button>Submit</Button>
                    </div>
                    <div className="flex justify-between self-end w-full pb-4 px-4">
                        <Button disabled={currentQuestion.studentQuestionAttemptUUID === studentQuizAttempt.questions[0].studentQuestionAttemptUUID}><ChevronLeft/>Previous</Button>
                        <Button disabled={currentQuestion.studentQuestionAttemptUUID === studentQuizAttempt.questions[studentQuizAttempt.questions.length-1].studentQuestionAttemptUUID}>Next<ChevronRight/></Button>
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
}