import {LoaderFunction} from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import {Class, getClassFromBackend, getUserMap, UserMap} from "~/routes/class.$classUUID._index";
import React, {useEffect, useState} from "react";
import {useLoaderData} from "@remix-run/react";
import {MySidebar} from "~/routes/dashboard";
import {Button} from "~/components/ui/button";
import {AvailableQuizForm} from "~/components/availableQuiz/creation/availableQuizForm";
import {AvailableQuizTable} from "~/components/quizSection/quizDisplayPage";
import {StudentQuizAttempt} from "~/components/MEETypes/studentAttempt";
import {QuizDisplay} from "~/routes/quiz.$quizUUID";

export const loader: LoaderFunction = async ({ request, params }):Promise<{ user: OAuthUser; classUUID: string, availableQuizUUID:string }> => {
    const { classUUID, availableQuizUUID } = params;
    if(classUUID === undefined || availableQuizUUID === undefined) {
        throw new Error("Class UUID is required or availableQuizUUID is required");
    }
    const user = await authenticate(request, `/class/${classUUID}/quiz/${availableQuizUUID}`);

    return { user, classUUID, availableQuizUUID };
};

export default function Page(){
    const [isCreatingQuiz, setIsCreatingQuiz] = useState<boolean>(true);
    const [quiz, setQuiz] = useState<StudentQuizAttempt>();
    const [error, setError] = useState<null | string>(null);//Error message
    const { user, classUUID, availableQuizUUID } = useLoaderData<typeof loader>() as {user: OAuthUser, classUUID: string, availableQuizUUID:string};

    useEffect(() => {
        const createQuiz = async () => {
            try{
                const response = await fetch(`http://localhost:8080/v1/api/class/${classUUID}/quiz/available/start/${availableQuizUUID}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.backendJWT}`
                    },
                });

                if (!response.ok) {
                    // Parse the response body for error details
                    throw new Error(await response.text() || "Failed to fetch quiz data");
                }

                const jsonResponse = await response.json()
                const studentQuizAttempt: StudentQuizAttempt = jsonResponse;
                setQuiz(studentQuizAttempt);
                //Set window to id so that we dont create a new quiz if they refresh the page
                window.history.replaceState(null, "Settings Page", `/class/${classUUID}/quiz/${availableQuizUUID}/${studentQuizAttempt.studentQuizAttemptUUID}`);
            }catch (e: any) {
                setError(e.message || "An unexpected error occurred");
            }
            setIsCreatingQuiz(false);
        };
        setIsCreatingQuiz(true);
        createQuiz();
    }, [availableQuizUUID]);

    if(isCreatingQuiz && error == null){
        return <div><p>Creating Quiz...</p></div>;
    }
    if(error != null || quiz == null){
        return <div><p>An Error Occurred: {error}</p></div>
    }

    return(
        <QuizDisplay leaveQuizURL={`/class/${classUUID}/quiz/`} studentQuizAttempt={quiz} toggleFlagFunction={(value)=>{}}/>
    );

}