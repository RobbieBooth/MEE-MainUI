import React, { useState } from "react";
import { useStompWithSend } from "~/components/hooks/stompMessageHook";
import {QuizTable} from "~/components/quizSection/quizDisplayPage";
import {StudentQuizAttempt} from "~/components/MEETypes/studentAttempt";
import { useNavigate } from "@remix-run/react";
import {Button} from "~/components/ui/button";

type Student = {
    studentUUID: string;
    availableQuiz: string[];
    attemptedQuiz: string[];
};

export default function StudentPage() {
    const [student, setStudent] = useState<Student|null>(null);
    const [error, setError] = useState<string | null>(null);
    const [id, setId] = useState<string>(""); // Input field for student ID
    const navigate = useNavigate();

    const fetchStudentById = async (studentUUID:string) => {
        try {
            const response = await fetch(`http://localhost:8080/v1/api/student/${studentUUID}`, {
                method: "GET", // or 'POST', 'PUT', 'DELETE', etc.
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: Student = await response.json();
            setStudent(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred");
            setStudent(null); // Clear previous student data
        }
    };

    const handleFetch = () => {
        if (id.trim()) {
            fetchStudentById(id);
        } else {
            setError("Please enter a valid student ID");
        }
    };

    const createStudentQuizAttempt = async (studentUUID:string, quizUUID:string) => {
        let data:StudentQuizAttempt | null = null;
        try {
            const response = await fetch(`http://localhost:8080/v1/api/student/${studentUUID}/startQuiz/${quizUUID}`, {
                method: "Put", // or 'POST', 'PUT', 'DELETE', etc.
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            data = await response.json();
            if(data == null){
                throw new Error("Data null!");
            }
            openQuiz(data.studentQuizAttemptUUID);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred");
            setStudent(null); // Clear previous student data
        }
    };

    const openQuiz = (uuid:string) => {
        navigate(`/quiz/${uuid}`);
    };

    return (
        <div>
            <h1>Fetch Student By ID</h1>
            <input
                type="text"
                placeholder="Enter Student ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
            />
            <button onClick={handleFetch}>Fetch Student</button>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {student && (
                <div>
                    <h1>Viewing Student with id: {student.studentUUID}</h1>
                    <QuizTable tableTitle={"Quiz Questions"} uuids={student.availableQuiz} buttonTitle={"Start Quiz"} buttonClickFunction={(quizUUID:string) => {createStudentQuizAttempt(student.studentUUID, quizUUID)}}/>
                    <QuizTable tableTitle={"Student Quiz Attempts"} uuids={student.attemptedQuiz} buttonTitle={"Open Quiz"} buttonClickFunction={openQuiz}/>
                    <Button onClick={() => navigate("/setting")}>Create Quiz</Button>
                </div>
            )}


        </div>
    );
}