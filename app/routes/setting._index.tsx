import React from "react";
import {DynamicForm} from "~/components/settings/greenMan/DynamicForm";

export default function SettingPage(){
    //Use null when its an empty page
    return <DynamicForm settings={null} />;
}