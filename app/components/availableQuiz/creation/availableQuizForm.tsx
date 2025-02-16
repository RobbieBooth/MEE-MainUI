import {
    BaseSetting,
    ConditionalBoolSetting,
    ConditionalSelectSetting,
    DateSetting,
    InputSetting,
    SelectSetting,
    SettingType,
    TagInputSetting,
    ToggleDisplayType,
    ToggleSetting
} from "~/components/settings/compositeSettings";
import {v4 as uuidv4} from "uuid";
import React, {useEffect, useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import {updateSettingRecursively} from "~/components/settings/greenMan/DynamicForm";
import {toast} from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "~/components/ui/dialog";
import {Button} from "~/components/ui/button";
import {renderSetting} from "~/components/settings/greenMan/renderSetting";
import {OAuthUser} from "~/auth.server";
import {AvailableQuiz, Class, QuizInfo, UserMap} from "~/routes/class.$classUUID._index";
import {ScrollArea} from "~/components/ui/scroll-area";

const quizIDForm:SelectSetting = {
    availableValues: [],
    disabled: false,
    id: uuidv4(),
    label: "Quiz",
    multiSelect: false,
    required: true,
    tooltip: "The quiz that will be available to the students",
    value: [],
    type: SettingType.Select
};

const quizConditionalSelect:ConditionalSelectSetting ={
    condition: quizIDForm,
    disabled: false,
    groups: {},
    id: uuidv4(),
    label: null,
    required: true,
    tooltip: null,
    type: SettingType.ConditionalSelect

}

const versionFormVersionID:SelectSetting = {
    availableValues: [],
    disabled: false,
    id: uuidv4(),
    label: "Version",
    multiSelect: false,
    required: true,
    tooltip: "The version of the quiz to use",
    value: [],
    type: SettingType.Select
};

const versionFormCondition:ToggleSetting = {
    disabled: false,
    display: ToggleDisplayType.Checkbox,
    id: uuidv4(),
    label: "Use latest version",
    required: false,
    tooltip: "If checked then the available quiz will update with the new quiz upon change",
    type: SettingType.Toggle,
    value: true

};

const versionConditionalForm:ConditionalBoolSetting = {
    children: versionFormVersionID as BaseSetting,
    condition: versionFormCondition,
    disabled: false,
    id: uuidv4(),
    not: true,
    label: null,
    required: true,
    tooltip: null,
    type: SettingType.ConditionalBool
};

const studentFormStudentsSelect:SelectSetting = {
    availableValues: [],
    disabled: false,
    id: uuidv4(),
    label: "Student's available to",
    multiSelect: true,
    required: true,
    tooltip: "The students who the quiz should be available to",
    value: [],
    type: SettingType.Select
};

const studentFormCondition:ToggleSetting = {
    disabled: false,
    display: ToggleDisplayType.Checkbox,
    id: uuidv4(),
    label: "Available to all students",
    required: false,
    tooltip: "If checked then the quiz will be available to all students in the class",
    type: SettingType.Toggle,
    value: true

};

const studentConditionalForm:ConditionalBoolSetting = {
    children: studentFormStudentsSelect as BaseSetting,
    condition: studentFormCondition,
    disabled: false,
    id: uuidv4(),
    not: true,
    label: null,
    required: true,
    tooltip: null,
    type: SettingType.ConditionalBool
};

const openTimeFormDate:DateSetting = {
    disabled: false,
    id: uuidv4(),
    label: "Open Time",
    required: true,
    tooltip: "The date that the quiz will open",
    type: SettingType.Date,
    unixTimestamp: Date.now()
};

const openTimeFormCondition:ToggleSetting = {
    disabled: false,
    display: ToggleDisplayType.Checkbox,
    id: uuidv4(),
    label: "Have open time",
    required: true,
    tooltip: "If checked then the quiz will open at the date provided",
    type: SettingType.Toggle,
    value: true

};

const openTimeConditionalForm:ConditionalBoolSetting = {
    children: openTimeFormDate as BaseSetting,
    condition: openTimeFormCondition,
    disabled: false,
    id: uuidv4(),
    not: false,
    label: null,
    required: true,
    tooltip: null,
    type: SettingType.ConditionalBool
};

const closeTimeFormDate:DateSetting = {
    disabled: false,
    id: uuidv4(),
    label: "Open Time",
    required: true,
    tooltip: "The date that the quiz will close",
    type: SettingType.Date,
    unixTimestamp: Date.now() + 7*24*60*60 * 1000 //plus a week in milliseconds
};

const closeTimeFormCondition:ToggleSetting = {
    disabled: false,
    display: ToggleDisplayType.Checkbox,
    id: uuidv4(),
    label: "Have close time",
    required: true,
    tooltip: "If checked then the quiz will close at the date provided",
    type: SettingType.Toggle,
    value: true

};

const closeTimeConditionalForm:ConditionalBoolSetting = {
    children: closeTimeFormDate as BaseSetting,
    condition: closeTimeFormCondition,
    disabled: false,
    id: uuidv4(),
    not: false,
    label: null,
    required: true,
    tooltip: null,
    type: SettingType.ConditionalBool
};

const attemptsFormMaxAttempts:InputSetting = {
    type: SettingType.Input,
    id: uuidv4(),
    label: "Max Attempts",
    tooltip: "Specify the maximum number of attempts allowed.",
    required: true,
    disabled: false,
    value: "1",
    maxCharacters: 4,
    maxLines: "1"
};

const attemptsFormCondition:ToggleSetting = {
    disabled: false,
    display: ToggleDisplayType.Checkbox,
    id: uuidv4(),
    label: "Infinite Attempts",
    required: true,
    tooltip: "Enable this to allow students to answer the quiz infinite times.",
    type: SettingType.Toggle,
    value: false
};
const attemptsConditionalForm:ConditionalBoolSetting =
        {
            type: SettingType.ConditionalBool,
            id: uuidv4(),
            label: "Attempts Allowed",
            tooltip: "If enabled, users can attempt the quiz infinitely.",
            required: false,
            disabled: false,
            not: true,
            condition: attemptsFormCondition,
            children: attemptsFormMaxAttempts as BaseSetting
        };

const instantResultToggle:ToggleSetting = {
    disabled: false,
    display: ToggleDisplayType.Switch,
    id: uuidv4(),
    label: "Instant result",
    required: true,
    tooltip: "Return results back to students after completing quiz",
    type: SettingType.Toggle,
    value: true
};

const defaultAvailableQuizForm:BaseSetting[] = [
    quizIDForm,
    versionConditionalForm,
    studentConditionalForm,
    openTimeConditionalForm,
    closeTimeConditionalForm,
    attemptsConditionalForm,
    instantResultToggle
];


export function AvailableQuizForm(
    {
        currentClass,
        userMap,
        user,
        availableQuizBeingEdited
    }:{
        currentClass:Class,
        userMap:UserMap,
        user:OAuthUser,
        availableQuizBeingEdited?:AvailableQuiz
    }
) {
    const [baseSettings, setBaseSettings] = useState<BaseSetting[]>(defaultAvailableQuizForm);
    const [error, setError] = useState<string | null>(null);
    const methods = useForm();
    const {reset, handleSubmit, control, register, setValue } = methods;
    const [open, setOpen] = useState(false);
    const [availableQuizID, setAvailableQuizID] = useState<string>(uuidv4());

    function updateSettings() {
        let selectedQuizID:string | undefined;
        let selectedQuiz:QuizInfo | undefined;
        let useLatestVersion: boolean = true;
        let selectedVersionID:string | undefined;

        let availableToAllStudents:boolean = true;
        let studentUUIDsAvailableTo:string[] = [];//if available to alls students true this does not matter

        let haveOpenTime:boolean = false;
        let openTime: number | undefined;

        let haveCloseTime:boolean = false;
        let closeTime: number | undefined;

        let haveInfiniteAttempts:boolean = true;
        let infiniteAttempts:number | undefined;

        let instantResult = true;

        if(availableQuizBeingEdited != null){
            setAvailableQuizID(availableQuizBeingEdited.id);

            selectedQuizID = availableQuizBeingEdited.quizInfo.quizID;

            useLatestVersion = availableQuizBeingEdited.useLatestVersion;
            selectedVersionID = availableQuizBeingEdited.quizInfo.versionID;

            //check if quiz exists on class
            const quizWithID = currentClass.quizzes.filter((quiz) => quiz.quizID === selectedQuizID);
            if(quizWithID.length === 0){
                //quiz doesnt exist
                selectedQuizID = undefined;
                selectedVersionID = undefined;
            }else{
                selectedQuiz = quizWithID[0];
            }

            availableToAllStudents = availableQuizBeingEdited.studentsAvailableTo == undefined;
            studentUUIDsAvailableTo = availableQuizBeingEdited.studentsAvailableTo ?? [];

            haveOpenTime = availableQuizBeingEdited.startTime == undefined;
            openTime = availableQuizBeingEdited.startTime;

            haveCloseTime = availableQuizBeingEdited.endTime == undefined;
            closeTime = availableQuizBeingEdited.endTime;

            haveInfiniteAttempts = availableQuizBeingEdited.maxAttemptCount == undefined;
            infiniteAttempts = availableQuizBeingEdited.maxAttemptCount;

            instantResult = availableQuizBeingEdited.instantResult;
        }else{
            setAvailableQuizID(uuidv4());
        }

        //return default
        const quizToVersions = groupQuizzesByVersion(currentClass.quizzes);
        const quizSelect = quizConditionalSelect;
        const quizIDs = new Set(
            currentClass.quizzes.map((quiz) => `${quiz.quizName} ~ ${quiz.quizID}`)
        );


        quizSelect.condition.availableValues = Array.from(quizIDs);
        quizSelect.condition.value = selectedQuizID == undefined || selectedQuiz == undefined ? [] : [`${selectedQuiz.quizName} ~ ${selectedQuiz.quizID}`];

        // Initialize groups
        const quizSettingGroup: Record<string, BaseSetting> = {};

        // Populate groups
        Array.from(quizIDs.values()).forEach((quizID) => {
            const versions= quizToVersions.get(getQuizIDFromString(quizID));
            if(versions == undefined){
                return;
            }

            let foundVersion:string | undefined;
            //this is quiz selected
            // if(selectedQuizID != undefined && quizID === selectedQuizID){
            //
            // }
            const availableVersions:string[] = [];
            Array.from(versions.values()).forEach((versionInfo) => {
                const value = `${versionInfo.createdAt} ~ ${versionInfo.versionID}`;
                //If we have found the version then we want to select it
                if(selectedQuizID != undefined && quizID === selectedQuizID && selectedVersionID != undefined && selectedVersionID === versionInfo.versionID){
                    foundVersion = value;
                }
                availableVersions.push(value);
            });

            const newVersionForm:SelectSetting = {...versionFormVersionID, id: uuidv4(), availableValues: availableVersions, value: foundVersion === undefined ? [] : [foundVersion]}
            const newVersionConditional:ConditionalBoolSetting = {
                ...versionConditionalForm, // Spread the original object
                condition: {...versionFormCondition, id: uuidv4(), value: useLatestVersion},//because id needs to be changed between conditions
                children: newVersionForm,
                id: uuidv4(), // Generate a unique ID for each copy
            };
            quizSettingGroup[quizID] = newVersionConditional;
        });
        //Set the group
        quizSelect.groups = quizSettingGroup;

        const studentConditional = studentConditionalForm;
        studentConditional.condition.value = availableToAllStudents;
        const studentFormSelect = studentFormStudentsSelect;
        studentFormSelect.availableValues = currentClass.students.map((studentID) => {
            const student = userMap.get(studentID);
            if(userMap == undefined){
                return `UNKNOWN ~ ${studentID}`;
            }
            return `${student!.email} ~ ${studentID}`;
        });
        studentFormSelect.value = studentUUIDsAvailableTo;
        studentConditional.children = studentFormSelect;

        //Open Time conditional
        const newOpenTimeDate = openTimeFormDate;
        newOpenTimeDate.unixTimestamp = openTime ?? Date.now();
        const newOpenTimeConditional = openTimeConditionalForm;
        newOpenTimeConditional.condition.value = haveOpenTime;
        newOpenTimeConditional.children = newOpenTimeDate;

        //Close Time conditional
        const newCloseTimeDate = closeTimeFormDate;
        if(closeTime){
            newCloseTimeDate.unixTimestamp = closeTime;
        }
        const newCloseTimeConditional = closeTimeConditionalForm;
        newCloseTimeConditional.condition.value = haveCloseTime;
        newCloseTimeConditional.children = newCloseTimeDate;

        const newAttemptsConditional = attemptsConditionalForm;
        newAttemptsConditional.condition.value = haveInfiniteAttempts;
        if(infiniteAttempts){
            const newAttemptsForm = attemptsFormMaxAttempts;
            newAttemptsForm.value = infiniteAttempts.toString();
            newAttemptsConditional.children = newAttemptsForm;
        }

        const settings = [
            quizSelect,
            studentConditional,
            newOpenTimeConditional,
            newCloseTimeConditional,
            newAttemptsConditional,
            {...instantResultToggle, value:instantResult},
        ];

        setBaseSettings([...settings]);
    }

//Make default settings
    useEffect(() => {
        updateSettings();
    }, [currentClass,userMap, user, availableQuizBeingEdited]);

    function getQuizIDFromString(input: string): string {
        const parts = input.split(" ~ "); // Split by ' ~ '
        return parts[1]; // The quizID is the second part
    }
    

    const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent the default form submission behavior
        handleSubmit(onSubmit)(); // Use React Hook Form's handleSubmit to process the data
    };

    const onSubmit = (data: any) => {
        console.log("Form Submitted:", data);
        const newBaseSettings = updateSettingRecursively(data, baseSettings);

        // saveQuizSettings(reconstructedQuizSettings);
        saveAvailableQuiz(newBaseSettings);
    };

    const saveAvailableQuiz = async (settings:BaseSetting[]) => {
        const quizForm = settings[0] as ConditionalSelectSetting;
        const quizIDArray = quizForm.condition.value;
        if(quizIDArray == null || quizIDArray.length === 0 || quizIDArray[0] === undefined){
            toast.error("Quiz ID must be specified!");
            return;
        }
        const useLatestVersionSetting = quizForm.groups[quizIDArray[0]];
        const quizID = getQuizIDFromString(quizIDArray[0]);

        const latestVersion = (useLatestVersionSetting as ConditionalBoolSetting).condition.value;
        let selectedVersionID:string | null = null;
        if(!latestVersion){
            const versionSelected = ((useLatestVersionSetting  as ConditionalBoolSetting).children as SelectSetting).value;
            if(versionSelected == null || versionSelected.length === 0 || versionSelected[0] === undefined){
                toast.error("Version ID must be specified!");
                return;
            }
            selectedVersionID = getQuizIDFromString(versionSelected[0]);
        }

        const allStudentsSetting = settings[1];
        const useAllStudents = (allStudentsSetting as ConditionalBoolSetting).condition.value;
        let selectedStudents:string[] | null = null;
        if(!useAllStudents){
            const studentsSubmittedToForm = ((allStudentsSetting  as ConditionalBoolSetting).children as SelectSetting).value ?? [];

            //extract ids from students
            selectedStudents = studentsSubmittedToForm.map((student) => getQuizIDFromString(student));
        }

        const openTimeSetting = settings[2];
        const useOpenTime = (openTimeSetting as ConditionalBoolSetting).condition.value;
        let openTimeSelected: number | null = null;
        if(useOpenTime){
            const openTime = ((openTimeSetting  as ConditionalBoolSetting).children as DateSetting).unixTimestamp;
            if(openTime == undefined){
                toast.error("Open Time must be specified!");
                return;
            }
            openTimeSelected = openTime;
        }

        const closeTimeSetting = settings[3];
        const useCloseTime = (closeTimeSetting as ConditionalBoolSetting).condition.value;
        let closeTimeSelected: number | null = null;
        if(useCloseTime){
            const closeTime = ((closeTimeSetting  as ConditionalBoolSetting).children as DateSetting).unixTimestamp;
            if(closeTime == undefined){
                toast.error("Close Time must be specified!");
                return;
            }
            closeTimeSelected = closeTime;
        }

        const attemptsSetting = settings[4];
        const infiniteAttempts = (attemptsSetting as ConditionalBoolSetting).condition.value;
        let attemptsCount: number | null = null;
        if(!infiniteAttempts){
            const attemptsCountString = ((attemptsSetting  as ConditionalBoolSetting).children as InputSetting).value;

            //Attempt to convert the value to a number
            const attemptCountInt = parseInt(attemptsCountString);

            //Check if the result is not a number
            if (isNaN(attemptCountInt)) {
                toast.error("Attempt count must be a whole number!");
                return;
            }
            attemptsCount = attemptCountInt;
        }

        const instantResult = (settings[5] as ToggleSetting).value;

        const payload = {
            id: availableQuizID,
            quizID: quizID,
            versionID: latestVersion ? null : selectedVersionID,
            useLatestVersion: latestVersion,
            studentsAvailableTo: useAllStudents ? null : selectedStudents,
            startTime: !useOpenTime ? null : openTimeSelected,
            closeTime: !useCloseTime ? null : closeTimeSelected,
            maxAttemptCount: infiniteAttempts ? null : attemptsCount,
            instantResult: instantResult,
        };

        try {
            const response = await fetch(`http://localhost:8080/v1/api/class/${currentClass.id}/quiz/available/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.backendJWT}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const result = await response.json();
            console.log("Available quiz created successfully successfully:", result);
            toast.success("Available quiz successfully created/updated");
            setOpen(false);//close dialog
        } catch (error) {
            console.error("Error creating available quiz:", error);
            toast.error("Error creating available quiz");
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
                <Button variant="outline">Create Available Quiz</Button>
            </DialogTrigger>
            <DialogContent className="min-w-fit">
                <DialogHeader>
                    <DialogTitle>Create Class</DialogTitle>
                    <DialogDescription>
                        Create a new quiz which is available to students to complete
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] w-full">
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
                </ScrollArea>
                {/*<RenderClassForm userEmail={userEmail} classFormFields={classFormFields} setOpen={setOpen}/>*/}
            </DialogContent>
        </Dialog>

    );
}

interface VersionCreatedAt {
    versionID: string,
    createdAt: number,
}

/**
 * Function to group quiz ids together and have all of their version ids
 * @param quizzes
 */
export const groupQuizzesByVersion = (quizzes: QuizInfo[]): Map<string, Set<VersionCreatedAt>> => {
    const quizMap = new Map<string, Set<VersionCreatedAt>>();

    quizzes.forEach((quiz) => {
        if (!quiz.versionID) return; // Skip if no versionID is present

        // Get or initialize the Set for this quizID
        const versionSet = quizMap.get(quiz.quizID) || new Set<VersionCreatedAt>();

        // Add the unique versionID to the Set
        versionSet.add({versionID: quiz.versionID, createdAt: quiz.createdAt});

        // Update the Map with the updated Set
        quizMap.set(quiz.quizID, versionSet);
    });

    return quizMap;
};
