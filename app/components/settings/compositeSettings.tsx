// Enums
import {v4 as uuidv4} from "uuid";
import {IDStore, Operations, SettingListOperation} from "~/components/settings/components/settingList";

export enum SettingType {
    //leafs
    Toggle = "Toggle",
    Input = "Input",
    TagInput = "TagInput",
    Select = "Select",
    File = "File",
    Date = "Date",

    //Composite style
    Group = "Group",
    ListSetting = "ListSetting",
    ConditionalBool = "ConditionalBool",
    ConditionalSelect = "ConditionalSelect",

    //Cosmetic not used
    Description = "Description",
    Error = "Error"
}

export enum ToggleDisplayType {
    Checkbox= "Checkbox",
    Switch = "Switch",
}

// Interfaces
export interface TooltipSetting {
    tooltip: string | null;
}

export interface Name {
    label: string | null;
}

export interface BaseSetting extends TooltipSetting, Name {
    type: SettingType;
    required: boolean;
    disabled: boolean;
    id: string;//Only for form unique elements etc - gets assigned by front end
}

/**
 * Used when an error has occurred - does not get saved to settings
 */
export interface ErrorSetting extends BaseSetting {
    type: SettingType.Error;
    title: string | null;
    value: string;//error
}

/**
 * Used to describe a setting - it is not intended to be used as an actual setting
 */
export interface DescriptionSetting extends BaseSetting {
    type: SettingType.Description;
    title: string | null;
    value: string | null;//error
}

// Leaf: ToggleSetting
export interface ToggleSetting extends BaseSetting {
    type: SettingType.Toggle;
    value: boolean;
    display: ToggleDisplayType;
}

// Leaf: InputSetting
export interface InputSetting extends BaseSetting {
    type: SettingType.Input;
    value: string;
    maxCharacters: number | null;
    maxLines: string | null; // If maxLines > 1, it's a multi-line input
}

// Leaf: TagInput
/**
 * An input text box where when entered it adds a value - similar to multi select but with no predefined options
 */
export interface TagInputSetting extends BaseSetting {
    type: SettingType.TagInput;
    value: string[];
    maxEntries: number | null;
}

// Leaf: SelectSetting
export interface SelectSetting extends BaseSetting {
    type: SettingType.Select;
    value: null | string[]; // Null for empty; single item if multiSelect is false
    availableValues: string[];
    multiSelect: boolean;
}

//https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types
//https://react-dropzone.js.org/#!/Accepting%20specific%20file%20types
type FileAcceptType = {
    [key: string]: string[];
};
// Example usage:
// const accept: AcceptType = {
//     "image/jpeg": [],
//     "image/png": [".png"],
//     "application/pdf": [".pdf", ".PDF"],
// };

// Leaf: FileInputSetting
export interface FileInputSetting extends BaseSetting {
    type: SettingType.File;
    files: File[];
    fileTypesAllowed: FileAcceptType; // e.g., ".png,.jpg,.pdf" or "image/*"
    // allowMultipleFiles: boolean;
    maxFileCount: number;// default is 1 if more than that then we allow multiple files
    maxCumulativeFileSizeBytes: number;
}

// Leaf: DateSetting
export interface DateSetting extends BaseSetting {
    type: SettingType.Date;
    unixTimestamp: number,
}

// Composite: GroupSetting
export interface GroupSetting extends BaseSetting {
    type: SettingType.Group;
    children: BaseSetting[];
    haveBorder?: boolean;
    displayID?: boolean;//For when we want to identify questions for other questions to interact with
}

// Composite: SettingList
export interface ListSetting extends BaseSetting {
    type: SettingType.ListSetting;
    children: BaseSetting[];
    allowAddition: boolean;
    allowRemoval: boolean;
    maxAmount: number | null; // Null = no max
    minAmount: number | null; // Null = no min
    settingToAdd: BaseSetting;
    haveBorder?: boolean;
}

// Composite: ConditionalSetting
export interface ConditionalBoolSetting extends BaseSetting {
    type: SettingType.ConditionalBool;
    condition: ToggleSetting;
    children: BaseSetting;
    not: boolean | undefined;// it will not the condition - if undefined or false it will act as normal
}

// Multi select must be false as it selects one option from group
export interface ConditionalSelectSetting extends BaseSetting {
    type: SettingType.ConditionalSelect;
    condition: SelectSetting; // The SelectSetting acts as the condition
    groups: Record<string, BaseSetting>; // A map where each key corresponds to a value in the SelectSetting, and the value is a GroupSetting
    displayID?: boolean;
}

