import React, {useState} from 'react';
import rtkQueryService from "@/services/RtkQueryService";
import {Table} from "@/components/ui";
import THead from "@/components/ui/Table/THead";
import Tr from "@/components/ui/Table/Tr";
import Th from "@/components/ui/Table/Th";
import TBody from "@/components/ui/Table/TBody";
import Td from "@/components/ui/Table/Td";
import {MdDelete, MdEdit} from "react-icons/md";
import UpdateStudentDetails from "@/views/Students/components/UpdateStudentDetails";
import {student} from "@/@types/student";
import {useParams} from "react-router-dom";
import { groups } from '@/@types/group';
import { useAppSelector } from '@/store';
import { StringNullableChain } from 'lodash';
import { RiArrowDownSFill, RiArrowUpSFill } from 'react-icons/ri';

type stds = {
    end_date: string,
    id: number
    name: string
    price: string
    start_date: string 
    students: student[]
    teacher: number | null
    teacher_obj: object | null,
    student_ids?:number[]
}

interface GroupStudentsTable {
    studentsData: stds,
    setSorting:React.Dispatch<React.SetStateAction<string | undefined>>,
    studentsArray: student[],
    refetch: () => void
}


const GroupStudentsTable = (props:GroupStudentsTable) => {
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

    const {studentsData, setSorting, studentsArray, refetch} = props

    const {groupId} = useParams()
    // const {refetch} = rtkQueryService.useGetGroupDetailsQuery({token, id:groupId})
    const [deleteStudent] = rtkQueryService.useUpdateGroupDetailsMutation()
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)
    const [currentStd, setCurrentStd] = useState<student>({
        "id": 0,
        "full_name": 'string',
        "gender": 'string',
        "phone_number": 'string',
        "parent_phone_number": 'string',
        "birthday_date": 'string',
        "comment": 'string',
        "balance":'string',
        "avatar": 'string',
        marked_for_delete: false,
        account_number: 0
    })

    const sendDeleteRequest = (id:number, data:object) => {
        if(confirm()) {
            const newData = {id: studentsData.id, student_ids: studentsArray.map((item:student) => item.id).filter((item:number) => item !== id)}
            deleteStudent({data: newData, token})
                .then(() => {
                    refetch()
                })
            setDialogIsOpen(false)
        }
    }

    const {authority} = useAppSelector(
        (state) => state.auth.user
    )    


    const [sortState, setSortState] = useState<{ [key: string]: 'asc' | 'desc' | null }>({
        full_name: null,
        gender: null,
        balance: null,
      });


    const handleSort = (column: string) => {
        setSortState((prevState) => {
          const newState = { ...prevState };
          if (prevState[column] === 'asc') {
            newState[column] = 'desc'; // Переключение на убывающую сортировку
          } else if (prevState[column] === 'desc') {
            newState[column] = null; // Сброс сортировки
          } else {
            newState[column] = 'asc'; // Прямая сортировка
          }
          return newState;
        });
      };
    
      // Генерация строки сортировки
      const generateSortString = () => {
        return Object.entries(sortState)
          .filter(([_, value]) => value !== null) // Оставляем только активные сортировки
          .map(([key, value]) => (value === 'desc' ? `-${key}` : key))
          .join(',');
      };

      setSorting(generateSortString())
    


    return (
        <Table>
            <THead>
                <Tr>
                    <Th>
                        <div className='flex gap-1 items-center'>
                            <span>Ф.И.О</span>
                            <div className="btns">
                                {sortState.full_name === null && <RiArrowDownSFill onClick={() => handleSort('full_name')} size={30} className='cursor-pointer'/>}
                                {(sortState.full_name === 'desc') && <RiArrowDownSFill color='#4f46e5' onClick={() => handleSort('full_name')} size={30} className='cursor-pointer'/>}
                                {(sortState.full_name === 'asc') && <RiArrowUpSFill color='#4f46e5' onClick={() => handleSort('full_name')} size={30} className='cursor-pointer'/>}                                
                            </div>
                        </div>
                    </Th>
                    <Th>
                        <div className='flex gap-1 items-center'>
                            <span>Пол</span>
                            <div className="btns">
                                {sortState.gender === null && <RiArrowDownSFill onClick={() => handleSort('gender')} size={30} className='cursor-pointer'/>}
                                {(sortState.gender === 'desc') && <RiArrowDownSFill color='#4f46e5' onClick={() => handleSort('gender')} size={30} className='cursor-pointer'/>}
                                {(sortState.gender === 'asc') && <RiArrowUpSFill color='#4f46e5' onClick={() => handleSort('gender')} size={30} className='cursor-pointer'/>}
                            </div>
                        </div>
                    </Th>
                    <Th>
                        Номер телефона
                    </Th>
                    <Th>
                        Номер телефона родителей
                    </Th>
                    <Th>
                        Дата рождения
                    </Th>
                    <Th>
                        Дата вступления в группу
                    </Th>
                    <Th>
                    <div className='flex gap-1 items-center'>
                            <span>Баланс</span>
                            <div className="btns">
                                {sortState.balance === null && <RiArrowDownSFill onClick={() => handleSort('balance')} size={30} className='cursor-pointer'/>}
                                {(sortState.balance === 'desc') && <RiArrowDownSFill color='#4f46e5' onClick={() => handleSort('balance')} size={30} className='cursor-pointer'/>}
                                {(sortState.balance === 'asc') && <RiArrowUpSFill color='#4f46e5' onClick={() => handleSort('balance')} size={30} className='cursor-pointer'/>}
                            </div>
                        </div>
                    </Th>
                    {authority?.includes('MANAGER') && (
                        null
                    )}
                    {authority?.includes('ADMIN') && (
                        <Th>
                            Действие
                        </Th>
                    )}
                </Tr>
            </THead>
            <TBody>
                {
                    studentsArray?.map((std: student) =>
                        <Tr key={std.id}>
                            <Td>{std.full_name}</Td>
                            <Td>{std.gender === "MALE" ? 'Мальчик' : 'Девочка'}</Td>
                            <Td>{std.phone_number}</Td>
                            <Td>{std.parent_phone_number}</Td>
                            <Td>{std.birthday_date}</Td>
                            <Td>{std.joined_date}</Td>
                            <Td>{std.balance}</Td>
                            {authority?.includes('MANAGER') && (
                                // <Td className={'flex gap-1'}>
                                //     <MdDelete onClick={() => sendDeleteRequest(std.id, std)} className={'cursor-pointer'} size={20} color={'gray'}/>
                                //     <MdEdit onClick={() => {
                                //         setDialogIsOpen(true)
                                //         setCurrentStd(std)
                                //     }} className={'cursor-pointer'} size={20} color={'gray'}/>
                                // </Td>
                                null
                            )}
                            {authority?.includes('ADMIN') && (
                                <Td className={'flex gap-1'}>
                                    <MdDelete onClick={() => sendDeleteRequest(std.id, std)} className={'cursor-pointer'} size={20} color={'gray'}/>
                                </Td>
                            )}
                        </Tr>
                    )
                }
            </TBody>
            <UpdateStudentDetails refetch={refetch} dialogIsOpen={dialogIsOpen} setDialogIsOpen={setDialogIsOpen} studentData={currentStd}/>
        </Table>
    );
};


export default GroupStudentsTable;