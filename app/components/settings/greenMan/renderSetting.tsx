import React from "react";
import { useForm, Controller } from "react-hook-form";

import {
    BaseSetting, ConditionalSetting, FileInputSetting, GroupSetting,
    InputSetting,
    SelectSetting, ListSetting,
    SettingType, ToggleDisplay,
    ToggleSetting
} from "~/components/settings/compositeSettings";
import {Switch} from "~/components/ui/switch";
import {Input} from "~/components/ui/input";
import {Button} from "~/components/ui/button";
import {Select} from "~/components/ui/select";
import {Toggle} from "~/components/settings/components/toggle";
import {FormControl, FormItem, FormLabel, FormMessage} from "~/components/ui/form";
import {Checkbox} from "~/components/ui/checkbox";
import {SettingTooltip} from "~/components/settings/components/settingTooltip";
import {SelectSettingComponent} from "~/components/settings/components/selectSettingComponent";
import {FileUploaderSetting} from "~/components/settings/components/fileUploaderSetting";
import {SettingGroup} from "~/components/settings/components/settingGroup";
import {SettingList} from "~/components/settings/components/settingList";
import {SettingConditional} from "~/components/settings/components/settingConditional";

const renderSetting = (
    setting: BaseSetting,
    control: any,
    register: any,
    setValue: any,
    // addComponent: (parentID: string, component: BaseSetting) => void,
    // removeComponent: (id: string) => void,
    // updateComponent: (id: string, fieldName:string, value: any) => void,
): React.ReactNode => {
    switch (setting.type) {
        case SettingType.Toggle:
            // eslint-disable-next-line no-case-declarations
            const toggleSetting = setting as ToggleSetting;
            return (
                <Toggle toggleSetting={toggleSetting} control={control} key={toggleSetting.id}/>
            );

        case SettingType.Input:
            return (
                <div key={setting.id}>
                    <label className="block">{setting.label}</label>
                    <div className="inline-flex align-middle items-center">
                    <Input
                        {...register(setting.id)}
                        defaultValue={(setting as InputSetting).value}
                        disabled={setting.disabled}
                        maxLength={(setting as InputSetting).maxCharacters || undefined}
                        placeholder={setting.tooltip}
                    />
                        <SettingTooltip tooltip={setting.tooltip}/>
                    </div>
                </div>
            );

        case SettingType.Select:
            // eslint-disable-next-line no-case-declarations
            const selectSetting = setting as SelectSetting;
            return (
                <SelectSettingComponent selectSetting={selectSetting} control={control} key={setting.id}/>
            );

        case SettingType.File:
            // eslint-disable-next-line no-case-declarations
            const fileSetting = setting as FileInputSetting;
            return (
                    <FileUploaderSetting fileSetting={fileSetting} control={control} key={setting.id}/>
            );

        case SettingType.Group:
            // eslint-disable-next-line no-case-declarations
            const groupSetting = setting as GroupSetting;
            return (
                <SettingGroup  control={control} key={setting.id} groupSetting={groupSetting} register={register} setValue={setValue}/>
            );

        case SettingType.ListSetting:
            // eslint-disable-next-line no-case-declarations
            const listSetting = setting as ListSetting;
            return (
                <SettingList control={control} key={setting.id} listSetting={listSetting} register={register} setValue={setValue} />
            );

        case SettingType.ConditionalSetting:
            // eslint-disable-next-line no-case-declarations
            const conditionalSetting = setting as ConditionalSetting;
            return (
                <SettingConditional key={setting.id} conditionalSetting={conditionalSetting} control={control} register={register} setValue={setValue}/>
            );

        default:
            return null;
    }
};

export {renderSetting};
