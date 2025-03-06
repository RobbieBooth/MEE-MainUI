import React from "react";

import {
    BaseSetting, ConditionalSelectSetting,
    ConditionalBoolSetting,
    FileInputSetting,
    GroupSetting,
    InputSetting,
    ListSetting,
    SelectSetting,
    SettingType,
    ToggleSetting, DescriptionSetting, ErrorSetting, TagInputSetting, DateSetting
} from "~/components/settings/compositeSettings";
import {Input} from "~/components/ui/input";
import {Toggle} from "~/components/settings/components/toggle";
import {SettingTooltip} from "~/components/settings/components/settingTooltip";
import {SelectSettingComponent} from "~/components/settings/components/selectSettingComponent";
import {FileUploaderSetting} from "~/components/settings/components/fileUploaderSetting";
import {SettingGroup} from "~/components/settings/components/settingGroup";
import {SettingList} from "~/components/settings/components/settingList";
import {SettingConditionalBool} from "~/components/settings/components/settingConditionalBool";
import {SettingConditionalSelect} from "~/components/settings/components/settingConditionalSelect";
import {createSettingTitle} from "~/components/settings/DynamicForm";
import {SettingTagInput} from "~/components/settings/components/settingTagInput";
import {Textarea} from "~/components/ui/textarea";
import {SettingDate} from "~/components/settings/components/settingDate";

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
            // eslint-disable-next-line no-case-declarations
            const inputSetting = setting as InputSetting;

            // eslint-disable-next-line no-case-declarations
            const maxRows = calculateTextAreaMaxRows(inputSetting.maxLines);
            return (
                <div key={setting.id}>
                    <label className="block">{setting.label}</label>
                    <div className="inline-flex align-middle items-center">
                        {
                            inputSetting.maxLines === "1"
                            ?
                                <Input
                                    {...register(setting.id)}
                                    defaultValue={inputSetting.value}
                                    disabled={setting.disabled}
                                    maxLength={inputSetting.maxCharacters || undefined}
                                    placeholder={setting.tooltip}
                                    // multiple={true}
                                    // max={3}
                                    // onSubmit={(event)=> event.preventDefault()}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault(); // Prevent form submission
                                        }}}
                                />
                                :
                                <Textarea
                                    {...register(setting.id)}
                                    defaultValue={inputSetting.value}
                                          disabled={setting.disabled}
                                          maxLength={inputSetting.maxCharacters || undefined}
                                          placeholder={setting.tooltip ?? undefined}
                                          onKeyDown={(event) => {
                                              const currentLines = event.currentTarget.value.split("\n").length;

                                              if (event.key === "Enter" && maxRows && currentLines >= maxRows) {
                                                  event.preventDefault();
                                                  console.warn(`Max lines reached: ${maxRows}`);
                                              }
                                          }
                                          }
                                />

                        }

                        {setting.tooltip && <SettingTooltip tooltip={setting.tooltip}/>}
                    </div>
                </div>
            );
        case SettingType.TagInput:
            // eslint-disable-next-line no-case-declarations
            const tagInputSetting = setting as TagInputSetting;
            return (
                <SettingTagInput tagInputSetting={tagInputSetting} control={control} key={setting.id}/>
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
        case SettingType.Date:
            // eslint-disable-next-line no-case-declarations
            const dateSetting = setting as DateSetting;
            return(
                    <SettingDate dateSetting={dateSetting} control={control} key={setting.id}/>
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

        case SettingType.ConditionalBool:
            // eslint-disable-next-line no-case-declarations
            const conditionalSetting = setting as ConditionalBoolSetting;
            return (
                <SettingConditionalBool key={setting.id} conditionalSetting={conditionalSetting} control={control} register={register} setValue={setValue}/>
            );
        case SettingType.ConditionalSelect:
            // eslint-disable-next-line no-case-declarations
            const conditionalSelect = setting as ConditionalSelectSetting;
            return(
                <SettingConditionalSelect conditionalSelect={conditionalSelect} control={control} register={register} setValue={setValue}/>
            );
        case SettingType.Description:
            // eslint-disable-next-line no-case-declarations
            const descriptionSetting = setting as DescriptionSetting;
            return (
                createSettingTitle(descriptionSetting.title ?? undefined, descriptionSetting.value ?? undefined)
            );
        case SettingType.Error:
            // eslint-disable-next-line no-case-declarations
            const errorSetting = setting as ErrorSetting;
            //Same as createSettingTitle but red for error as title
            return (
                <div className="space-y-1">
                    <h3 className="text-lg font-medium leading-none accent-red-600">{`Error${errorSetting.title ? `: ${errorSetting.title}` : ""}`}</h3>
                    {errorSetting.value &&
                        <p className="text-base text-muted-foreground">
                            {errorSetting.value}
                        </p>
                    }
                </div>
            );

        default:
            return null;
    }
};

function calculateTextAreaMaxRows(maxLines:string | null): number | undefined {
        if(maxLines == null){
            return undefined;
        }
        //Convert to number
        const maxLinesNumber = Number(maxLines); // Convert string to number
        if (isNaN(maxLinesNumber)) {
            console.error(`Invalid maxLines value: "${maxLines}". Expected a number.`);
            return undefined;
        }
        return maxLinesNumber;
}

export {renderSetting};
