import {LoaderFunction} from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import {useLoaderData} from "@remix-run/react";
import {MySidebar} from "~/routes/dashboard";
import {toast} from "sonner";
import React, {useEffect, useState} from "react";
import {Skeleton} from "~/components/ui/skeleton";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "~/components/ui/resizable";
import {ClassTable} from "~/components/classes/classTable";
import {AvailableQuizTable, deleteAvailableQuiz} from "~/components/quizSection/quizDisplayPage";
import {AvailableQuizForm} from "~/components/availableQuiz/creation/availableQuizForm";
import {ScrollArea} from "~/components/ui/scroll-area";
import {HardHat} from "lucide-react";
import NoItemsFound from "~/components/tables/noItemsFound";

// TypeScript type for Class
export type Class = {
    id: string; // UUID as a string
    className: string;
    classDescription: string;
    educators: string[]; // List of UUIDs as strings
    students: string[]; // List of UUIDs as strings
    quizzes: QuizInfo[];
    availableQuizzes: AvailableQuiz[];
};

export type QuizInfo = {
    quizID: string; // UUID as string
    quizName: string;
    quizDescription: string;
    questionCount: number;
    createdAt: number; // Unix time in milliseconds
    versionID?: string; // UUID as string
};

export interface AvailableQuiz {
    id: string;
    quizInfo: QuizInfo;
    startTime?: number; // Unix time in milliseconds
    endTime?: number;   // Unix time in milliseconds
    studentsAvailableTo?: string[]; // Array of UUIDs (as strings)
    useLatestVersion: boolean;
    studentAttempts: SampleStudentAttempt[];
    instantResult: boolean;
    maxAttemptCount?: number; // null or undefined for infinite attempts
}
export interface SampleStudentAttempt {
    studentAttemptId: string;
    quizID: string; // UUID as string
    versionID: string; // UUID as string
    studentID: string; // UUID as string
    grade?: number; // Optional grade
    maxGrade?: number; // Optional max grade
}



export interface userDetails {
    email: string;
    name?: string;
}

export type UserMap = Map<string, userDetails>;
export const getUserMap = async (classInfo: Class):Promise<UserMap> => {
    const uuidList = [...classInfo.students];
    uuidList.push(...classInfo.educators);

    const payload = {
        userUUIDs: uuidList,
    };

    try {
        const response = await fetch("http://localhost:5173/api/user/name", {
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
        // console.log("Class created/updated successfully:", result);
        // toast.success("Class Successfully created/updated");
        const userMap = new Map<string, userDetails>();
        for (const [uuid, detail] of Object.entries(result.users)) {
            // Add each user to the Map with the uuid as the key
            userMap.set(uuid, detail as userDetails);
        }
        return userMap;
    } catch (error) {
        console.error("Error calling usernames API:", error);
        toast.error("Error getting usernames class");
    }
    return new Map<string, userDetails>();
};

export async function getClassFromBackend(classUUID: string, user: OAuthUser) {
    const response = await fetch(`http://localhost:8080/v1/api/class/${classUUID}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.backendJWT}`
        },
    });

    if (!response.ok) {
        throw new Response("Failed to fetch class data", {status: response.status});
    }
    const jsonResponse = await response.json()
    const classData: Class = jsonResponse;

    return classData;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const { classUUID } = params;

    if (!classUUID) {
        throw new Response("Class UUID is required", { status: 400 });
    }

    const user = await authenticate(request, `/class/${classUUID}`);

    //Fetch the class data from your backend API
    const classData = await getClassFromBackend(classUUID, user);
    // const userMap = await getUserMap(classData);


    return { user, classData };
};




