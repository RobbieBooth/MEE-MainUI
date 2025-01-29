// Enums
import {v4 as uuidv4} from "uuid";
import {Operations, SettingListOperation} from "~/components/settings/components/settingList";

export enum SettingType {
    Toggle = "Toggle",
    Input = "Input",
    Select = "Select",
    File = "File",
    Group = "Group",
    ListSetting = "ListSetting",
    ConditionalBool = "ConditionalBool",
    ConditionalSelect = "ConditionalSelect",
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

// Composite: GroupSetting
export interface GroupSetting extends BaseSetting {
    type: SettingType.Group;
    children: BaseSetting[];
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
}

function castToBaseSetting(json: any): BaseSetting {
    const settingUUID = uuidv4();
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

        case SettingType.Group:
            return {
                ...json,
                id: settingUUID,
                type: SettingType.Group,
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
            } as ListSetting;

        case SettingType.ConditionalBool:
            console.log(json.not);
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
        return parsed.map(castToBaseSetting);
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
            if(childrenMap.has(value.id)){
                return;
            }

            const newComponent = JSON.parse(JSON.stringify(setting.settingToAdd));
            newComponent.id = value.id;
            childrenMap.set(newComponent.id, newComponent);
            return;
        }

        if(value.operation === Operations.Remove){
            childrenMap.delete(value.id);
            return;
        }
    });

    setting.children = Array.from(childrenMap.values());
    return setting;
}