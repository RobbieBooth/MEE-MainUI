import React, {useEffect, useState} from "react";
import { useForm, FormProvider } from "react-hook-form";
import { renderSetting } from "./renderSetting";
import {Button} from "~/components/ui/button";
import {BaseSetting, parseSettings} from "~/components/settings/compositeSettings"; // Import the utility function

export const DynamicForm = ({ settings }: { settings: string }) => {
    const [baseSettings, setBaseSettings] = useState<BaseSetting[]>([]);
    const methods = useForm();
    const { handleSubmit, control, register, setValue } = methods;

    const onSubmit = (data: any) => {
        console.log("Form Submitted:", data);
    };

    const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent the default form submission behavior
        handleSubmit(onSubmit)(); // Use React Hook Form's handleSubmit to process the data
    };

    useEffect(() => {
        setBaseSettings(parseSettings(settings));
    }, [settings]);

    // Add a new component to the group
    const addComponent = (parentID: string, component: BaseSetting) => {

    };

    // Remove a component by its ID
    const removeComponent = (id: string) => {

    };

    // Update a component's value by its ID
    const updateComponent = (id: string, fieldName:string, value: any) => {

    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={onFormSubmit} className="space-y-8 max-w-3xl mx-auto py-10">
                {baseSettings.map((baseSetting) =>
                    renderSetting(baseSetting, control, register, setValue)
                )}
                <Button type="submit">Submit</Button>
            </form>
        </FormProvider>
    );
};
