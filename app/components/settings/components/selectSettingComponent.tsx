import {SelectSetting} from "~/components/settings/compositeSettings";
import {Controller} from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "~/components/ui/select";
import React from "react";
import {SettingTooltip} from "~/components/settings/components/settingTooltip";
import {
    MultiSelector,
    MultiSelectorContent,
    MultiSelectorInput, MultiSelectorItem, MultiSelectorList,
    MultiSelectorTrigger
} from "~/components/ui/multi-select";

export function SelectSettingComponent(
    {
        selectSetting,
        control,
        updateValue,
    }:{
        selectSetting:SelectSetting
        control: any; // Update with the correct type from your form library
        updateValue?: (value:string[]) => void;
}) {
    return(
        <div key={selectSetting.id}>
            <label className="block">{selectSetting.label}</label>
            <div className="inline-flex align-middle items-center">
                {!selectSetting.multiSelect
                    ?
                    <Controller
                        control={control}
                        name={selectSetting.id}
                        defaultValue={selectSetting.value != null && selectSetting.value.length > 0 ? selectSetting.value[0] : undefined}
                        render={({field}) => (
                            <Select
                                defaultValue={field.value}
                                value={field.value}
                                onValueChange={(selected)=>{
                                    field.onChange(selected);

                                    if(updateValue != null){
                                        updateValue([selected]);
                                    }
                                }}>

                                <SelectTrigger className="w-[400px]">
                                    <SelectValue placeholder={selectSetting.tooltip}/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>{selectSetting.label}</SelectLabel>
                                        {selectSetting.availableValues.map((value, index) => (
                                            <SelectItem value={value}
                                                        key={`${selectSetting.id}_${index}`}>{value}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    :
                    <Controller
                        control={control}
                        name={selectSetting.id}
                        defaultValue={selectSetting.value || []}
                        render={({field}) => (
                            <MultiSelector
                            values={field.value}
                            onValuesChange={(selected)=>{
                                field.onChange(selected);

                                if(updateValue != null){
                                    updateValue(selected);
                                }
                            }}
                            loop
                            className="w-[400px]"
                        >
                            <MultiSelectorTrigger>
                                <MultiSelectorInput placeholder={selectSetting.tooltip == null ? undefined : selectSetting.tooltip} />
                            </MultiSelectorTrigger>
                            <MultiSelectorContent>
                                <MultiSelectorList>
                                    {selectSetting.availableValues.map((value, index) => (
                                        <MultiSelectorItem value={value} key={`${selectSetting.id}_${index}`}>{value}</MultiSelectorItem>
                                    ))}
                                </MultiSelectorList>
                            </MultiSelectorContent>
                        </MultiSelector>
                        )}
                    />
                }
                {selectSetting.tooltip && <SettingTooltip tooltip={selectSetting.tooltip}/>}
            </div>
        </div>
    );
}