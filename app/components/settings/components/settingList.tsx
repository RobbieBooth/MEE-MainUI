import {
    BaseSetting, ConditionalBoolSetting, ConditionalSelectSetting,
    GroupSetting,
    ListSetting, recursivelyGetIDs,
    recursivelyUpdateBaseSettingID, SettingType
} from "~/components/settings/compositeSettings";

import React, {useEffect, useState} from "react";
import {renderSetting} from "~/components/settings/greenMan/renderSetting";
import {Button} from "~/components/ui/button";
import {Plus} from "lucide-react";
import {SettingTooltip} from "~/components/settings/components/settingTooltip";
import {GroupTitle} from "~/components/settings/components/settingGroup";
import { v4 as uuidv4 } from "uuid";
import {Controller} from "react-hook-form";

export enum Operations {
    Add,
    Remove
}
export interface SettingListOperation {
    id: IDStore;
    operation: Operations;
}

export interface IDStore{
    id: string;
    children: IDStore[];
    conditional?: IDStore;
}

export function SettingList({
                           listSetting,
                           control,
                                 register,
                                 setValue,
                       }: {
    listSetting: ListSetting;
    control: any; // Update with the correct type from your form library
    register: any,
    setValue: any,
}): JSX.Element {
    //bad way to do it but seems like only way to stop constant re-renders 
    const [allChildren, setAllChildren] = useState<BaseSetting[]>([]);
    const [operationsPerformed, setOperationsPerformed] = useState<SettingListOperation[]>([]);//pass the operations to the component at the end and have it work through them

    useEffect(()=>{
        setAllChildren(listSetting.children);
        setOperationsPerformed([]);
    }, [listSetting.children]);

    function removeComponent(id: string) {
        const newAllChildren = allChildren.filter(child => child.id !== id);
        setAllChildren(newAllChildren);
        setOperationsPerformed((prev) => [...prev, {id:{id:id, children:[]}, operation:Operations.Remove}]);
    }
    
    function addComponent(field:(...event: any[]) => void) {

        // Create a deep copy of the object
        let newComponent = JSON.parse(JSON.stringify(listSetting.settingToAdd));
        newComponent = recursivelyUpdateBaseSettingID(newComponent);
        const ids = recursivelyGetIDs(newComponent);//terrible way to get all the ids - if it wasn't for the thousands of updates problem for updating individually this would never be here.
        const newOperationsArray = [...operationsPerformed, {id:ids, operation:Operations.Add}];
        field(newOperationsArray);
        setOperationsPerformed(newOperationsArray);
        setAllChildren([...allChildren, newComponent]);
    }

    return (
        <Controller
            control={control}
            name={listSetting.id} // Use the id as the name
            defaultValue={operationsPerformed} // Set the default value
            render={({field}) => (
        <fieldset key={listSetting.id} className="space-x-3 space-y-0 rounded-md border p-4">
            <GroupTitle label={listSetting.label} tooltip={listSetting.tooltip} />

            <div className="flex flex-wrap gap-3" key={listSetting.id}> {/* Use flexbox with gap for consistent spacing */}
                {allChildren.map((childSetting) => (
                    renderSetting(childSetting, control, register, setValue)
                ))}
                <Button
                    type="button"
                    onClick={() => {
                        addComponent(field.onChange);

                    }}
                    disabled={!listSetting.allowAddition}
                >
                    <Plus/>
                </Button>
            </div>

        </fieldset>
            )}/>
    );
}