export default function Dashboard() {
    const [userDetailMap, setUserDetailMap] = useState<UserMap>();
    const [isLoadingUserDetailMap, setIsLoadingUserDetailMap] = useState<boolean>(true);
    const { user, classData} = useLoaderData<typeof loader>() as {
        user: OAuthUser;
        classData: Class;
    };
    const [classDataHolder, setClassDataHolder] = useState<Class>();

    useEffect(() => {
        const fetchUserMap = async () => {
            const detail = await getUserMap(classData);
            setUserDetailMap(detail as UserMap);
            setIsLoadingUserDetailMap(false);
        };

        fetchUserMap();
        setClassDataHolder(classData);
    }, [classData]);


    return (
        <MySidebar user={user} currentClassID={classData.id}>
            {classDataHolder == undefined ? "Loading... Class Data" :
                <ResizablePanelGroup
                    direction="vertical"
                    className="h-screen w-full rounded-lg border"
                >
                    <ResizablePanel defaultSize={15}>
                        <ResizablePanelGroup direction="horizontal">
                            <ResizablePanel defaultSize={50}>
                                <div className="block h-full items-center justify-center p-6">
                                    <div>
                                        <span className="font-semibold">Class Name:</span>
                                        <p>{classDataHolder.className}</p>
                                    </div>
                                    <div className="pt-2">
                                        <span className="font-semibold">Class Description:</span>
                                        <p>{classDataHolder.classDescription}</p>
                                    </div>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle/>
                            <ResizablePanel defaultSize={50}>
                                <ScrollArea className="h-full w-full rounded-md p-6">
                                    <div className="block h-full">
                                        <div>
                                            <table>
                                                <thead>
                                                <tr>
                                                    <th className="text-left">Lecturer Name</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {classDataHolder.educators.length > 0
                                                    ?
                                                    (classDataHolder.educators.map((educatorUUID) => {

                                                    return (
                                                        <tr key={educatorUUID}>
                                                            <td>
                                                                {isLoadingUserDetailMap ? (
                                                                    // Show skeleton loader while data is loading
                                                                    <Skeleton className="w-24 h-4"/>
                                                                ) : (
                                                                    // Once data is loaded, display educator's name
                                                                    userDetailMap == null ? "ERROR" : getUsersName(userDetailMap, educatorUUID)
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                }))
                                                    :
                                                    <NoItemsFound logo={HardHat} message={"No educators found..."}/>
                                                }
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="pt-2">
                                            <table>
                                                <thead>
                                                <tr>
                                                    <th className="text-left">Student Name</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {classDataHolder.students.length > 0
                                                    ?
                                                    (classDataHolder.students.map((studentUUID) => {
                                                    return (
                                                        <tr key={studentUUID}>
                                                            <td>
                                                                {isLoadingUserDetailMap ? (
                                                                    // Show skeleton loader while data is loading
                                                                    <Skeleton className="w-24 h-4"/>
                                                                ) : (
                                                                    // Once data is loaded, display educator's name
                                                                    userDetailMap == null ? "ERROR" : getUsersName(userDetailMap, studentUUID)
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                }))
                                                    :
                                                    <NoItemsFound logo={HardHat} message={"No students found..."}/>
                                                }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                    <ResizableHandle/>
                    <ResizablePanel defaultSize={50}>
                        <ScrollArea className="flex items-center justify-center h-full w-full rounded-md p-6">
                            <AvailableQuizTable availableQuizzes={classDataHolder.availableQuizzes} user={user}
                                                classID={classDataHolder.id}
                                                isEducator={true}
                                                userMap={userDetailMap ?? new Map<string, userDetails>()}
                                                editQuizButton={
                                                    (quiz: AvailableQuiz) =>
                                                        <AvailableQuizForm currentClass={classDataHolder} user={user}
                                                                           userMap={userDetailMap!}
                                                                           updateClass={setClassDataHolder}
                                                                           createOrEdit={"Edit"}
                                                                           availableQuizBeingEdited={quiz}/>
                                                }
                             includeViewAttempts={true}
                                                deleteAvailableQuiz={(availableQuizUUID: string) => {
                                const success = deleteAvailableQuiz(classDataHolder.id, availableQuizUUID, user.backendJWT ?? "");
                                success.then((value) => {
                                    if (value) {
                                        if (classDataHolder == undefined) {
                                            return;
                                        }
                                        const newClass: Class = {...classDataHolder};
                                        newClass.availableQuizzes = newClass.availableQuizzes.filter((quiz) => quiz.id !== availableQuizUUID);
                                        setClassDataHolder(newClass);
                                    }
                                });
                                }
                            }
                                />
                        </ScrollArea>
                    </ResizablePanel>
                </ResizablePanelGroup>
            }
        </MySidebar>
    );
}

function getUsersName(userDetailMap: UserMap, uuid: string) {
    const userDetail = userDetailMap.get(uuid);
    if (!userDetail) {
        return "UNKNOWN";
    }
    return userDetail.name ?? userDetail.email;
}