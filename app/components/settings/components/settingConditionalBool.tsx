import {ConditionalBoolSetting, ToggleSetting} from "~/components/settings/compositeSettings";
import React, {useEffect, useState} from "react";
import {renderSetting} from "~/components/settings/renderSetting";
import {GroupTitle} from "~/components/settings/components/settingGroup";
import {Toggle} from "~/components/settings/components/toggle";

export function SettingConditionalBool({
                           conditionalSetting,
                           control,
                                       register,
                                       setValue,
                       }: {
    conditionalSetting: ConditionalBoolSetting;
    control: any;
    register: any,
    setValue: any,
}): JSX.Element {
    const [toggleSettings, setToggleSettings] = useState<ToggleSetting>(conditionalSetting.condition);

    useEffect(() => {
        setToggleSettings(conditionalSetting.condition);
    }, [conditionalSetting.condition]);

    function renderChildren(){
        const useNot = conditionalSetting.not !== undefined && conditionalSetting.not === true;
        const shouldRender = useNot ? !toggleSettings.value : toggleSettings.value;
        // console.log(conditionalSetting.not);

        if (shouldRender) {
            return renderSetting(conditionalSetting.children, control, register, setValue);
        }
        return null;
    }

    return (
        <fieldset key={conditionalSetting.id} className="space-x-3 space-y-0 rounded-md border p-4">
            <GroupTitle label={conditionalSetting.label} tooltip={conditionalSetting.tooltip}/>
            {/*{renderSetting(conditionalSetting.condition, control, register, setValue)}*/}
            <Toggle toggleSetting={conditionalSetting.condition} control={control} updateValue={(bool: boolean) => {
                setToggleSettings((prevState) => ({
                    ...prevState, // Spread the previous state to maintain other properties
                    value: bool,  // Update the specific property (e.g., `value`) with the new boolean value
                }));
            }} />
            {/*Nots the condition if it is defined*/}
            {/*{conditionalSetting.not != undefined && (conditionalSetting.not && !toggleSettings.value)?*/}
            {/*    (!toggleSettings.value &&*/}
            {/*        renderSetting(conditionalSetting.children, control, register, setValue))*/}
            {/*    :*/}
            {/*    (toggleSettings.value &&*/}
            {/*        renderSetting(conditionalSetting.children, control, register, setValue))*/}
            {/*    }*/}
            {renderChildren()}
        </fieldset>
    );
}