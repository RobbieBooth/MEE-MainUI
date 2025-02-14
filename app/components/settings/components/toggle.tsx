import {ToggleDisplayType, ToggleSetting} from "~/components/settings/compositeSettings";
import {Checkbox} from "~/components/ui/checkbox";
import {SettingTooltip} from "~/components/settings/components/settingTooltip";
import {Switch} from "~/components/ui/switch";
import {Controller} from "react-hook-form";
import React from "react";

export function Toggle({
                           toggleSetting,
                           control,
    updateValue,
                       }: {
    toggleSetting: ToggleSetting;
    control: any; // Update with the correct type from your form library
    updateValue?: (value:boolean) => void;
}): JSX.Element {
    return (
        <div className="grid gap-4 w-full">
            <div className="">
                {/* Use Controller for logic */}
                <Controller
                    control={control}
                    name={toggleSetting.id}
                    defaultValue={toggleSetting.value}
                    render={({field}) => (
                        <div
                            className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <div className="flex items-center">
                                {/* Toggle Display Logic */}
                                {toggleSetting.display === ToggleDisplayType.Checkbox && (
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(checked)=>{
                                            field.onChange(checked);

                                            if(updateValue != null){
                                                if (typeof checked === "boolean") {
                                                    updateValue(checked);
                                                }
                                            }
                                        }}
                                        disabled={toggleSetting.disabled}
                                    />
                                )}
                                {toggleSetting.display === ToggleDisplayType.Switch && (
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={(bool)=>{
                                            field.onChange(bool);

                                            if(updateValue != null){
                                                updateValue(bool);
                                            }
                                        }}
                                        disabled={toggleSetting.disabled}
                                    />
                                )}
                            </div>
                            {/*<div className="space-y-1 leading-none">*/}
                            {/*    <p>{toggleSetting.label}</p>*/}
                            {/*    <SettingTooltip tooltip={toggleSetting.tooltip}/>*/}
                            {/*</div>*/}
                            <div className="flex flex-row items-center space-x-2 leading-none">
                                <p>{toggleSetting.label}</p>
                                {toggleSetting.tooltip && <SettingTooltip tooltip={toggleSetting.tooltip}/>}
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}