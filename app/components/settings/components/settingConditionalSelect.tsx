import {
    ConditionalSelectSetting,
    ConditionalBoolSetting, SelectSetting,
    ToggleDisplayType,
    ToggleSetting
} from "~/components/settings/compositeSettings";
import {Checkbox} from "~/components/ui/checkbox";
import {SettingTooltip} from "~/components/settings/components/settingTooltip";
import {Switch} from "~/components/ui/switch";
import {Controller} from "react-hook-form";
import React, {useEffect, useState} from "react";
import {renderSetting} from "~/components/settings/greenMan/renderSetting";
import {GroupTitle} from "~/components/settings/components/settingGroup";
import {Toggle} from "~/components/settings/components/toggle";
import {SelectSettingComponent} from "~/components/settings/components/selectSettingComponent";

export function SettingConditionalSelect({
                                           conditionalSelect,
                                           control,
                                           register,
                                           setValue,
                                       }: {
    conditionalSelect: ConditionalSelectSetting;
    control: any;
    register: any,
    setValue: any,
}): JSX.Element {
    const [selectSetting, setSelectSettings] = useState<SelectSetting>(conditionalSelect.condition);


    useEffect(() => {
        setSelectSettings(conditionalSelect.condition);
    }, [conditionalSelect.condition]);

    return (
        <fieldset key={conditionalSelect.id} className="space-x-3 space-y-0 rounded-md border p-4">
            <GroupTitle label={conditionalSelect.label} tooltip={conditionalSelect.tooltip}  id={(conditionalSelect.displayID != undefined && conditionalSelect.displayID) ? conditionalSelect.id : undefined}/>
            {/*{renderSetting(conditionalSetting.condition, control, register, setValue)}*/}
            <SelectSettingComponent selectSetting={conditionalSelect.condition} control={control} updateValue={(selected: string[]) => {
                setSelectSettings((prevState) => ({
                    ...prevState, // Spread the previous state to maintain other properties
                    value: selected,  // Update the specific property (e.g., `value`) with the new selectValue
                }));
            }}  />
            {selectSetting.value &&
                selectSetting.value.map((value) =>{
                    if(conditionalSelect.groups[value] != null){
                        return renderSetting(conditionalSelect.groups[value], control, register, setValue);
                    }else{
                        return null;
                    }
                })

            }
        </fieldset>
    );
}