/**
 * Used when you would like to change the ids of a BaseSetting and all of its children's ids.
 * @param baseSetting setting to update ids
 * @returns BaseSetting the setting with the updated ids
 */
export function recursivelyUpdateBaseSettingID(baseSetting:BaseSetting):BaseSetting {
    switch (baseSetting.type) {
        //Update Leafs
        case SettingType.Toggle:
        case SettingType.Input:
        case SettingType.TagInput:
        case SettingType.Select:
        case SettingType.File:
        case SettingType.Date:
        case SettingType.Error:
        case SettingType.Description:
            baseSetting.id = uuidv4();
            return baseSetting;

        //Update composites:
        case SettingType.Group:
            // eslint-disable-next-line no-case-declarations
            const group = baseSetting as GroupSetting;
            group.children = group.children.map(recursivelyUpdateBaseSettingID);
            group.id = uuidv4();
            return group;
        case SettingType.ListSetting:
            // eslint-disable-next-line no-case-declarations
            const listSetting = baseSetting as ListSetting;
            listSetting.children = listSetting.children.map(recursivelyUpdateBaseSettingID);
            listSetting.settingToAdd = recursivelyUpdateBaseSettingID(listSetting.settingToAdd);
            listSetting.id = uuidv4();
            return listSetting;
        case SettingType.ConditionalBool:
            // eslint-disable-next-line no-case-declarations
            const conditionalBool = baseSetting as ConditionalBoolSetting;
            conditionalBool.children = recursivelyUpdateBaseSettingID(conditionalBool.children);
            conditionalBool.condition = recursivelyUpdateBaseSettingID(conditionalBool.condition) as ToggleSetting;
            conditionalBool.id = uuidv4();
            return conditionalBool;
        case SettingType.ConditionalSelect:
            // eslint-disable-next-line no-case-declarations
            const conditionalSelectSetting = baseSetting as ConditionalSelectSetting;
            conditionalSelectSetting.condition = recursivelyUpdateBaseSettingID(conditionalSelectSetting.condition) as SelectSetting;
            conditionalSelectSetting.groups = Object.fromEntries(
                Object.entries(conditionalSelectSetting.groups).map(([key, setting]) => [
                    key,
                    recursivelyUpdateBaseSettingID(setting),
                ])
            );
            conditionalSelectSetting.id = uuidv4();
            return conditionalSelectSetting;
    }
    // throw Error(`Unknown Type for updating ids on setting: \`${baseSetting.type}\``);
}

export function castToBaseSetting(json: any, settingID?:string): BaseSetting {
    const settingUUID = settingID ?? uuidv4();//Use id if its specified
    switch (json.type) {
        case SettingType.Toggle:
            return {
                ...json,
                id: settingUUID,
                type: SettingType.Toggle,
                value: json.value,
                display: json.display,
            } as ToggleSetting;

        case SettingType.Input:
            return {
                ...json,
                id: settingUUID,
                type: SettingType.Input,
                value: json.value,
                maxCharacters: json.maxCharacters,
                maxLines: json.maxLines,
            } as InputSetting;
        case SettingType.TagInput:
            return {
                ...json,
                id: settingUUID,
                type: SettingType.TagInput,
                value: json.value ?? [],
                maxEntries: json.maxEntries,
            } as TagInputSetting;

        case SettingType.Select:
            return {
                ...json,
                id: settingUUID,
                type: SettingType.Select,
                value: json.value,
                availableValues: json.availableValues,
                multiSelect: json.multiSelect,
            } as SelectSetting;

        case SettingType.File:
            return {
                ...json,
                id: settingUUID,
                type: SettingType.File,
                files: json.files,
                fileTypesAllowed: json.fileTypesAllowed,
                allowMultipleFiles: json.allowMultipleFiles,
                maxCumulativeFileSizeBytes: json.maxCumulativeFileSizeBytes,
            } as FileInputSetting;
        case SettingType.Date:
            return {
                ...json,
                id: settingUUID,
                type: SettingType.Date,
                unixTimestamp: json.unixTimestamp ?? Date.now(),
            } as DateSetting;
        case SettingType.Error:
            return{
                ...json,
                id: settingUUID,
                type: SettingType.Error,
                title: json.title,
                value: json.value,
            } as ErrorSetting;
        case SettingType.Description:
            return{
                ...json,
                id: settingUUID,
                type: SettingType.Description,
                title: json.title,
                value: json.value,
            } as DescriptionSetting;
        case SettingType.Group:
            return {
                ...json,
                id: settingUUID,
                type: SettingType.Group,
                haveBorder: json.haveBorder ?? true,
                displayID: json.displayID ?? false,
                children: json.children.map((child: any) => castToBaseSetting(child)),
            } as GroupSetting;

        case SettingType.ListSetting:
            return {
                ...json,
                id: settingUUID,
                type: SettingType.ListSetting,
                children: json.children.map((child: any) => castToBaseSetting(child)),
                allowAddition: json.allowAddition,
                allowRemoval: json.allowRemoval,
                maxAmount: json.maxAmount,
                minAmount: json.minAmount,
                settingToAdd: json.settingToAdd,
                haveBorder: json.haveBorder ?? true,
            } as ListSetting;

        case SettingType.ConditionalBool:
            return {
                ...json,
                id: settingUUID,
                type: SettingType.ConditionalBool,
                condition: castToBaseSetting(json.condition) as ToggleSetting,
                children: castToBaseSetting(json.children) as BaseSetting,
                not: json.not,
            } as ConditionalBoolSetting;

        case SettingType.ConditionalSelect:
            return {
                ...json,
                id: settingUUID,
                displayID: json.displayID ?? false,
                type: SettingType.ConditionalSelect,
                condition: castToBaseSetting(json.condition) as SelectSetting,
                groups: Object.fromEntries(
                    Object.entries(json.groups).map(([key, group]) => [
                        key,
                        castToBaseSetting(group) as BaseSetting,
                    ])
                ),
            }
        default:
            throw new Error(`Unknown setting type: ${json.type}`);
    }
}

