import {useStompWithSend} from "~/components/hooks/stompMessageHook";
import React, {useEffect, useRef, useState} from "react";
import {SidebarProvider, SidebarTrigger} from "~/components/ui/sidebar";
import {AppSidebar, FlagManager} from "~/components/quizSection/quizSideBar";
import {Button} from "~/components/ui/button";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {StudentQuestionAttempt, StudentQuizAttempt} from "~/components/MEETypes/studentAttempt";
import {LoaderFunction} from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import {useNavigate} from "react-router";
import {
    createMoveQuestionEvent,
    createQuestionEvent,
    createQuizEvent,
    createToggleFlagEvent,
    EventDetails,
    QuestionClientSideEvent,
    QuizClientSideEvents
} from "~/components/quizSection/quizEventTypes";
import {QuestionIFrameReturnType, validateAndConvertPayload} from "~/components/MEETypes/questionIFrameReturnType";


export const loader: LoaderFunction = async ({ request }):Promise<{user:OAuthUser}> => {
    // @ts-ignore
    const user = await authenticate(request, `/quiz/${request.quizUUID}`);
    // use the user data here

    return { user };
};


// export default function QuizPage() {
//     const { user } = useLoaderData<typeof loader>() as {user: OAuthUser};
//     const params = useParams();
//     // const { messages, sendStart, sendMessage, isConnected, quiz } = useStompWithSend(user.backendJWT!);
//
//     const handleSubmit = () => {
//             sendStart({
//                 genericEvent: {
//                     type: "QuizEvent",
//                     event: "START_QUIZ"
//                 },
//                 quizUUID: params.quizUUID as string,
//                 questionUUID: "",
//                 additionalData: {}
//             });
//         };
//
//     const toggleFlag = (questionUUID: string) => {
//         sendMessage({
//             genericEvent: {
//                 type: "QuestionEvent",
//                 event: "TOGGLE_FLAG"
//             },
//             quizUUID: params.quizUUID as string,
//             questionUUID: questionUUID,
//             additionalData: {}
//         });
//     }
//
//     useEffect(() => {
//         if (isConnected) {
//             handleSubmit();
//         }
//     }, [isConnected]); // Trigger only when `isConnected` changes to `true`
//
//     return(
//         (quiz == null ?
//         <h1>Quiz Not Received</h1>
//             :
//             // <QuizDisplay leaveQuizURL={"/quiz/"} studentQuizAttempt={quiz}/>
//             <h1>Wrong link mate...</h1>
//         )
//
//     );
// }



