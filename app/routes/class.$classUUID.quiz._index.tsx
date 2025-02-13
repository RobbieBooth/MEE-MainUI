import {LoaderFunction} from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import {useLoaderData} from "@remix-run/react";
import {DynamicForm} from "~/components/settings/greenMan/DynamicForm";
import React from "react";
import {Class, getClassFromBackend} from "~/routes/class.$classUUID._index";
import {MySidebar} from "~/routes/dashboard";
import {Button} from "~/components/ui/button";

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
    const { user, classUUID } = useLoaderData<typeof loader>() as {user: OAuthUser, classUUID: string, classData:Class};
    //Use null when its an empty page
    return (
        <MySidebar user={user}>
            <Button asChild>
                <a href={`/class/${classUUID}/quiz/setting/`}>
                    Create Quiz
                </a>
            </Button>
        </MySidebar>
    );
}