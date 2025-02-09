import {Input} from "~/components/ui/input";
import {InputSetting, SelectSetting, TagInputSetting} from "~/components/settings/compositeSettings";
import {SettingTooltip} from "~/components/settings/components/settingTooltip";
import React from "react";
import {TagsInput} from "~/components/ui/tags-input";
import {Controller} from "react-hook-form";

export function SettingTagInput(
    {
        tagInputSetting,
        control,

    }:{
        tagInputSetting:TagInputSetting
        control: any; // Update with the correct type from your form library
    }
) {


    return (
        <div key={tagInputSetting.id}>
            <Controller
                control={control}
                name={tagInputSetting.id}
                defaultValue={tagInputSetting.value}
                render={({field}) => (
                    <div>
                    <label className="block">{tagInputSetting.label}</label>
                    <div className="inline-flex align-middle items-center">
                    <TagsInput
                    value={field.value}
                onValueChange={field.onChange}
                placeholder={tagInputSetting.tooltip ?? undefined}
                    maxItems={tagInputSetting.maxEntries ?? undefined}
            />
                        {tagInputSetting.tooltip && <SettingTooltip tooltip={tagInputSetting.tooltip}/>}
                    </div>
                    </div>
            )}/>

        </div>
    );
}