export function parseSettings(jsonInput: string): BaseSetting[] {
    try {
        const parsed = JSON.parse(jsonInput);
        if (!Array.isArray(parsed)) {
            throw new Error("Input JSON must be an array of settings");
        }
        return parsed.map((item) => castToBaseSetting(item));
    } catch (error) {
        console.error("Failed to parse settings:", error);
        throw error;
    }
}


export function updateSettingData(setting:BaseSetting, newValue:any) {
    switch (setting.type) {
        case SettingType.Toggle:
            // eslint-disable-next-line no-case-declarations
            const toggleSetting = setting as ToggleSetting;
            toggleSetting.value = newValue;
            return toggleSetting;
        case SettingType.Input:
            // eslint-disable-next-line no-case-declarations
            const inputSetting = setting as InputSetting;
            inputSetting.value = newValue;
            return inputSetting;
        case SettingType.TagInput:
            // eslint-disable-next-line no-case-declarations
            const tagInputSetting = setting as TagInputSetting;
            tagInputSetting.value = newValue;
            return tagInputSetting;
        case SettingType.Select:
            // eslint-disable-next-line no-case-declarations
            const selectSetting = setting as SelectSetting;
            if(!selectSetting.multiSelect){
                selectSetting.value = [newValue];
            }else{
                selectSetting.value = newValue;
            }
            return selectSetting;
        case SettingType.File:
            // eslint-disable-next-line no-case-declarations
            const fileSetting = setting as FileInputSetting;
            fileSetting.files = newValue;
            return fileSetting;
        case SettingType.Date:
            // eslint-disable-next-line no-case-declarations
            const dateSetting = setting as DateSetting;
            dateSetting.unixTimestamp = newValue;
            return dateSetting;
        case SettingType.Group:
            // eslint-disable-next-line no-case-declarations
            //Throw error as we cant update this
            // throw Error("Cant update group setting");
            return setting as GroupSetting; //cannot update group setting
        case SettingType.ListSetting:
            // eslint-disable-next-line no-case-declarations
            const listSetting = setting as ListSetting;
            // eslint-disable-next-line no-case-declarations
            const listOperations = (newValue || []) as SettingListOperation[];

            return updateListSettingValue(listSetting, listOperations);
        case SettingType.ConditionalBool:
            // eslint-disable-next-line no-case-declarations
            // conditionalSetting.
            //everything should get done for us, toggle should get updated and so should children
            return setting as ConditionalBoolSetting;
        case SettingType.ConditionalSelect:
            //everything should get done for us, select should get updated and so should group children
            return setting as ConditionalSelectSetting;
            //We don't need to update error or description so just return setting
        case SettingType.Error:
        case SettingType.Description:
            return setting;
        default:
            throw new Error(`Unknown setting type: ${setting.type}`);
    }
}

