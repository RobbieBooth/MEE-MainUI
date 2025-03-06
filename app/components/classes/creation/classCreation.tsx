import {FormProvider, useForm} from "react-hook-form";
import {renderSetting} from "~/components/settings/greenMan/renderSetting";
import {Button} from "~/components/ui/button";
import React, {useEffect, useState} from "react";
import {createSettingTitle, updateSettingRecursively} from "~/components/settings/greenMan/DynamicForm";
import {BaseSetting, InputSetting, SettingType, TagInputSetting} from "~/components/settings/compositeSettings";
import {v4 as uuidv4} from "uuid";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "~/components/ui/dialog";
import { toast } from "sonner";
import {CreateOrEdit} from "~/components/availableQuiz/creation/availableQuizForm";


const className:InputSetting = {
    type: SettingType.Input,
    required: true,
    disabled: false,
    id: uuidv4(),
    label: "Class Name",
    tooltip: "Enter the class name",
    value: "",
    maxCharacters: 100,
    maxLines: "1"
};
const classDescription:InputSetting = {
    type: SettingType.Input,
    required: true,
    disabled: false,
    id: uuidv4(),
    label: "Class Description",
    tooltip: "Enter the class description",
    value: "",
    maxCharacters: null,
    maxLines: null
};
const classEducators:TagInputSetting = {
    type: SettingType.TagInput,
    required: true,
    disabled: false,
    id: uuidv4(),
    label: "Educators",
    tooltip: "The emails of the educators with access to edit and add to this class",
    value: [],
    maxEntries: null
}
const classStudents:TagInputSetting = {
    type: SettingType.TagInput,
    required: true,
    disabled: false,
    id: uuidv4(),
    label: "Students",
    tooltip: "The emails of the students with access to this class",
    value: [],
    maxEntries: null
}

const defaultClassForm:BaseSetting[] = [
    className,
    classDescription,
    classEducators,
    classStudents
];

interface classFormFields {
    id?: string;
    className: string;
    classDescription: string;
    classEducatorEmails: string[];
    classStudentEmails: string[]
}


export function ClassForm(
    {
        userEmail,
        classFormFields,
        createOrEdit
    }:{
        userEmail:string,
        classFormFields: classFormFields,
        createOrEdit: CreateOrEdit
    }
) {
    const [baseSettings, setBaseSettings] = useState<BaseSetting[]>(defaultClassForm);
    const [error, setError] = useState<string | null>(null);
    const methods = useForm();
    const {reset, handleSubmit, control, register, setValue } = methods;
    const [open, setOpen] = useState(false);

    function updateSettings() {
        let addEducator = false;
        if (!classFormFields.classEducatorEmails.includes(userEmail)) {
            addEducator = true;
        }

        const settings = [
            {...className, value: classFormFields.className},
            {...classDescription, value: classFormFields.classDescription},
            {
                ...classEducators,
                value: addEducator ? [userEmail, ...classFormFields.classEducatorEmails] : classFormFields.classEducatorEmails
            },
            {...classStudents, value: classFormFields.classStudentEmails},
        ]

        setBaseSettings([...settings]);
    }

//Make default settings
    useEffect(() => {
        updateSettings();
    }, [userEmail, classFormFields]);


    const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent the default form submission behavior
        handleSubmit(onSubmit)(); // Use React Hook Form's handleSubmit to process the data
    };

    const onSubmit = (data: any) => {
        console.log("Form Submitted:", data);
        const newBaseSettings = updateSettingRecursively(data, baseSettings);

        // saveQuizSettings(reconstructedQuizSettings);
        saveClass(newBaseSettings);
    };

    const saveClass = async (settings:BaseSetting[]) => {
        const payload = {
            id: classFormFields.id ?? uuidv4(),
            className: (settings[0] as InputSetting).value ?? "Unknown Class", // Assuming className is the key
            classDescription: (settings[1] as InputSetting).value ?? "", // Default value if not found
            educatorEmails: (settings[2] as TagInputSetting).value ?? [userEmail], // Default array if not found
            studentEmails: (settings[3]as TagInputSetting).value ?? [], // Default array if not found
        };

        try {
            const response = await fetch("/class/api/edit", {
                method: "POST", // Remix action expects POST
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const result = await response.json();
            console.log("Class created/updated successfully:", result);
            toast.success("Class Successfully created/updated");
            setOpen(false);//close dialog
        } catch (error) {
            console.error("Error calling class API:", error);
            toast.error("Error creating class");
        }
    };

    const openChange = (open: boolean) =>{
        if(open){
            updateSettings();
            reset();
        }
        setOpen(open);
    };

    return (
        <Dialog open={open} onOpenChange={openChange}>
            <DialogTrigger asChild>
                <Button variant="outline">{createOrEdit} Class</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Class</DialogTitle>
                    <DialogDescription>
                        {createOrEdit} a class
                    </DialogDescription>
                </DialogHeader>
                <FormProvider {...methods}>
                    <form onSubmit={onFormSubmit} >
                        <div className="space-y-8 w-full mx-auto py-10">
                        {baseSettings.map((baseSetting) =>
                            renderSetting(baseSetting, control, register, setValue))
                        }
                        </div>
                        {/*Has to be here for submit since it does not activate if not in context*/}
                        <DialogFooter>
                            <Button type="submit">Submit</Button>
                        </DialogFooter>

                    </form>
                </FormProvider>
                {/*<RenderClassForm userEmail={userEmail} classFormFields={classFormFields} setOpen={setOpen}/>*/}
            </DialogContent>
        </Dialog>

    );
}
