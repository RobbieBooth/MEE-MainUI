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
import {OAuthUser} from "~/auth.server";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage,
    BreadcrumbSeparator
} from "~/components/ui/breadcrumb";
import {LogOut} from "lucide-react";

type ModuleName = string;
type UUID = string;

interface Tuple {
    first: ModuleName;
    second: BaseSetting;
}

interface QuizSettings {
    quizUUID: UUID;
    currentVersionUUID: UUID;
    quizSetting: BaseSetting;
    defaultModuleSettings: Record<ModuleName, BaseSetting>;
    questions: Record<UUID, Tuple>; // Using tuple to represent Pair
    newQuestions: Record<UUID, Tuple>; //
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
                    const tuple = value as Tuple; // Explicitly cast value
                    tuple.second = castToBaseSetting(tuple.second);
                    return [key as UUID, tuple];//We don't pass the key here since the key will be used on the group holding the setting, since if the setting type changes we want setting to change completely.
                }
            )
        ),
        newQuestions: Object.fromEntries(
            Object.entries(json.newQuestions || {}).map(
                ([key, value]) => {
                    const tuple = value as Tuple; // Explicitly cast value
                    tuple.second = castToBaseSetting(tuple.second);
                    return [key as UUID, tuple];//We don't pass the key here since the key will be used on the group holding the setting, since if the setting type changes we want setting to change completely.
                }
            )
        ),
        // newQuestions: (json.newQuestions || []).map(
        //     (item: any) => {
        //         const tuple = item as Tuple; // Explicitly cast value
        //         tuple.second = castToBaseSetting(tuple.second);
        //         return tuple;
        //     }
        // )
    }

}

