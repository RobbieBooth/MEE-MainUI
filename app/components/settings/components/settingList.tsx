import {GroupSetting, ListSetting} from "~/components/settings/compositeSettings";

import React, {useEffect, useState} from "react";
import {renderSetting} from "~/components/settings/greenMan/renderSetting";
import {Button} from "~/components/ui/button";
import {Plus} from "lucide-react";
import {SettingTooltip} from "~/components/settings/components/settingTooltip";
import {GroupTitle} from "~/components/settings/components/settingGroup";
import { v4 as uuidv4 } from "uuid";

enum Operations {
    Add,
    Remove
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
    const [allChildren, setAllChildren] = useState<GroupSetting[]>([]);
    const [operationsPerformed, setOperationsPerformed] = useState<{id: string, operation: Operations}[]>([]);//pass the operations to the component at the end and have it work through them

    useEffect(()=>{
        setAllChildren(listSetting.children);
    }, [listSetting.children]);

    function removeComponent(id: string) {
        const newAllChildren = allChildren.filter(child => child.id !== id);
        setAllChildren(newAllChildren);
        setOperationsPerformed((prev) => [...prev, {id:id, operation:Operations.Remove}]);
    }
    
    function addComponent() {
        const id = uuidv4();
        // Create a deep copy of the object
        const newComponent = JSON.parse(JSON.stringify(listSetting.settingToAdd));
        newComponent.id = id;
        setAllChildren([...allChildren, newComponent]);
        setOperationsPerformed((prev) => [...prev, {id:id, operation:Operations.Add}]);
    }

    return (
        <fieldset key={listSetting.id} className="space-x-3 space-y-0 rounded-md border p-4">
            <GroupTitle label={listSetting.label} tooltip={listSetting.tooltip} />

            <div className="flex flex-wrap gap-3"> {/* Use flexbox with gap for consistent spacing */}
                {allChildren.map((childSetting) => (
                    renderSetting(childSetting, control, register, setValue)
                ))}
                <Button
                    type="button"
                    onClick={() => {
                        addComponent();
                    }}
                    disabled={!listSetting.allowAddition}
                >
                    <Plus/>
                </Button>
            </div>

        </fieldset>
    );
}