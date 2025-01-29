import React, {useEffect, useState} from "react";
import { useForm, FormProvider } from "react-hook-form";
import { renderSetting } from "./renderSetting";
import {Button} from "~/components/ui/button";
import {
    BaseSetting, ConditionalSelectSetting, ConditionalBoolSetting, GroupSetting, ListSetting,
    parseSettings, SelectSetting,
    SettingType,
    ToggleSetting,
    updateSettingData
} from "~/components/settings/compositeSettings"; // Import the utility function

export const DynamicForm = ({ settings }: { settings: string }) => {
    const [baseSettings, setBaseSettings] = useState<BaseSetting[]>([]);
    const methods = useForm();
    const { handleSubmit, control, register, setValue } = methods;

    const onSubmit = (data: any) => {
        console.log("Form Submitted:", data);
        const newSettings = updateSettingRecursively(data, baseSettings);
        console.log(newSettings);
        setBaseSettings(newSettings);
    };

    const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent the default form submission behavior
        handleSubmit(onSubmit)(); // Use React Hook Form's handleSubmit to process the data
    };

    useEffect(() => {
        setBaseSettings(parseSettings(settings));
    }, [settings]);


    const updateSettingRecursively = (ids: { [key: string]: any }, settings:BaseSetting[])=> {
        return settings.map((setting) =>{
            let baseSetting = setting;
            const id = baseSetting.id;
            //big o of o(1) since has table
            if (id in ids) {
                const value = ids[id];
                baseSetting = updateSettingData(baseSetting, value);
            }

            //Run through composites and update their children
            switch (baseSetting.type) {
                case SettingType.Group:
                    // eslint-disable-next-line no-case-declarations
                    const groupSetting = baseSetting as GroupSetting;
                    groupSetting.children = updateSettingRecursively(ids, groupSetting.children);
                    return groupSetting;
                case SettingType.ListSetting:
                    // eslint-disable-next-line no-case-declarations
                    const listSetting = baseSetting as ListSetting;
                    listSetting.children = updateSettingRecursively(ids, listSetting.children) as GroupSetting[];
                    return listSetting;
                case SettingType.ConditionalBool:
                    // eslint-disable-next-line no-case-declarations
                    let conditionalSetting = baseSetting as ConditionalBoolSetting;
                    conditionalSetting = updateBoolConditionalData(ids, conditionalSetting);
                    return conditionalSetting;
                case SettingType.ConditionalSelect:
                    // eslint-disable-next-line no-case-declarations
                    let conditionalSelect = baseSetting as ConditionalSelectSetting;
                    conditionalSelect = updateSelectConditionalData(ids, conditionalSelect);
                    return conditionalSelect
            }
            return baseSetting;
        })
    };

    const updateBoolConditionalData = (ids: { [key: string]: any }, setting:ConditionalBoolSetting)=> {
        const newSetting = setting;
        const toggleSetting = newSetting.condition;
        if (toggleSetting.id in ids) {
            const value = ids[toggleSetting.id];
            newSetting.condition = updateSettingData(toggleSetting, value) as ToggleSetting;
        }

        const groupSetting = setting.group as GroupSetting;
        groupSetting.children = updateSettingRecursively(ids, groupSetting.children);
        newSetting.group = groupSetting;
        return newSetting;
    }

    const updateSelectConditionalData = (ids: { [p: string]: any }, conditionalSelect: ConditionalSelectSetting) => {
        const newSetting = conditionalSelect;
        const select = newSetting.condition;
        if (select.id in ids) {
            const value = ids[select.id];
            newSetting.condition = updateSettingData(select, value) as SelectSetting;
        }

        Object.entries(newSetting.groups).forEach(([key, group]) => {
            //It will recursively go through children by going per group
            newSetting.groups[key] = updateSettingRecursively(ids, [group])[0] as GroupSetting;
        });

        return newSetting;
    };


    return (
        <FormProvider {...methods}>
            <form onSubmit={onFormSubmit} className="space-y-8 max-w-3xl mx-auto py-10">
                {baseSettings.map((baseSetting) =>
                    renderSetting(baseSetting, control, register, setValue)
                )}
                <Button type="submit">Submit</Button>
            </form>
        </FormProvider>
    );
};
