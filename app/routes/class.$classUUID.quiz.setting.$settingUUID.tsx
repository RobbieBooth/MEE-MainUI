import React, {useEffect, useState} from "react";

import {
    BaseSetting, GroupSetting,
    InputSetting,
    SettingType,
    ToggleDisplayType,
    ToggleSetting
} from "~/components/settings/compositeSettings";
import {DynamicForm} from "~/components/settings/greenMan/DynamicForm";
import {useLoaderData, useParams} from "@remix-run/react";
import {LoaderFunction} from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import {Class} from "~/routes/class.$classUUID._index";

export const loader: LoaderFunction = async ({ params, request }) => {
    const { classUUID, settingUUID } = params;
    if(classUUID === undefined){
        throw new Error("Class UUID is required");
    }
    const user = await authenticate(request, `/class/${classUUID}/quiz/setting/${settingUUID}`);

    return { user, classUUID };
};

export default function SettingPage(){
    const { user, classUUID } = useLoaderData<typeof loader>() as {user: OAuthUser, classUUID:string};
    const params = useParams();
    const [setting, setSetting] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.settingUUID !== undefined) {
            setSetting(params.settingUUID ?? null);
            setLoading(false); // Mark loading as complete when params is ready
        }
    }, [params]);

    // Prevent rendering until params are fully loaded
    if (loading) {
        return null; // Or a loading indicator if needed
    }

    return <DynamicForm settings={setting} classUUID={classUUID} user={user} />;
}
