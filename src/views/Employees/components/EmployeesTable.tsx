import React, {useState} from 'react';
import {Table} from "@/components/ui";
import THead from "@/components/ui/Table/THead";
import Tr from "@/components/ui/Table/Tr";
import Th from "@/components/ui/Table/Th";
import TBody from "@/components/ui/Table/TBody";
import Td from "@/components/ui/Table/Td";
import {MdEdit} from "react-icons/md";
import {employee} from "@/@types/employee";
import UpdateEmployeeDetails from "@/views/Employees/components/UpdateEmployeeDetails";
import { FaUserCircle } from "react-icons/fa";
import {object} from "yup";
import formatNumber from "@/helpers/formatNumber";

interface EmployeesTable {
    employees: employee[]
}

const userTypes = {
    ADMIN : 'Администратор ',
    MANAGER :'Менеджер ',
    CASHIER :'Кассир ',
    ACCOUNTANT  :'Бухгалтер ',
    TEACHER  :'Учитель ',
}



const EmployeesTable = (props: EmployeesTable) => {
    const {employees} = props
    const [currentEmpl, setCurrentEmpl] = useState<employee>({
        "id": 0,
        "user": {
            "id": 0,
            "username": 'string',
            "first_name": 'string',
            "last_name": 'string',
            "avatar": 'string',
            "user_type": 'string',
            "is_active": false
        },
        "salary": 'string'
    })
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)


    return (
        <Table>
            <THead>
                <Tr>
                    <Th>
                        Аватарка
                    </Th>
                    <Th>
                        Полное имя
                    </Th>
                    <Th>
                        Имя пользователя
                    </Th>
                    <Th>
                        Тип пользователя
                    </Th>
                    <Th>
                        Зарплата
                    </Th>
                    <Th>
                        Действие
                    </Th>
                </Tr>
            </THead>
            <TBody>
                {
                    employees?.map((employee: employee) =>
                        <Tr key={employee.id}>
                            <Td>{employee.user.avatar ? <img className={'w-[35px]'} src={employee.user.avatar}/> : <FaUserCircle size={35}/>}</Td>
                            <Td>{employee.user.first_name} {employee.user.last_name}</Td>
                            <Td>{employee.user.username}</Td>
                            <Td>{userTypes[employee.user.user_type as keyof typeof userTypes] ?? 'Неизвестный тип'}</Td>
                            <Td>{formatNumber(employee.salary)}</Td>
                            <Td className={''}>
                                <div className={'flex gap-3'}>
                                    {/*<MdDelete onClick={() => sendDeleteRequest(employee.id)} className={'cursor-pointer'} size={20} color={'gray'}/>*/}
                                    <MdEdit onClick={() => {
                                        setCurrentEmpl(employee)
                                        setDialogIsOpen(true)
                                    }} className={'cursor-pointer'} size={20} color={'gray'}/>
                                </div>
                            </Td>
                        </Tr>
                    )
                }
            </TBody>
            {dialogIsOpen && <UpdateEmployeeDetails dialogIsOpen={dialogIsOpen} setDialogIsOpen={setDialogIsOpen} employeeData={currentEmpl}/>}
        </Table>
    )
}

export default EmployeesTable;