function updateListSettingValue(setting:ListSetting, operations:SettingListOperation[]){
    console.log(operations);
    // if(operations.length === 0){
    //     return setting;
    // }

    //Operation to make request operations more effective
    const childrenMap = new Map<string, BaseSetting>();
    setting.children.forEach((child)=>{
        childrenMap.set(child.id, child);
    });

    // const addOperations = operations.filter((value) => value.operation === Operations.Add);
    // const removeOperations = operations.filter((value) => value.operation === Operations.Remove);
    operations.forEach((value) =>{
        if(value.operation === Operations.Add){
            if(childrenMap.has(value.id.id)){
                return;
            }

            const newComponent = JSON.parse(JSON.stringify(setting.settingToAdd));
            recursivelySetIDs(newComponent, value.id);
            childrenMap.set(newComponent.id, newComponent);
            return;
        }

        if(value.operation === Operations.Remove){
            childrenMap.delete(value.id.id);
            return;
        }
    });

    setting.children = Array.from(childrenMap.values());
    return setting;
}

export function recursivelySetIDs(baseSetting: BaseSetting, idStore: IDStore): void {
    baseSetting.id = idStore.id;
    switch (baseSetting.type) {
        case SettingType.Toggle:
        case SettingType.Input:
        case SettingType.TagInput:
        case SettingType.Select:
        case SettingType.File:
        case SettingType.Description:
        case SettingType.Error:
            return;
        case SettingType.Group:
            // eslint-disable-next-line no-case-declarations
            const groupSetting = baseSetting as GroupSetting;
            groupSetting.children.forEach((child, index) => recursivelySetIDs(child, idStore.children[index]));
            return;
        case SettingType.ListSetting:
            // eslint-disable-next-line no-case-declarations
            const listSetting = baseSetting as ListSetting;
            listSetting.children.forEach((child, index) => recursivelySetIDs(child, idStore.children[index]));
            return;
        case SettingType.ConditionalBool:
            // eslint-disable-next-line no-case-declarations
            const conditionalBool = baseSetting as ConditionalBoolSetting;
            recursivelySetIDs(conditionalBool.children, idStore.children[0]);
            if (idStore.conditional) {
                recursivelySetIDs(conditionalBool.condition, idStore.conditional);
            }
            return;
        case SettingType.ConditionalSelect:
            // eslint-disable-next-line no-case-declarations
            const conditionalSelectSetting = baseSetting as ConditionalSelectSetting;
            Object.values(conditionalSelectSetting.groups).forEach((value, index) => {
                recursivelySetIDs(value, idStore.children[index]);
            });
            if (idStore.conditional) {
                recursivelySetIDs(conditionalSelectSetting.condition, idStore.conditional);
            }
            return;
    }
}

/**
 * Very annoying side effect of creating all the new ids is it has broke the logic of the project so this is used to get all of the ids and update them upon submission.
 */
export function recursivelyGetIDs(baseSetting:BaseSetting):IDStore {
    let childIds = [];
    let conditionalId = undefined;
    switch(baseSetting.type) {
        case SettingType.Toggle:
        case SettingType.Input:
        case SettingType.TagInput:
        case SettingType.Select:
        case SettingType.File:
        case SettingType.Date:
        case SettingType.Description:
        case SettingType.Error:
            return {children: [], id: baseSetting.id};
        case SettingType.Group:
            // eslint-disable-next-line no-case-declarations
            const groupSetting = baseSetting as GroupSetting;
            childIds = groupSetting.children.map(recursivelyGetIDs);
            return {id: groupSetting.id, children: childIds};
        case SettingType.ListSetting:
            // eslint-disable-next-line no-case-declarations
            const listSetting = baseSetting as ListSetting;
            childIds = listSetting.children.map(recursivelyGetIDs);
            return {id: listSetting.id, children: childIds};
        case SettingType.ConditionalBool:
            // eslint-disable-next-line no-case-declarations
            const conditionalBool = baseSetting as ConditionalBoolSetting;
            childIds = [recursivelyGetIDs(conditionalBool.children)];
            conditionalId = recursivelyGetIDs(conditionalBool.condition);
            return {id: conditionalBool.id, children: childIds, conditional: conditionalId};
        case SettingType.ConditionalSelect:
            // eslint-disable-next-line no-case-declarations
            const conditionalSelectSetting = baseSetting as ConditionalSelectSetting;
            childIds = Object.values(conditionalSelectSetting.groups).map((value) => recursivelyGetIDs(value));
            conditionalId = recursivelyGetIDs(conditionalSelectSetting.condition);
            return {id: conditionalSelectSetting.id, children: childIds, conditional: conditionalId};

    }
}