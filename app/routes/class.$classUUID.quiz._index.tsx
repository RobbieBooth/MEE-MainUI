import {LoaderFunction} from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import {useLoaderData} from "@remix-run/react";
import {DynamicForm} from "~/components/settings/DynamicForm";
import React, {useEffect, useState} from "react";
import {
    AvailableQuiz,
    Class,
    getClassFromBackend,
    getUserMap,
    userDetails,
    UserMap
} from "~/routes/class.$classUUID._index";
import {MySidebar} from "~/routes/dashboard";
import {Button} from "~/components/ui/button";
import {AvailableQuizForm} from "~/components/availableQuiz/creation/availableQuizForm";
import {AvailableQuizTable, deleteAvailableQuiz, QuizTable} from "~/components/quizSection/quizDisplayPage";

export const loader: LoaderFunction = async ({ request, params }):Promise<{ user: OAuthUser; classUUID: string, classData:Class }> => {
    const { classUUID } = params;
    if(classUUID === undefined){
        throw new Error("Class UUID is required");
    }
    const user = await authenticate(request, `/class/${classUUID}/quiz/`);
    // use the user data here

    const classData = await getClassFromBackend(classUUID, user);

    return { user, classUUID, classData };
};

export default function SettingPage(){
    const [userDetailMap, setUserDetailMap] = useState<UserMap>();
    const [isLoadingUserDetailMap, setIsLoadingUserDetailMap] = useState<boolean>(true);
    const { user, classUUID, classData } = useLoaderData<typeof loader>() as {user: OAuthUser, classUUID: string, classData:Class};
    const [classDataHolder, setClassDataHolder] = useState<Class>();

    useEffect(() => {
        const fetchUserMap = async () => {
            const detail = await getUserMap(classData);
            setUserDetailMap(detail as UserMap);
            setIsLoadingUserDetailMap(false);
        };

        fetchUserMap();
        setClassDataHolder(classData);
    }, [classData]);

    return (
        <MySidebar user={user}  currentClassID={classUUID}>
            <div className="m-3">
            <div className="flex gap-3 mb-3">
                <Button asChild>
                    <a href={`/class/${classUUID}/quiz/setting/`}>
                        Create Quiz
                    </a>
                </Button>
                {isLoadingUserDetailMap || classDataHolder == undefined ? "Loading..." :
                    <AvailableQuizForm  currentClass={classDataHolder} user={user} userMap={userDetailMap!} updateClass={setClassDataHolder} createOrEdit={"Create"}/>
                }
            </div>


            {classDataHolder == undefined ? "Loading... Class Data" :
                <AvailableQuizTable availableQuizzes={classDataHolder.availableQuizzes} user={user} classID={classUUID} isEducator={true} userMap={userDetailMap ?? new Map<string, userDetails>()}
                                    title={"Available Quiz Table"}
                editQuizButton={
                    (quiz:AvailableQuiz)=>
                    <AvailableQuizForm  currentClass={classDataHolder} user={user} userMap={userDetailMap!} updateClass={setClassDataHolder} createOrEdit={"Edit"} availableQuizBeingEdited={quiz} />
                }
                 includeViewAttempts={true} deleteAvailableQuiz={(availableQuizUUID: string) => {
                     const success = deleteAvailableQuiz(classUUID, availableQuizUUID, user.backendJWT ?? "");
                     success.then((value) =>{
                         if(value){
                             if(classDataHolder == undefined){
                                 return;
                             }
                             const newClass:Class = {...classDataHolder};
                             newClass.availableQuizzes = newClass.availableQuizzes.filter((quiz) => quiz.id !== availableQuizUUID);
                             setClassDataHolder(newClass);
                         }
                     });
                }}/>
            }

            {classDataHolder == undefined ? "Loading... Class Data" :
                <QuizTable quizzes={classDataHolder.quizzes} user={user} classID={classUUID} isEducator={true} title={"Quiz Table"}/>
            }
            </div>
        </MySidebar>
    );
}