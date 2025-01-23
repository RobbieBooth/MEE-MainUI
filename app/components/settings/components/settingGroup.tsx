import {GroupSetting, ToggleDisplay, ToggleSetting} from "~/components/settings/compositeSettings";
import {Controller} from "react-hook-form";
import {Checkbox} from "~/components/ui/checkbox";
import {Switch} from "~/components/ui/switch";
import {SettingTooltip} from "~/components/settings/components/settingTooltip";
import React from "react";
import {renderSetting} from "~/components/settings/greenMan/renderSetting";

export function SettingGroup({
                           groupSetting,
                           control,
                                 register,
                                 setValue,
                       }: {
    groupSetting: GroupSetting;
    control: any; // Update with the correct type from your form library
    register: any,
    setValue: any,
}): JSX.Element {
    return (
            <fieldset key={groupSetting.id} className="space-x-3 space-y-0 rounded-md border p-4">
                <GroupTitle label={groupSetting.label} tooltip={groupSetting.tooltip}/>
                <div className="flex flex-wrap gap-3"> {/* Use flexbox with gap for consistent spacing */}
                    {groupSetting.children.map((childSetting) =>
                        renderSetting(childSetting, control, register, setValue)
                    )}
                </div>
            </fieldset>
    );
}

export function GroupTitle({label, tooltip}:{label: string, tooltip: string}) {
    return <legend>
        <div className="flex items-center">
            <p className="mr-2">{label}</p>
            <SettingTooltip tooltip={tooltip}/>
        </div>
    </legend>;
}