export const DynamicForm = ({ settings, classUUID, user }: { settings: string | null, classUUID:string, user:OAuthUser}) => {
    const [baseSettings, setBaseSettings] = useState<BaseSetting[]>([]);
    const [quizSetting, setQuizSetting] = useState<BaseSetting[]>([]);
    const [questionSetting, setQuestionSetting] = useState<BaseSetting[]>([]);
    const [quizSettingsHolder, setQuizSettingsHolder] = useState<QuizSettings>();
    const [error, setError] = useState<string | null>(null);
    const methods = useForm();
    const { handleSubmit, control, register, setValue } = methods;
    const [loading, setLoading] = useState(true);

    const fetchSettingsByQuizId = async (QuizID:string|null) => {
        try {
            const response = await fetch(`http://localhost:8080/v1/api/class/${classUUID}/quiz/setting/${QuizID ?? ""}`, {
                method: "GET", // or 'POST', 'PUT', 'DELETE', etc.
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.backendJWT}`
                },
            });

            if (!response.ok) {
                if(response.status === 404) {
                    throw new Error(`Quiz by ID ${QuizID} not found.`);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data:QuizSettings = createQuizSettings(await response.json());
            setQuizSettingsHolder(data);
            setQuizSetting([data.quizSetting]);
            setQuestionSetting([createQuestionSetting(data)]);
            //Change the page url to having the new quizUUID without causing a rerender and getting the setting again.
            //This will cut request time by half theoretically.
            //This also allows us, once the quiz has been saved, to reload and get the quiz we were editing instead of a completely new one.
            window.history.replaceState(null, "Settings Page", `/class/${classUUID}/quiz/setting/${data.quizUUID}`);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred");
            setQuizSettingsHolder(undefined); // Clear previous student data
        }
        setLoading(false);
    };

    const saveQuizSettings = async (quizSettings: QuizSettings) => {
        try {
            const response = await fetch(`http://localhost:8080/v1/api/class/${classUUID}/quiz/setting/save`, {
                method: "POST",
                body: JSON.stringify(quizSettings),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.backendJWT}`
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
            displayID: true,
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
        for (const [uuid, tuple] of Object.entries(quizSettings.questions)) {
            const thisQuestionConditional: ConditionalSelectSetting = {
                ...defaultConditional, // Copy the base structure
                id: uuid, // Assign UUID
                condition: {
                    ...defaultConditional.condition,
                    id: uuidv4(), // Generate new ID for condition
                    value: [tuple.first], // Set module name as condition value
                },
                groups: {
                    ...quizSettings.defaultModuleSettings,
                    [tuple.first]: tuple.second, // Override with baseSetting
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
        const reconstructedQuizSettings = reconstructQuizSettingsHolder(data);

        saveQuizSettings(reconstructedQuizSettings);
    };

    function isListSetting(obj: any): obj is ListSetting {
        return obj && obj.type === SettingType.ListSetting && Array.isArray(obj.children);
    }


    /**
     * Gets the value of the select and the associated `BaseSetting` - if either are null then null is returned
     * @param conditional The ConditionalSelectSetting that has the settings extracted
     */
    function getConditionalValueAndSetting(conditional: ConditionalSelectSetting): { moduleName: ModuleName; setting: BaseSetting, id: UUID } | null {
        const conditionalValue = conditional.condition.value;
        if (!conditionalValue || conditionalValue.length === 0) {
            return null;
        }

        // Get the corresponding BaseSetting from the groups record
        const matchedSetting =  conditional.groups[conditionalValue[0]] ?? null;
        if (!matchedSetting) {
            return null;
        }


        return { moduleName: conditionalValue[0], setting: matchedSetting, id: conditional.id };
    }


    const reconstructQuizSettingsHolder = (data:any) =>{
        const newQuizSettings =  updateSettingRecursively(data, quizSetting);
        const newQuestionList = updateSettingRecursively(data, questionSetting);

        if(quizSettingsHolder == null){
            throw Error("Previous Quiz Holder is null");
        }
        //it should never get to this point but newQuestionSettings should have a single list element holding all the questions
        if(newQuestionList.length === 0 || !isListSetting(newQuestionList[0])){
            throw Error("Incorrect Question type");
        }

        //These are the new questions
        const newQuestionsSettings = (newQuestionList[0] as ListSetting).children;
        const questionList:Record<UUID, [ModuleName, BaseSetting]> = {};
        newQuestionsSettings.forEach((value) => {
            const values = getConditionalValueAndSetting(value as ConditionalSelectSetting);
            //Skip as its null/unassigned setting
            if(values === null){
                return;
            }
            questionList[values!.id] = [values!.moduleName, values!.setting];
        });


        // const newQuestions:Tuple[] = [];
        const newQuestions:Record<UUID, Tuple> = {}
        const previousQuestions:Record<UUID, Tuple> = {}
        Object.entries(questionList).forEach(([key, value]) => {
            if(quizSettingsHolder.questions[key]){
                previousQuestions[key] = {first:value[0], second:value[1]};
            }else{
                newQuestions[key] = {first:value[0], second:value[1]};
            }
        });
        const newQuizSettingHolder:QuizSettings = {
            ...quizSettingsHolder,
            quizSetting: newQuizSettings[0],
            newQuestions: newQuestions,
            questions: previousQuestions,
        }

        return newQuizSettingHolder;
    }

    const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent the default form submission behavior
        handleSubmit(onSubmit)(); // Use React Hook Form's handleSubmit to process the data
    };

    // useEffect(() => {
    //     setBaseSettings(parseSettings(settings));
    // }, [settings]);
    useEffect(() => {
        fetchSettingsByQuizId(settings);
    }, [settings]);




    if(loading){
        return null;
    }

    if(error){
        return (
            <div className="space-y-8 max-w-3xl mx-auto py-10 min-h-screen">
                {createSettingTitle("An Error Occurred", error)}
            </div>
        );
    }

    return (
        <div>
            {/*Temporary until we have solution to make the breadcrumbs dynamically*/}
            <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
                <a href={`/class/${classUUID}`} className="inline-flex space-x-2">
                    <LogOut className="rotate-180"/>
                </a>
                <Separator orientation="vertical" className="mr-2 h-4"/>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="/class/">
                                My Classes
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block"/>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href={`/class/${classUUID}`}>
                                Class
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block"/>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href={`/class/${classUUID}/quiz/`}>
                                Quiz
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block"/>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Setting</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>
            <FormProvider {...methods}>
                <form onSubmit={onFormSubmit} className="space-y-8 max-w-3xl mx-auto py-10 min-h-screen">
                    {createSettingTitle("Quiz Settings", "The settings for the quiz.")}
                {quizSetting.map((baseSetting) =>
                    renderSetting(baseSetting, control, register, setValue)
                )}
                <Separator className="my-4"/>
                {createSettingTitle("Question Settings", "The settings for each individual question.")}
                {questionSetting.map((baseSetting) =>
                    renderSetting(baseSetting, control, register, setValue)
                )}
                <Button type="submit">Save</Button>
            </form>
        </FormProvider>
        </div>
)
    ;
};

export function createSettingTitle(title?: string, description?: string) {
    return <div className="space-y-1">
        {title && <h3 className="text-lg font-medium leading-none">{title}</h3>}
        {description &&
            <p className="text-base text-muted-foreground">
            {description}
        </p>
        }
    </div>;
}

/**
 * Recursively updates all of the settings. It also removes the error setting
 * @param ids
 * @param settings
 */
export function updateSettingRecursively (ids: { [key: string]: any }, settings:BaseSetting[]):BaseSetting[] {
    return settings.filter(setting => setting.type !== SettingType.Error)//Remove the error ones then do all updates
        .map((setting) =>{
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
}

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