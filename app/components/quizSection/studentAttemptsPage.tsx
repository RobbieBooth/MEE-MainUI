import {QuizInfo, SampleStudentAttempt, UserMap} from "~/routes/class.$classUUID._index";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "~/components/ui/dialog";
import {Button} from "~/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "~/components/ui/table";
import React from "react";
import {useNavigate} from "react-router";
import NoItemsFound from "~/components/tables/noItemsFound";
import {ScrollArea} from "~/components/ui/scroll-area";

export function AttemptsDialog({userMap, classID, studentAttempts, isEducator, disabled, availableQuizID, quizID}:{ userMap:UserMap, classID:string, studentAttempts:SampleStudentAttempt[], isEducator: boolean, disabled:boolean, availableQuizID: string,  quizID:string}) {
    return(
        <Dialog>
            <DialogTrigger asChild disabled={disabled}>
                <Button variant="outline">View Attempts</Button>
            </DialogTrigger>
            <DialogContent className="min-w-fit max-[h-3/4]">
                <DialogHeader>
                    <DialogTitle>Student Attempts {quizID}</DialogTitle>
                    {/*<DialogDescription>*/}
                    {/*    Create a new quiz which is available to students to complete*/}
                    {/*</DialogDescription>*/}
                </DialogHeader>
                <ScrollArea className="w-full h-full">
                    <div className="w-full">
                        <StudentAttemptsTable classID={classID} studentAttempts={studentAttempts} isEducator={isEducator}  userMap={userMap} availableQuizID={availableQuizID}/>
                    </div>
                </ScrollArea>

            </DialogContent>
        </Dialog>
    )
}

export function StudentAttemptsTable({userMap, classID, studentAttempts, isEducator, availableQuizID}:{ userMap:UserMap, classID:string, studentAttempts:SampleStudentAttempt[], isEducator: boolean, availableQuizID:string}) {
    const navigate = useNavigate();

    const handleGoToQuiz = (uuid:string) => {
        navigate(`/class/${classID}/quiz/${availableQuizID}/${uuid}`);
    };

    return (
        <Table>
            {/*<TableCaption>Available Quizzes</TableCaption>*/}
            <TableHeader>
                <TableRow>
                    <TableHead className="">Version ID</TableHead>
                    <TableHead className="">Student Name</TableHead>
                    {/*<TableHead className="">Max Attempts</TableHead>*/}
                    <TableHead className="">View Attempt</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {studentAttempts.map((attempt) => {

                    return (<TableRow key={attempt.versionID}>
                            <TableCell className="font-medium">{attempt.versionID}</TableCell>
                            <TableCell className="font-medium">{userMap.get(attempt.studentID)?.email ?? attempt.studentID}</TableCell>
                            {isEducator && <TableCell className="font-medium"><Button onClick={() => handleGoToQuiz(attempt.studentAttemptId)}>View Attempt</Button></TableCell> }
                        </TableRow>
                    );
                })
                }
                {studentAttempts.length === 0 && <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                        <NoItemsFound message={"No student attempts found..."}/>
                    </TableCell>
                </TableRow>}
            </TableBody>
        </Table>
    )
}