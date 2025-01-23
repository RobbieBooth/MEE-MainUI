import {Base} from "postcss-selector-parser";

enum SettingType {
    Toggle,
    Input,
    Select,
    File,
    Group,
    SettingList,
    ConditionalSetting,
}

interface ToolTip{
    tooltip: string;
}

interface Name {
    name: string;
}

interface BaseSetting extends ToolTip, Name{
    type: SettingType;
    required: boolean;
    disabled: boolean;
}

//Toggle Setting Type
enum ToggleDisplay {
    Checkbox,
    Switch,
}
interface ToggleSetting extends BaseSetting{
    type: SettingType.Toggle;
    value: boolean;
    display: ToggleDisplay
}

//Input Setting Type
interface InputSetting extends BaseSetting{
    type: SettingType.Input;
    value: string;
    // multiline: boolean;
    maxCharacters: number | null;
    maxLines: string | null;//If maxLines is > 1 then it is a multiLine Input
}

//Select Setting
interface SelectSetting extends BaseSetting{
    type: SettingType.Select;
    value: null | string[];//null for empty and will only have one item in it if multiSelect is false otherwise first item is taken
    availableValues: string[];
    multiSelect: boolean;
}

//File Input Setting Type
interface FileInputSetting extends BaseSetting{
    type: SettingType.File;
    files: File[];
    fileTypesAllowed: string; //it's easier to just allow them to give us the accept ie: .png,.jpg,.jpeg,.pdf  or   image/*
    allowMultipleFiles: boolean;
    maxCumulativeFileSizeBytes: number;
}

//Group Setting Type
interface GroupSetting extends BaseSetting{
    type: SettingType.Group;
    children: BaseSetting[];
}

//SettingList Setting Type
interface SettingList extends BaseSetting{
    type: SettingType.SettingList;
    children: GroupSetting[];
    allowAddition: boolean,
    allowRemoval: boolean,
    //Null for these means that there is no max or minimum amount (other than 0)
    maxAmount: number | null;
    minAmount: number | null;
    settingToAdd: BaseSetting;
}

//ConditionalSetting Type
interface ConditionalSetting extends BaseSetting{
    type: SettingType.ConditionalSetting;
    condition: ToggleSetting;
    childSettings: BaseSetting[];
}
