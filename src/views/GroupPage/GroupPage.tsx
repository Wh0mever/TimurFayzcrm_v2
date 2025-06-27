import React, {useState} from 'react';
import {useParams} from "react-router-dom";
import rtkQueryService from "@/services/RtkQueryService";
import GroupStudentsTable from "@/views/GroupPage/components/GroupStudentsTable";
import AddStudent from "@/views/GroupPage/components/AddStudent";
import {Button, Spinner} from "@/components/ui";
import GoBackButton from "@/components/shared/GoBackButton";

const GroupPage = () => {
    const adminData = localStorage.getItem("admin");
    let token: string | null = null;
    if (adminData) {
        try {
            const parsedAdmin = JSON.parse(adminData);
            const authData = JSON.parse(parsedAdmin?.auth ?? '{}'); // Handle missing `auth`
            token = authData?.session?.token ?? null; // Safely access nested properties
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    }

    const [sorting, setSorting] = useState<string>();

    const {groupId} = useParams()
    const { data: groupData} = rtkQueryService.useGetGroupDetailsQuery({token, id: groupId})
    const {data: filteredStudents, refetch, isLoading} = rtkQueryService.useGetFilteredStudentsQuery({token, params:{group:groupId}, sortings:sorting})
    const [open, setOpen] = useState<boolean>(false)

    if(isLoading) {
        return(
            <div className=' w-full h-full flex items-center justify-center'>
                <Spinner size="3.25rem" />
            </div>
        )
    }

    return (
        <div>
            <GoBackButton/>
            <div className={'flex justify-between mt-5'}>
                <h1 className={'mb-10'}>{groupData?.name}</h1>
                <Button onClick={() => setOpen(true)} variant={'solid'}>Добавить студента</Button>
            </div>
            <GroupStudentsTable refetch={refetch} setSorting={setSorting} studentsData={groupData} studentsArray={filteredStudents}></GroupStudentsTable>
            {open && <AddStudent groupData={groupData} refetch={refetch} open={open} setOpen={setOpen}/>}
        </div>
    );
};


export default GroupPage;