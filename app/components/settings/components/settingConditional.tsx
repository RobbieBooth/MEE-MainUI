import {ConditionalSetting, ToggleDisplay, ToggleSetting} from "~/components/settings/compositeSettings";
import {Checkbox} from "~/components/ui/checkbox";
import {SettingTooltip} from "~/components/settings/components/settingTooltip";
import {Switch} from "~/components/ui/switch";
import {Controller} from "react-hook-form";
import React, {useEffect, useState} from "react";
import {renderSetting} from "~/components/settings/greenMan/renderSetting";
import {GroupTitle} from "~/components/settings/components/settingGroup";
import {Toggle} from "~/components/settings/components/toggle";

export function SettingConditional({
                           conditionalSetting,
                           control,
                                       register,
                                       setValue,
                       }: {
    conditionalSetting: ConditionalSetting;
    control: any; // Update with the correct type from your form library
    register: any,
    setValue: any,
}): JSX.Element {
    const [toggleSettings, setToggleSettings] = useState<ToggleSetting>(conditionalSetting.condition);

    useEffect(() => {
        setToggleSettings(conditionalSetting.condition);
    }, [conditionalSetting.condition]);

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
            {toggleSettings.value &&
                    renderSetting(conditionalSetting.group, control, register, setValue)
                }
        </fieldset>
    );
}