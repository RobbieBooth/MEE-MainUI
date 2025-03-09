import {GroupSetting, ToggleDisplayType, ToggleSetting} from "~/components/settings/compositeSettings";
import {Controller} from "react-hook-form";
import {Checkbox} from "~/components/ui/checkbox";
import {Switch} from "~/components/ui/switch";
import {SettingTooltip} from "~/components/settings/components/settingTooltip";
import React from "react";
import {renderSetting} from "~/components/settings/renderSetting";

export function SettingGroup({
                           groupSetting,
                           control,
                                 register,
                                 setValue,
                       }: {
    groupSetting: GroupSetting;
    control: any;
    register: any,
    setValue: any,
}): JSX.Element {
    return (
            <fieldset key={groupSetting.id} className={groupSetting.haveBorder ? "space-x-3 space-y-0 rounded-md border p-4" : ""}>
                <GroupTitle label={groupSetting.label} tooltip={groupSetting.tooltip}/>
                {/*{groupSetting.displayID != undefined && groupSetting.displayID && groupSetting.id}*/}
                <div className="flex flex-wrap gap-3"> {/* Use flexbox with gap for consistent spacing */}
                    {groupSetting.children.map((childSetting) =>
                        renderSetting(childSetting, control, register, setValue)
                    )}
                </div>
            </fieldset>
    );
}

export function GroupTitle({label, tooltip, id}:{label: string | null, tooltip: string | null, id?:string}) {
    return (label == null && tooltip == null && id == undefined ? null :
        <legend>
        <div className="flex items-center">
            {label && <p className="mr-2">{label}</p>}
            {tooltip && <SettingTooltip tooltip={tooltip}/>}
            {id && <p className="">{id}</p>}
        </div>
    </legend>);
}