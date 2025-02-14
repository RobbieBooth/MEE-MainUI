import {LoaderFunction} from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import {useLoaderData} from "@remix-run/react";
import {MySidebar} from "~/routes/dashboard";
import {toast} from "sonner";
import {useEffect, useState} from "react";
import {Skeleton} from "~/components/ui/skeleton";

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

// Assuming QuizInfo and AvailableQuiz are already defined elsewhere
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



interface userDetails {
    email: string;
    name?: string;
}

export type UserMap = Map<string, userDetails>;
export const getUserMap = async (classInfo: Class):Promise<UserMap> => {
    const uuidList = classInfo.students;
    uuidList.push(...classInfo.educators);

    const payload = {
        userUUIDs: uuidList,
    };
    console.log(payload);

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
    console.log("Json response:",jsonResponse);

    return classData;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const { classUUID } = params;

    if (!classUUID) {
        throw new Response("Class UUID is required", { status: 400 });
    }

    const user = await authenticate(request, `/class/${classUUID}`);

    // Fetch the class data from your backend API
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

    useEffect(() => {
        const fetchUserMap = async () => {
            const detail = await getUserMap(classData);
            setUserDetailMap(detail as UserMap);
            setIsLoadingUserDetailMap(false);
        };

        fetchUserMap();
    }, [classData]);


    return (
        <MySidebar user={user}>
            <div>
                <h1>Class Details</h1>
                <p>Class Name: {classData.className}</p>
                <p>Description: {classData.classDescription}</p>
                {/*<p>Educators: {classData.educators.map((educatorUUID) => {*/}
                {/*    const usersDetails = userDetailMap.get(educatorUUID);*/}
                {/*    if (usersDetails) {*/}
                {/*        return usersDetails.name ?? usersDetails.email;*/}
                {/*    }*/}
                {/*    return "UNKNOWN";*/}
                {/*}).join(", ")}</p>*/}
                <div>
                    <table>
                        <thead>
                        <tr>
                            <th>Name</th>
                        </tr>
                        </thead>
                        <tbody>
                        {classData.educators.map((educatorUUID) => {

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
                        })}
                        </tbody>
                    </table>
                </div>
                <p>Students: {classData.students?.join(", ")}</p>
            </div>
        </MySidebar>
    );
}

function getUsersName(userDetailMap: UserMap, uuid:string) {
    const userDetail = userDetailMap.get(uuid);
    console.log(userDetailMap);
    if (!userDetail) {
        return "UNKNOWN";
    }
    return userDetail.name ?? userDetail.email;
}