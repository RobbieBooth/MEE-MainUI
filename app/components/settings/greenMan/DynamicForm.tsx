import React, {useEffect, useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import {renderSetting} from "./renderSetting";
import {Button} from "~/components/ui/button";
import {
    BaseSetting,
    castToBaseSetting,
    ConditionalBoolSetting,
    ConditionalSelectSetting,
    GroupSetting,
    ListSetting,
    SelectSetting,
    SettingType,
    ToggleSetting,
    updateSettingData
} from "~/components/settings/compositeSettings";
import {Separator} from "~/components/ui/separator"; // Import the utility function
import {v4 as uuidv4} from "uuid";


type ModuleName = string;
type UUID = string;

interface QuizSettings {
    quizUUID: UUID;
    currentVersionUUID: UUID;
    quizSetting: BaseSetting;
    defaultModuleSettings: Record<ModuleName, BaseSetting>;
    questions: Record<UUID, [ModuleName, BaseSetting]>; // Using tuple to represent Pair
    newQuestions: [ModuleName, BaseSetting][]; // Array of tuples
}

function createQuizSettings(json:any):QuizSettings {
    return {
        quizUUID: json.quizUUID,
        currentVersionUUID: json.currentVersionUUID,
        quizSetting: castToBaseSetting(json.quizSetting),
        defaultModuleSettings: Object.fromEntries(
            Object.entries(json.defaultModuleSettings || {}).map(
                ([key, value]) => [key, castToBaseSetting(value)]
            )
        ),
        questions: Object.fromEntries(
            Object.entries(json.questions || {}).map(
                ([key, value]) => {
                    const [label, setting] = value as [string, any]; // Explicitly cast value
                    return [key as UUID, [label, castToBaseSetting(setting)]];//We don't pass the key here since the key will be used on the group holding the setting, since if the setting type changes we want setting to change completely.
                }
            )
        ),
        newQuestions: (json.newQuestions || []).map(
            (item: any) => [item[0], castToBaseSetting(item[1])]
        )
    }

}

export const DynamicForm = ({ settings }: { settings: string }) => {
    const [baseSettings, setBaseSettings] = useState<BaseSetting[]>([]);
    const [quizSetting, setQuizSetting] = useState<BaseSetting[]>([]);
    const [questionSetting, setQuestionSetting] = useState<BaseSetting[]>([]);
    const [quizSettingsHolder, setQuizSettingsHolder] = useState<QuizSettings>();
    const [error, setError] = useState<string | null>(null);
    const methods = useForm();
    const { handleSubmit, control, register, setValue } = methods;

    const fetchSettingsByQuizId = async (QuizID:string|null) => {
        try {
            const response = await fetch(`http://localhost:8080/v1/api/setting/${QuizID ?? ""}`, {
                method: "GET", // or 'POST', 'PUT', 'DELETE', etc.
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data:QuizSettings = createQuizSettings(await response.json());
            setQuizSettingsHolder(data);
            setQuizSetting([data.quizSetting]);
            setQuestionSetting([createQuestionSetting(data)]);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred");
            setQuizSettingsHolder(undefined); // Clear previous student data
        }
    };

    const createQuestionSetting = (quizSettings:QuizSettings):BaseSetting =>{
        const defaultConditional:ConditionalSelectSetting = {
            disabled: false,
            required: false,
            id: uuidv4(),
            label: null,
            tooltip: null,
            type: SettingType.ConditionalSelect,
            condition: {
                type: SettingType.Select,
                value: null,
                availableValues: Object.keys(quizSettings.defaultModuleSettings),
                multiSelect: false,
                required: false,
                disabled: false,
                id: uuidv4(),
                tooltip: "Select a module for this question to be.",
                label: "Question Module"
            },
            groups: quizSettings.defaultModuleSettings
        }
        
        const allQuestions:ConditionalSelectSetting[] = [];
        for (const [uuid, [moduleName, baseSetting]] of Object.entries(quizSettings.questions)) {
            const thisQuestionConditional: ConditionalSelectSetting = {
                ...defaultConditional, // Copy the base structure
                id: uuid, // Assign UUID
                condition: {
                    ...defaultConditional.condition,
                    id: uuidv4(), // Generate new ID for condition
                    value: [moduleName], // Set module name as condition value
                },
                groups: {
                    ...quizSettings.defaultModuleSettings,
                    [moduleName]: baseSetting, // Override with baseSetting
                },
            };
            allQuestions.push(thisQuestionConditional);
        }
        const listSetting:ListSetting = {
            allowAddition: true,
            allowRemoval: true,
            disabled: false,
            id: uuidv4(),
            label: "Quiz Questions",
            maxAmount: null,
            minAmount: null,
            required: false,
            settingToAdd: defaultConditional,
            tooltip: "All the questions in the quiz, click plus to add more",
            type: SettingType.ListSetting,
            children: allQuestions
        }
        return listSetting;
    }


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

    // useEffect(() => {
    //     setBaseSettings(parseSettings(settings));
    // }, [settings]);
    useEffect(() => {
        fetchSettingsByQuizId(null);
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
                    listSetting.children = updateSettingRecursively(ids, listSetting.children) as BaseSetting[];
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

        // const groupSetting = setting.group as GroupSetting;
        // groupSetting.children = updateSettingRecursively(ids, groupSetting.children);
        newSetting.children = updateSettingRecursively(ids, [setting.children])[0];
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
            newSetting.groups[key] = updateSettingRecursively(ids, [group])[0];
        });

        return newSetting;
    };


    return (
        <FormProvider {...methods}>
            <form onSubmit={onFormSubmit} className="space-y-8 max-w-3xl mx-auto py-10">
                {createSettingTitle("Quiz Settings", "The settings for the quiz.")}
                {quizSetting.map((baseSetting) =>
                    renderSetting(baseSetting, control, register, setValue)
                )}
                <Separator className="my-4"/>
                {createSettingTitle("Question Settings", "The settings for each individual question.")}
                {questionSetting.map((baseSetting) =>
                    renderSetting(baseSetting, control, register, setValue)
                )}
                <Button type="submit">Submit</Button>
            </form>
        </FormProvider>
    );
};

function createSettingTitle(title:string, description?:string) {
    return <div className="space-y-1">
        <h3 className="text-lg font-medium leading-none">{title}</h3>
        {description &&
        <p className="text-base text-muted-foreground">
            {description}
        </p>
        }
    </div>;
}