export function QuizDisplay({studentQuizAttempt, leaveQuizURL, user, updateQuizQuestion}:{studentQuizAttempt:StudentQuizAttempt, leaveQuizURL:string, user:OAuthUser, updateQuizQuestion:(attempt: StudentQuestionAttempt)=>void}) {
    const updateQuestionCallback = (message: StudentQuestionAttempt)=>{
        updateAdditionalData(message.studentQuestionAttemptUUID, message.additionalData);
        updateQuizQuestion(message);
        setIsSubmitted(getIsSubmittedFromAdditionalData(message.additionalData));
        sendMessageToIframe(message.additionalData, message.settings, message.studentQuestionAttemptUUID);
    }

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeLoaded, setIframeLoaded] = useState(false); // Track iframe load state
    const [currentQuestion, setCurrentQuestion] = useState(studentQuizAttempt.questions[0]);
    const { messages, sendStart, sendMessage, isConnected} = useStompWithSend(user.backendJWT!, studentQuizAttempt.studentQuizAttemptUUID, updateQuestionCallback);
    const [questionToAdditionalData, setQuestionToAdditionalData] = useState<Record<string, Record<string, any>>>({});//The questions Id to its additional data
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigator = useNavigate();

    const updateAdditionalData = (currentQuestionID:string, additionalData:Record<string, any>)=> {
        setQuestionToAdditionalData((previous) => {
            return {...previous, [currentQuestionID]: additionalData};
        });
    }



    /**
     * Requests the `QuestionIFrameReturnType` from the current Iframe and if response is not returned from Iframe in 4 seconds then it fails.
     */
    const requestDataFromIframe = (): Promise<QuestionIFrameReturnType> => {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                window.removeEventListener("message", handleMessage);
                reject(new Error("Request to iframe timed out after 4 seconds."));
            }, 4000); //Timeout after 4 seconds

            const handleMessage = (event: MessageEvent) => {
                if (event.data?.type === "FROM_EMBEDDED_PAGE") {
                    console.log("Received data from iframe:", event.data.payload);
                    clearTimeout(timeout); //Clear the timeout since we received a response
                    window.removeEventListener("message", handleMessage); //Cleanup listener

                    try {
                        const validatedPayload = validateAndConvertPayload(event.data.payload);
                        resolve(validatedPayload);
                    } catch (error) {
                        reject(error); // Reject if validation fails
                    }
                }
            };

            window.addEventListener("message", handleMessage);

            //Send the request to the iframe for additional data etc
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: "REQUEST_DATA" }, "*");
            }
        });
    };


    // // Function to send a request for data to the iframe
    // const requestDataFromIframe = () => {
    //     if (iframeRef.current?.contentWindow) {
    //         iframeRef.current.contentWindow.postMessage({ type: "REQUEST_DATA" }, "*");
    //     }
    // };

    const sendCurrentQuestionToIframe = () => {
        // Ensure the iframe reference is valid
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: "SEND_DATA", payload: JSON.stringify({additionalData: {...currentQuestion.additionalData}, settings: currentQuestion.settings, questionID: currentQuestion.studentQuestionAttemptUUID})}, "*");
        }
    };

    const sendMessageToIframe = (additionalData: any, settings: any, questionID: string) =>{
        // Ensure the iframe reference is valid
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: "SEND_DATA", payload: JSON.stringify({additionalData: additionalData, settings: settings, questionID: questionID})}, "*");
        }
    }

    /**
     * Gets isSubmitted option from additionalData object, if error as in it's not object or does not have isSubmitted, isSubmitted is set to false.
     * @param additionalData
     */
    const getIsSubmittedFromAdditionalData = (additionalData:any) =>{
        return additionalData?.isSubmitted === true;
    }

    useEffect(()=>{
        //Set is submitted on current Question update
        setIsSubmitted(getIsSubmittedFromAdditionalData(currentQuestion.additionalData));
    }, [currentQuestion]);

    useEffect(() => {
        // Whenever currentQuestion changes, send the updated question to the iframe
        if (iframeLoaded) {
            sendCurrentQuestionToIframe();
        }
    }, [currentQuestion, iframeLoaded]); // Runs whenever currentQuestion changes

    //Quiz and Question Events
    function setFlagged(question:StudentQuestionAttempt, flag: boolean){
        sendMessage(createToggleFlagEvent(question.studentQuestionAttemptUUID, studentQuizAttempt.studentQuizAttemptUUID, {}));
    }
    
    async function leaveQuiz() {
        const quizData = await getDataFromQuestions();
        const event: EventDetails = createQuizEvent(
            QuizClientSideEvents.CLOSE_QUIZ,
            studentQuizAttempt.studentQuizAttemptUUID,
            currentQuestion.studentQuestionAttemptUUID,
            quizData);
        sendMessage(event);
        //TODO check that it was successful.
        //Return
        navigator(leaveQuizURL);
    }

    async function moveQuestion(newQuestion: StudentQuestionAttempt) {
        const quizData = await getDataFromQuestions();
        const event: EventDetails = createMoveQuestionEvent(
            studentQuizAttempt.studentQuizAttemptUUID,
            currentQuestion.studentQuestionAttemptUUID,
            newQuestion.studentQuestionAttemptUUID,
            quizData);
        sendMessage(event);

        setCurrentQuestion(newQuestion);
    }

    async function saveQuestion(question: StudentQuestionAttempt) {
        const questionData = await getDataFromQuestion(question.studentQuestionAttemptUUID);
        const event: EventDetails = createQuestionEvent(
            QuestionClientSideEvent.SAVE_QUESTION,
            studentQuizAttempt.studentQuizAttemptUUID,
            question.studentQuestionAttemptUUID,
            questionData);
        sendMessage(event);
    }

    async function submitQuestion(question: StudentQuestionAttempt) {
        const questionData = await getDataFromQuestion(question.studentQuestionAttemptUUID);
        const event: EventDetails = createQuestionEvent(
            QuestionClientSideEvent.SUBMIT_QUESTION,
            studentQuizAttempt.studentQuizAttemptUUID,
            question.studentQuestionAttemptUUID,
            questionData);
        sendMessage(event);
    }
    
    const sendEvent = (event:EventDetails) => {
        sendMessage(event);
    }

    /**
     * Requests data from the current question Iframe and updates the additional data storage
     */
    const requestCurrentQuestionData = async () => {
        const data = await requestDataFromIframe();
        updateAdditionalData(data.questionID, data.additionalData);
        return data.additionalData;
    }

    const getDataFromCurrentQuestion = async (): Promise<Record<string, any>> => {
        //because of way react state gets updated we cannot use this: questionToAdditionalData[currentQuestion.studentQuestionAttemptUUID] ?? {}
        // as it will be updated after function call so we have to return value
        return await requestCurrentQuestionData();
    }

    /**
     * Gets data from a specific question
     * @param questionUUID the student question attempt id of which to get
     */
    const getDataFromQuestion = async (questionUUID: string): Promise<Record<string, any>> => {
        //If requested id is the current question get data from there else the storage
        if (questionUUID == currentQuestion.studentQuestionAttemptUUID) {
            return await getDataFromCurrentQuestion();
        }

        return questionToAdditionalData[questionUUID] ?? {};
    }

    /**
     * Calls all the questions and gets the current additional data held on them.
     * The returned record is the question attempt id to the additional data of that question.
     */
    const getDataFromQuestions = async (): Promise<Record<string, Record<string, any>>> => {
        //Update with current data
        const currentAdditionalData = await requestCurrentQuestionData();
        return {...questionToAdditionalData, [currentQuestion.studentQuestionAttemptUUID]: currentAdditionalData};
    }

    const moveQuestionDirection = (direction: "previous" | "next") => {
        const currentIndex = studentQuizAttempt.questions.findIndex(
            (question) => question.studentQuestionAttemptUUID === currentQuestion.studentQuestionAttemptUUID
        );

        if (direction === "previous" && currentIndex > 0) {
            moveQuestion(studentQuizAttempt.questions[currentIndex - 1]);
        }

        if (direction === "next" && currentIndex < studentQuizAttempt.questions.length - 1) {
            moveQuestion(studentQuizAttempt.questions[currentIndex + 1]);
        }
    };


    useEffect(() => {
        if (isConnected) {
            // handleSubmit();
        }
    }, [isConnected]);

    return (
        <div>
            <SidebarProvider defaultOpen={true}>
                <AppSidebar leaveQuizFN={leaveQuiz} questions={studentQuizAttempt.questions} currentQuestion={currentQuestion} setCurrentQuestion={moveQuestion} setFlagged={setFlagged}/>
                <main className="w-full flex flex-col h-screen">
                    <div>
                        <SidebarTrigger/>
                        <span
                            className="h-min">Question {studentQuizAttempt.questions.findIndex(question => question.studentQuestionAttemptUUID === currentQuestion.studentQuestionAttemptUUID) + 1}</span>
                        <FlagManager isFlagged={currentQuestion.flagged}
                                     setFlagged={(flag: boolean) => setFlagged(currentQuestion, flag)}/>

                    </div>
                    <div className="grow">
                        <button onClick={requestDataFromIframe}>Request Data from Iframe
                        </button>
                        {/*<button onClick={async () => {*/}
                        {/*    console.log(await requestDataFromIframe2());*/}
                        {/*}}>Request Data from Iframe2*/}
                        {/*</button>*/}
                        <button onClick={sendCurrentQuestionToIframe}>Send Data to Iframe</button>
                        <iframe ref={iframeRef} title={currentQuestion.moduleName}
                                className="grow w-full h-full border-none overflow-scroll"
                                src={`http://localhost:8080/invoke/${currentQuestion.moduleName}`}
                                onLoad={() => setIframeLoaded(true)} // Set iframeLoaded to true when iframe loads
                        />
                        {/*<iframe ref={iframeRef} title={currentQuestion.moduleName}*/}
                        {/*        className="grow w-full h-full border-none overflow-scroll"*/}
                        {/*        src={` http://localhost:4173/`}*/}
                        {/*        onLoad={() => setIframeLoaded(true)} // Set iframeLoaded to true when iframe loads*/}
                        {/*/>*/}
                    </div>
                    <div className="flex self-end gap-4 px-4 pb-4 mt-2">
                        <Button onClick={() => saveQuestion(currentQuestion)} disabled={isSubmitted}>Save</Button>
                        <Button onClick={() => submitQuestion(currentQuestion)} disabled={isSubmitted}>Submit</Button>
                    </div>
                    <div className="flex justify-between self-end w-full pb-4 px-4">
                        <Button disabled={currentQuestion.studentQuestionAttemptUUID === studentQuizAttempt.questions[0].studentQuestionAttemptUUID} onClick={() =>{moveQuestionDirection("previous")}}><ChevronLeft/>Previous</Button>
                        <Button disabled={currentQuestion.studentQuestionAttemptUUID === studentQuizAttempt.questions[studentQuizAttempt.questions.length-1].studentQuestionAttemptUUID} onClick={() =>{moveQuestionDirection("next")}}>Next<ChevronRight/></Button>
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
}