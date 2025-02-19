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
import {AvailableQuiz} from "~/routes/class.$classUUID._index";
import {Infinity} from "lucide-react";
import {OAuthUser} from "~/auth.server";

export function QuizTable({tableTitle, uuids, buttonTitle, buttonClickFunction}:{ tableTitle:string, uuids:string[], buttonTitle:string, buttonClickFunction:(uuid:string) => void}) {
    // const navigate = useNavigate();
    //
    // const handleGoToQuiz = (uuid:string) => {
    //     navigate("/websocketTest");
    // };
    return (
        <Table>
            <TableCaption>{tableTitle}</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="">UUID</TableHead>
                    <TableHead className="text-right">Button</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {uuids.map((uuid) => (
                    <TableRow key={uuid}>
                        <TableCell className="font-medium">{uuid}</TableCell>
                        <TableCell className="text-right"><Button onClick={() => buttonClickFunction(uuid)}>{buttonTitle}</Button></TableCell>
                        {/*<TableCell><Button onClick={()=>handleGoToQuiz(uuid)}>{buttonTitle}</Button></TableCell>*/}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export function AvailableQuizTable({classID, user, availableQuizzes, isEducator}:{ classID:string, user:OAuthUser, availableQuizzes:AvailableQuiz[], isEducator: boolean}) {
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
                            {/*<TableCell><Button onClick={()=>handleGoToQuiz(uuid)}>{buttonTitle}</Button></TableCell>*/}
                        </TableRow>
                    );
                })
                }
            </TableBody>
        </Table>
    )
}
