import {DateSetting, TagInputSetting} from "~/components/settings/compositeSettings";
import {Controller} from "react-hook-form";
import {TagsInput} from "~/components/ui/tags-input";
import {SettingTooltip} from "~/components/settings/components/settingTooltip";
import { SmartDatetimeInput } from "~/components/ui/smart-datetime-input";
import React from "react";

export function SettingDate(
    {
        dateSetting,
        control,

    }:{
        dateSetting:DateSetting
        control: any; // Update with the correct type from your form library
    }
) {


    return (
        <div key={dateSetting.id}>
            <Controller
                control={control}
                name={dateSetting.id}
                defaultValue={dateSetting.unixTimestamp}
                render={({field}) => (
                    <div>
                        <label className="block">{dateSetting.label}</label>
                        <div className="inline-flex align-middle items-center">
                            <SmartDatetimeInput
                                // name={dateSetting.id}
                                // onChange={field.onChange}
                                placeholder="e.g. tomorrow at 3pm"
                                // disabled={(date) => date < new Date()}
                                value={field.value ? new Date(field.value) : undefined} // Convert Unix timestamp to Date for the input
                                onValueChange={(date) => {
                                    // Convert Date object or null back to a Unix timestamp
                                    const unixTimestamp = date ? date.getTime() : undefined;
                                    field.onChange(unixTimestamp);
                                }}
                            />
                            {dateSetting.tooltip && <SettingTooltip tooltip={dateSetting.tooltip}/>}
                        </div>
                    </div>
                )}/>

        </div>
    );
}