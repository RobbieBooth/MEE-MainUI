import {LoaderFunction} from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import {useLoaderData} from "@remix-run/react";
import {DynamicForm} from "~/components/settings/greenMan/DynamicForm";
import React, {useEffect, useState} from "react";
import {Class, getClassFromBackend, getUserMap, UserMap} from "~/routes/class.$classUUID._index";
import {MySidebar} from "~/routes/dashboard";
import {Button} from "~/components/ui/button";
import {AvailableQuizForm} from "~/components/availableQuiz/creation/availableQuizForm";
import {AvailableQuizTable} from "~/components/quizSection/quizDisplayPage";

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

    useEffect(() => {
        const fetchUserMap = async () => {
            const detail = await getUserMap(classData);
            setUserDetailMap(detail as UserMap);
            setIsLoadingUserDetailMap(false);
        };

        fetchUserMap();
    }, [classData]);

    return (
        <MySidebar user={user}>
            <Button asChild>
                <a href={`/class/${classUUID}/quiz/setting/`}>
                    Create Quiz
                </a>
            </Button>
            {isLoadingUserDetailMap ? "Loading..." :
                <AvailableQuizForm  currentClass={classData} user={user} userMap={userDetailMap!}/>
            }

            <AvailableQuizTable availableQuizzes={classData.availableQuizzes} user={user} classID={classUUID} isEducator={false}/>

        </MySidebar>
    );
}