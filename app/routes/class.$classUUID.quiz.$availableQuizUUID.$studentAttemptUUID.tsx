import {LoaderFunction} from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import React, {useEffect, useState} from "react";
import {StudentQuizAttempt} from "~/components/MEETypes/studentAttempt";
import {useLoaderData} from "@remix-run/react";
import {QuizDisplay} from "~/routes/quiz.$quizUUID";

export const loader: LoaderFunction = async ({ request, params }):Promise<{ user: OAuthUser; classUUID: string, availableQuizUUID:string, studentAttemptUUID:string }> => {
    const { classUUID, availableQuizUUID, studentAttemptUUID } = params;
    if(classUUID === undefined || availableQuizUUID === undefined || studentAttemptUUID === undefined) {
        throw new Error("Class UUID is required and availableQuizUUID is required and studentAttemptUUID is required");
    }
    const user = await authenticate(request, `/class/${classUUID}/quiz/${availableQuizUUID}/${studentAttemptUUID}`);

    return { user, classUUID, availableQuizUUID, studentAttemptUUID };
};

export default function Page(){
    const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(true);
    const [quiz, setQuiz] = useState<StudentQuizAttempt>();
    const [error, setError] = useState<null | string>(null);//Error message
    const { user, classUUID, availableQuizUUID, studentAttemptUUID} = useLoaderData<typeof loader>() as {user: OAuthUser, classUUID: string, availableQuizUUID:string, studentAttemptUUID:string};

    useEffect(() => {
        const getQuiz = async () => {
            try{
                const response = await fetch(`http://localhost:8080/v1/api/class/${classUUID}/quiz/available/${availableQuizUUID}/${studentAttemptUUID}`, {
                    method: "GET",
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
            }catch (e: any) {
                setError(e.message || "An unexpected error occurred");
            }
            setIsLoadingQuiz(false);
        };
        setIsLoadingQuiz(true);
        getQuiz();
    }, [availableQuizUUID, studentAttemptUUID]);

    if(isLoadingQuiz && error == null){
        return <div><p>Loading Quiz...</p></div>;
    }
    if(error != null || quiz == null){
        return <div><p>An Error Occurred: {error}</p></div>
    }

    return(
        <QuizDisplay studentQuizAttempt={quiz} user={user} leaveQuizURL={`/class/${classUUID}/quiz/`}/>
    );

}


