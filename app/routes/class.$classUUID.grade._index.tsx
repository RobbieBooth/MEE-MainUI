import {LoaderFunction} from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import {Class, getClassFromBackend, userDetails, UserMap} from "~/routes/class.$classUUID._index";
import {MySidebar} from "~/routes/dashboard";
import {useLoaderData} from "@remix-run/react";
import {useEffect, useState} from "react";
import {AvailableQuizTable, deleteAvailableQuiz} from "~/components/quizSection/quizDisplayPage";
import {StudentAttemptsTable} from "~/components/quizSection/studentAttemptsPage";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "~/components/ui/accordion";
import {Separator} from "~/components/ui/separator";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "~/components/ui/card";
import NoItemsFound from "~/components/tables/noItemsFound";

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
    const { user, classData} = useLoaderData<typeof loader>() as {
        user: OAuthUser;
        classData: Class;
    };
    const [userID, setUserID] = useState<string>(user.associatedDBUser?._id ?? "UNKNOWN");
    const [sampleUserMap, setSampleUserMap] = useState<UserMap>();

    useEffect(() => {
        setUserID(user.associatedDBUser?._id ?? "UNKNOWN");
    }, [user.associatedDBUser]);

    return (
        <MySidebar user={user}>
            <div>
                <h2 className="pt-4 px-4 text-3xl font-semibold">
                    Your {classData.className} quiz attempts
                </h2>
                {classData.availableQuizzes.map((quiz) => {
                    const studentsAttempts = quiz.studentAttempts.filter((attempt) => attempt.studentID === userID);
                    return (
                        <Card key={quiz.id} className="m-4 my-8">
                            <CardHeader>
                                <CardTitle>{quiz.quizInfo.quizName}</CardTitle>
                                <CardDescription>{quiz.quizInfo.quizDescription}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AvailableQuizTable availableQuizzes={[quiz]} classID={classData.id}
                                                    editQuizButton={() => null} isEducator={false} user={user}
                                                    userMap={new Map<string, userDetails>()}
                                                    includeViewAttempts={false} deleteAvailableQuiz={(availableQuizUUID: string) => {}}/>
                                {/*We dont need to define deleteAvailableQuiz fn here since we arent deleting or editing*/}

                                <Accordion type="single" collapsible>
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger>View My Attempts
                                            ({studentsAttempts.length})</AccordionTrigger>
                                        <AccordionContent>
                                            <StudentAttemptsTable
                                                userMap={new Map<string, userDetails>([
                                                    [userID, {name: user.name, email: user.email ?? "UNKNOWN"}] // Example default value
                                                ])}
                                                classID={classData.id} studentAttempts={studentsAttempts}
                                                isEducator={true}
                                                availableQuizID={quiz.id}/>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    );

                })}
                {classData.availableQuizzes.length === 0 && (
                    <NoItemsFound message={"No available quizzes or attempts are found..."}/>
                )}
            </div>

        </MySidebar>
    );
}