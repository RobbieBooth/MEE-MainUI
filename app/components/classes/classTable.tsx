import {AvailableQuiz, Class, getUserMap, UserMap} from "~/routes/class.$classUUID._index";
import {OAuthUser} from "~/auth.server";
import React, {ReactNode, useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "~/components/ui/table";
import {Infinity} from "lucide-react";
import {Button} from "~/components/ui/button";
import {AttemptsDialog} from "~/components/quizSection/studentAttemptsPage";
import {ClassForm} from "~/components/classes/creation/classCreation";
import NoItemsFound from "~/components/tables/noItemsFound";

export function ClassTable({user, classes}:{ user:OAuthUser, classes:Class[]}) {
    const navigate = useNavigate();
    const [userMaps, setUserMaps] = useState<Map<string, UserMap>>(new Map());
    const [classesHolder, setClassesHolder] = useState<Class[]>(classes);

    useEffect(() => {
        setClassesHolder(classes);
    }, [classes]);

    useEffect(() => {
        const fetchUserMaps = async () => {
            const newUserMaps = new Map<string, UserMap>();
            for (const selectedClass of classes) {
                const userMap = await getUserMap(selectedClass);
                newUserMaps.set(selectedClass.id, userMap);
            }
            setUserMaps(newUserMaps);
        };
        fetchUserMaps();
    }, [classesHolder]);

    const updateClassHolder = (updatedClass:Class)=> {
        let newClasses = [...classesHolder];
        let containsClass = false;
        newClasses = newClasses.map((value) =>{
            if(updatedClass.id === value.id){
                containsClass = true;
                return updatedClass;
            }else{
                return value;
            }
        });
        if(!containsClass){
            newClasses.push(updatedClass);
        }
        setClassesHolder(newClasses);
    }

    const handleGoToClass = (uuid:string) => {
        navigate(`/class/${uuid}`);
    };

    return (
        <Table>
            <TableCaption>Your Classes</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="">Class Name</TableHead>
                    <TableHead className="">Class Description</TableHead>
                    <TableHead className="">Educator Count</TableHead>
                    <TableHead className="">Student Count</TableHead>
                    <TableHead className="text-right">View Class</TableHead>
                    <TableHead className="text-right">Edit Class</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {classesHolder.map((selectedClass) => {
                    const userID = user.associatedDBUser!._id;
                    const userEmail = user.email;

                    const userMap:UserMap = userMaps.get(selectedClass.id) || new Map();

                    const isEducatorOfClass = selectedClass.educators.includes(userID);

                    return (<TableRow key={selectedClass.id}>
                            <TableCell className="font-medium">{selectedClass.className}</TableCell>
                            <TableCell className="font-medium">{selectedClass.classDescription}</TableCell>
                            <TableCell className="font-medium">{selectedClass.educators.length}</TableCell>
                            <TableCell className="font-medium">{selectedClass.students.length}</TableCell>
                            <TableCell className="text-right"><Button onClick={() => handleGoToClass(selectedClass.id)} size={"sm"}>View Class</Button></TableCell>
                            <TableCell className="text-right">{isEducatorOfClass &&
                                <ClassForm userEmail={userEmail ?? "UNKNOWN"}
                                           classFormFields={{id: selectedClass.id,
                                               classDescription: selectedClass.classDescription,
                                               className: selectedClass.className,
                                               classEducatorEmails: selectedClass.educators.map(uuid => userMap.get(uuid)?.email ?? "UNKNOWN"),
                                               classStudentEmails: selectedClass.students.map(uuid => userMap.get(uuid)?.email ?? "UNKNOWN")}}
                                           createOrEdit={"Edit"} updateOrEditClass={updateClassHolder}/>}
                            </TableCell>
                            {/*<TableCell><Button onClick={()=>handleGoToQuiz(uuid)}>{buttonTitle}</Button></TableCell>*/}
                        </TableRow>
                    );
                })
                }
                {classes.length === 0 && <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                        <NoItemsFound message={"No classes found... consider going to classes page to create one!"}/>
                    </TableCell>
                </TableRow>}
            </TableBody>
        </Table>
    )
}