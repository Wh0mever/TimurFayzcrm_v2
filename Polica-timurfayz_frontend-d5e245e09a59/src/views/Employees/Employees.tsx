import React, {useState} from 'react';
import rtkQueryService from "@/services/RtkQueryService";
import Button from "@/components/ui/Button";
import {HiPlusCircle} from "react-icons/hi";
import EmployeesTable from "@/views/Employees/components/EmployeesTable";
import PostNewEmployee from "@/views/Employees/components/PostNewEmployee";

const Employees = () => {
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

    const { data: employees } = rtkQueryService.useGetAllEmployeesQuery({token})
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)
    return (
        <div>
            <div className={'mb-5 flex justify-between'}>
                <h1>Сотрудники</h1>
                <div className={'w-30'}>
                    <Button
                        block
                        variant="solid"
                        size="sm"
                        icon={<HiPlusCircle />}
                        onClick={() => setDialogIsOpen(true)}
                    >
                        Добавить сотрудника
                    </Button>
                </div>
            </div>
            <EmployeesTable employees={employees} />
            <PostNewEmployee
                dialogIsOpen={dialogIsOpen}
                setDialogIsOpen={setDialogIsOpen}
            />
        </div>
    );
};


export default Employees;