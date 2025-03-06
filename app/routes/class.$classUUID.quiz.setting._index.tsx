import React from "react";
import {DynamicForm} from "~/components/settings/DynamicForm";
import {LoaderFunction} from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import {useLoaderData} from "@remix-run/react";

export const loader: LoaderFunction = async ({ request, params }):Promise<{ user: OAuthUser; classUUID: string }> => {
    const { classUUID } = params;
    if(classUUID === undefined){
        throw new Error("Class UUID is required");
    }
    const user = await authenticate(request, `/class/${classUUID}/quiz/setting`);
    // use the user data here

    return { user, classUUID };
};

export default function SettingPage(){
    const { user, classUUID } = useLoaderData<typeof loader>() as {user: OAuthUser, classUUID: string};
    //Use null when its an empty page
    return <DynamicForm settings={null} classUUID={classUUID} user={user}/>;
}