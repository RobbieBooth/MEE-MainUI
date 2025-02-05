import {FileInputSetting} from "~/components/settings/compositeSettings";
import {Checkbox} from "~/components/ui/checkbox";
import {FormControl, FormField, FormItem, FormLabel, FormMessage,} from "~/components/ui/form"
import {SettingTooltip} from "~/components/settings/components/settingTooltip";
import {Switch} from "~/components/ui/switch";
import {Controller} from "react-hook-form";
import React, {useEffect, useState} from "react";
import {FileInput, FileUploader, FileUploaderContent, FileUploaderItem} from "~/components/ui/file-upload";
import {CloudUpload, Paperclip} from "lucide-react";

export function FileUploaderSetting({
                                        fileSetting,
                                        control,
                                    }: {
    fileSetting: FileInputSetting;
    control: any; // Update with the correct type from your form library
}): JSX.Element {
    const [dropZoneConfig, setDropZoneConfig] = useState({});

    useEffect(() => {
        const dropZone = {
            maxFiles: fileSetting.maxFileCount,
            maxSize: fileSetting.maxCumulativeFileSizeBytes,
            multiple: fileSetting.maxFileCount > 1,
            //https://react-dropzone.js.org/#!/Accepting%20specific%20file%20types
            accept: fileSetting.fileTypesAllowed,
        };
        setDropZoneConfig(dropZone);
    }, [fileSetting]);

    return (
        <div>
            <div className="inline-flex">
                <label>{fileSetting.label}</label>
                {fileSetting.tooltip && <SettingTooltip tooltip={fileSetting.tooltip}/>}
            </div>


            <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">

                <Controller
                    control={control}
                    name={fileSetting.id}
                    defaultValue={fileSetting.files}
                    render={({field}) => (
                        <FileUploader
                            value={field.value}
                            onValueChange={field.onChange}
                            dropzoneOptions={dropZoneConfig}
                            className="relative bg-background rounded-lg p-2"
                        >
                            <FileInput
                                id="fileInput"
                                className="outline-dashed outline-1 outline-slate-500"
                            >
                                <div className="flex items-center justify-center flex-col p-8 w-full ">
                                    <CloudUpload className='text-gray-500 w-10 h-10'/>
                                    <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold">Click to upload</span>
                                        &nbsp; or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {Object.keys(fileSetting.fileTypesAllowed).length == 0 ? "All Types Accepted" : Object.keys(fileSetting.fileTypesAllowed).map((key) => {
                                            const extensions = fileSetting.fileTypesAllowed[key].join(", ");
                                            if (fileSetting.fileTypesAllowed[key].length > 0) {
                                                return `${key}` + `, ${extensions}`;
                                            }
                                            return `${key}`;
                                        }).join(", ")}
                                    </p>
                                </div>
                            </FileInput>
                            <FileUploaderContent>
                                {field.value &&
                                    field.value.length > 0 &&
                                    field.value.map((file: File, i: number) => (
                                        <FileUploaderItem key={i} index={i}>
                                            <Paperclip className="h-4 w-4 stroke-current"/>
                                            <span>{file.name}</span>
                                        </FileUploaderItem>
                                    ))}
                            </FileUploaderContent>
                        </FileUploader>
                    )}
                />
            </div>
        </div>
        </div>
    );
}
