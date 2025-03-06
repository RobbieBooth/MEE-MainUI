import {LoaderFunction} from "@remix-run/node";
import {authenticate, OAuthUser} from "~/auth.server";
import {Class, getClassFromBackend, userDetails, UserMap} from "~/routes/class.$classUUID._index";
import {MySidebar} from "~/routes/dashboard";
import {useLoaderData} from "@remix-run/react";
import {useEffect, useState} from "react";
import {AvailableQuizTable} from "~/components/quizSection/quizDisplayPage";
import {StudentAttemptsTable} from "~/components/quizSection/studentAttemptsPage";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "~/components/ui/accordion";
import {Separator} from "~/components/ui/separator";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "~/components/ui/card";

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
                                                    includeViewAttempts={false}/>

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
                        // <div key={quiz.id} className="mt-8">
                        //     <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
                        //         {quiz.quizInfo.quizName}
                        //     </h2>
                        //     {/*<h1>Student Attempts: {studentsAttempts.length}</h1>*/}
                        //     {/*We are using an empty user map since we don't need it since we aren't viewing attempts and well it isn't worth calling api to get it when it's not needed*/}
                        //     <AvailableQuizTable availableQuizzes={[quiz]} classID={classData.id}
                        //                         editQuizButton={() => null} isEducator={false} user={user}
                        //                         userMap={new Map<string, userDetails>()} includeViewAttempts={false}/>
                        //     <Accordion type="single" collapsible>
                        //         <AccordionItem value="item-1">
                        //             <AccordionTrigger>View My Attempts ({studentsAttempts.length})</AccordionTrigger>
                        //             <AccordionContent>
                        //                 <StudentAttemptsTable
                        //                     userMap={new Map<string, userDetails>([
                        //                         [userID, {name: user.name, email: user.email ?? "UNKNOWN"}] // Example default value
                        //                     ])}
                        //                     classID={classData.id} studentAttempts={studentsAttempts} isEducator={true}
                        //                     availableQuizID={quiz.id}/>
                        //             </AccordionContent>
                        //         </AccordionItem>
                        //     </Accordion>
                        //     {/*<Separator/>*/}
                        // </div>
                    );

                })}
            </div>

        </MySidebar>
    );
}