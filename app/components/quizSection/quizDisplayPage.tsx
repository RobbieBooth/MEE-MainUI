import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"
import {Button} from "~/components/ui/button";
import {useNavigate} from "react-router";
import {AvailableQuiz, QuizInfo, UserMap} from "~/routes/class.$classUUID._index";
import {Ellipsis, Infinity} from "lucide-react";
import {OAuthUser} from "~/auth.server";
import React, {useEffect, useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "~/components/ui/dialog";
import {ScrollArea} from "~/components/ui/scroll-area";
import {FormProvider} from "react-hook-form";
import {renderSetting} from "~/components/settings/greenMan/renderSetting";
import {AttemptsDialog} from "~/components/quizSection/studentAttemptsPage";

export function QuizTable({classID, user, quizzes, isEducator}:{ classID:string, user:OAuthUser, quizzes:QuizInfo[], isEducator: boolean}) {
    const [quizMap,setQuizMap] = useState<Record<string, { latest: QuizInfo; versions: QuizInfo[] }>>({});
    const navigate = useNavigate();

    const handleEditQuiz = (uuid:string) => {
        navigate(`/class/${classID}/quiz/setting/${uuid}`);
    };

    useEffect(() => {
        //Group quizzes by quizID and store latest version + all versions
        const newQuizMap = quizzes.reduce((acc, quiz) => {
            //If we haven't seen quiz before add it as latest and to the versions
            if (!acc[quiz.quizID]) {
                acc[quiz.quizID] = { latest: quiz, versions: [quiz] };
            } else {
                //otherwise add it to just versions and check if it's the latest, if so change latest to it.
                acc[quiz.quizID].versions.push(quiz);
                if (quiz.createdAt > acc[quiz.quizID].latest.createdAt) {
                    acc[quiz.quizID].latest = quiz;
                }
            }
            return acc;
        }, {} as Record<string, { latest: QuizInfo; versions: QuizInfo[] }>);
        setQuizMap(newQuizMap);
    }, [quizzes]);

    return (
        <Table>
            <TableCaption>Available Quizzes</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="">Quiz ID</TableHead>
                    <TableHead className="">Last Version ID</TableHead>
                    <TableHead className="">Quiz Name</TableHead>
                    <TableHead className="">Question Count</TableHead>
                    {/*<TableHead className="">Max Attempts</TableHead>*/}
                    <TableHead className="">Last Edited</TableHead>
                    <TableHead className="">Versions</TableHead>
                    {isEducator && <TableHead className="text-right">Edit Quiz</TableHead>}
                    {isEducator && <TableHead className="text-right">View Versions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {Object.values(quizMap).map((quizHolder) => {
                    const latestQuiz = quizHolder.latest;
                    if(latestQuiz.versionID == undefined){
                        return;
                    }
                    const date = new Date(latestQuiz.createdAt);
                    const count = quizHolder.versions.length;

                    return (<TableRow key={latestQuiz.versionID}>
                            <TableCell className="font-medium">{latestQuiz.quizID}</TableCell>
                            <TableCell className="font-medium">{latestQuiz.versionID}</TableCell>
                            <TableCell className="font-medium">{latestQuiz.quizName}</TableCell>
                            <TableCell className="font-medium">{latestQuiz.questionCount}</TableCell>
                            <TableCell className="font-medium">{date.toLocaleString()}</TableCell>
                            <TableCell className="font-medium">{count}</TableCell>
                            {isEducator &&
                                <TableCell className="text-right"><Button onClick={() => handleEditQuiz(latestQuiz.quizID!)}>Edit
                                    Quiz</Button></TableCell>}
                            {isEducator &&
                                <TableCell className="text-right"><VersionQuizDialog quizzesVersions={quizHolder.versions} classID={classID} disabled={false} isEducator={isEducator}/></TableCell>}
                            {/*<TableCell><Button onClick={()=>handleGoToQuiz(uuid)}>{buttonTitle}</Button></TableCell>*/}
                        </TableRow>
                    );
                })
                }
            </TableBody>
        </Table>
    )
}

export function VersionQuizDialog({classID, quizzesVersions, isEducator, disabled}:{ classID:string, quizzesVersions:QuizInfo[], isEducator: boolean, disabled:boolean}) {
    return(
        <Dialog>
            <DialogTrigger asChild disabled={disabled}>
                <Button variant="outline">View Versions</Button>
            </DialogTrigger>
            <DialogContent className="min-w-fit">
                <DialogHeader>
                    <DialogTitle>Quiz Versions</DialogTitle>
                    {/*<DialogDescription>*/}
                    {/*    Create a new quiz which is available to students to complete*/}
                    {/*</DialogDescription>*/}
                </DialogHeader>
                <QuizVersionTable classID={classID} quizzesVersions={quizzesVersions} isEducator={isEducator} />
            </DialogContent>
        </Dialog>
    )
}

export function QuizVersionTable({classID, quizzesVersions, isEducator}:{ classID:string, quizzesVersions:QuizInfo[], isEducator: boolean}) {
    return (
        <Table>
            {/*<TableCaption>Available Quizzes</TableCaption>*/}
            <TableHeader>
                <TableRow>
                    <TableHead className="">Quiz ID</TableHead>
                    <TableHead className="">Version ID</TableHead>
                    <TableHead className="">Quiz Name</TableHead>
                    <TableHead className="">Question Count</TableHead>
                    {/*<TableHead className="">Max Attempts</TableHead>*/}
                    <TableHead className="">Created At</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {quizzesVersions.map((quiz) => {
                    if(quiz.versionID == undefined){
                        return;
                    }
                    const date = new Date(quiz.createdAt);

                    return (<TableRow key={quiz.versionID}>
                            <TableCell className="font-medium">{quiz.quizID}</TableCell>
                            <TableCell className="font-medium">{quiz.versionID}</TableCell>
                            <TableCell className="font-medium">{quiz.quizName}</TableCell>
                            <TableCell className="font-medium">{quiz.questionCount}</TableCell>
                            <TableCell className="font-medium">{date.toLocaleString()}</TableCell>
                        </TableRow>
                    );
                })
                }
            </TableBody>
        </Table>
    )
}

export function AvailableQuizTable({userMap, classID, user, availableQuizzes, isEducator}:{ userMap: UserMap, classID:string, user:OAuthUser, availableQuizzes:AvailableQuiz[], isEducator: boolean}) {
    const navigate = useNavigate();

    const handleGoToQuiz = (uuid:string) => {
        navigate(`/class/${classID}/quiz/${uuid}`);
    };

    return (
        <Table>
            <TableCaption>Available Quizzes</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="">Quiz ID</TableHead>
                    <TableHead className="">Quiz Name</TableHead>
                    <TableHead className="">Question Count</TableHead>
                    <TableHead className="">Max Attempts</TableHead>
                    {!isEducator && <TableHead className="text-right">Start Quiz</TableHead>}
                    {isEducator && <TableHead className="text-right">Edit Quiz</TableHead>}
                    <TableHead className="text-right">View Attempts</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {availableQuizzes.map((quiz) => {
                    const userID = user.associatedDBUser!._id;

                    const studentsAttemptsAtQuiz =!isEducator ? quiz.studentAttempts.reduce((total, attempt) => {
                        return attempt.studentID === userID ? total + 1 : total;
                    }, 0)
                    :
                    0
                    ;


                    const studentMaxAttemptsReached = quiz.maxAttemptCount != undefined && (quiz.maxAttemptCount - studentsAttemptsAtQuiz) <= 0;

                    return (<TableRow key={quiz.id}>
                            <TableCell className="font-medium">{quiz.quizInfo.quizID}</TableCell>
                            <TableCell className="font-medium">{quiz.quizInfo.quizName}</TableCell>
                            <TableCell className="font-medium">{quiz.quizInfo.questionCount}</TableCell>
                            <TableCell className="font-medium">{quiz.maxAttemptCount == undefined ?
                                <Infinity/> : `${studentsAttemptsAtQuiz} / ${quiz.maxAttemptCount}`}</TableCell>
                            {!isEducator &&
                                <TableCell className="text-right"><Button onClick={() => handleGoToQuiz(quiz.id)}
                                                                          disabled={studentMaxAttemptsReached}>
                                    Start Quiz
                                </Button></TableCell>}
                            {isEducator &&
                                <TableCell className="text-right"><Button onClick={() => handleGoToQuiz(quiz.id)}>Edit
                                    Quiz</Button></TableCell>}
                            <TableCell className="text-right"><AttemptsDialog  availableQuizID={quiz.id} studentAttempts={quiz.studentAttempts} isEducator={isEducator} disabled={false} classID={classID} userMap={userMap} quizID={quiz.quizInfo.quizID}/></TableCell>
                            {/*<TableCell><Button onClick={()=>handleGoToQuiz(uuid)}>{buttonTitle}</Button></TableCell>*/}
                        </TableRow>
                    );
                })
                }
            </TableBody>
        </Table>
    )
}
