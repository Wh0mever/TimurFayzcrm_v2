import React, { useState } from 'react'
import THead from '@/components/ui/Table/THead'
import Tr from '@/components/ui/Table/Tr'
import Th from '@/components/ui/Table/Th'
import Td from '@/components/ui/Table/Td'
import TBody from '@/components/ui/Table/TBody'
import { Checkbox, Pagination, Table } from '@/components/ui'
import { student } from '@/@types/student'
import {
    MdArrowDropDown,
    MdArrowDropUp,
    MdDelete,
    MdEdit,
} from 'react-icons/md'
import rtkQueryService from '@/services/RtkQueryService'
import UpdateStudentDetails from '@/views/Students/components/UpdateStudentDetails'
import TransferStudentDialog from '@/views/Students/components/TransferStudentDialog'
import { FaUserCircle } from 'react-icons/fa'
import { BsCurrencyDollar } from 'react-icons/bs'
import { useAppSelector } from '@/store'
import StudentPaymentDialog from './StudentPaymentDialog'
import { Link } from 'react-router-dom'
import { IoMdEye } from 'react-icons/io'
import { RiArrowDownSFill } from 'react-icons/ri'
import { RiArrowUpSFill } from 'react-icons/ri'
import { HiSwitchHorizontal } from 'react-icons/hi'
import formatNumber from '@/helpers/formatNumber'

interface StudentsTable {
    studentsData: student[]
    refetch: () => void
    setSorting?: React.Dispatch<React.SetStateAction<string | undefined>>
    checkMode?: boolean
    sendSms?: void
    selectedStudents: ''
    setSelectedStudents: () => void
    page: number
    pageSize: number
    setPage: (e: number) => void
    totalCount: number
}
const StudentsTable: React.FC<StudentsTable> = ({
    studentsData,
    refetch,
    setSorting,
    checkMode = false,
    selectedStudents,
    setSelectedStudents,
    page = 1,
    pageSize = 20,
    setPage,
    totalCount,
}) => {
    const [deleteStudent] = rtkQueryService.useDeleteStudentMutation()
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)
    const [paymentIsOpen, setPaymentIsOpen] = useState<boolean>(false)
    const [transferIsOpen, setTransferIsOpen] = useState<boolean>(false)
    const [currentStd, setCurrentStd] = useState<student>({
        id: 0,
        full_name: '',
        gender: '',
        phone_number: '',
        parent_phone_number: '',
        birthday_date: '',
        comment: '',
        balance: '',
        avatar: '',
        account_number: 0,
        marked_for_delete: false,
        has_bonus: false,
        group_names: [],
        department: '',
    })
    const [selectedAll, setSelectedAll] = useState(false)

    const allStudentIds = studentsData?.map((item) => item?.id)

    const sendDeleteRequest = (id: number) => {
        if (confirm()) {
            deleteStudent({
                id: id,
            }).then(() => {
                refetch()
            })
            setDialogIsOpen(false)
        }
    }

    const { authority } = useAppSelector((state) => state.auth.user)

    const [sortState, setSortState] = useState<{
        [key: string]: 'asc' | 'desc' | null
    }>({
        full_name: null,
        gender: null,
        balance: null,
    })

    const handleSort = (column: string) => {
        setSortState((prevState) => {
            const newState = { ...prevState }
            if (prevState[column] === 'asc') {
                newState[column] = 'desc' // Переключение на убывающую сортировку
            } else if (prevState[column] === 'desc') {
                newState[column] = null // Сброс сортировки
            } else {
                newState[column] = 'asc' // Прямая сортировка
            }
            return newState
        })
    }

    // Генерация строки сортировки
    const generateSortString = () => {
        return Object.entries(sortState)
            .filter(([_, value]) => value !== null) // Оставляем только активные сортировки
            .map(([key, value]) => (value === 'desc' ? `-${key}` : key))
            .join(',')
    }

    //@ts-ignore
    setSorting(generateSortString())

    const selectStudent = (id: any) => {
        //@ts-ignore
        if (selectedStudents.includes(id)) {
            //@ts-ignore
            setSelectedStudents((prevState) =>
                //@ts-ignore
                prevState.filter((item) => item !== id),
            )
            setSelectedAll(false)
        } else {
            //@ts-ignore
            setSelectedStudents((prevState) => [...prevState, id])
        }
    }

    const selectAllStudents = () => {
        setSelectedAll((prevState) => !prevState)
        //@ts-ignore
        setSelectedStudents(selectedAll ? [] : allStudentIds)
    }

    const handleChange = (e: any) => {
        setPage(e)
    }

    return (
        <>
            <Table>
                <THead>
                    <Tr>
                        {checkMode && (
                            <Th>
                                <Checkbox
                                    checked={selectedAll}
                                    onChange={selectAllStudents}
                                />
                            </Th>
                        )}
                        <Th>#</Th>
                        <Th>Аватарка</Th>
                        <Th>
                            <div className="flex gap-1 items-center">
                                <span>Ф.И.О</span>
                                <div className="btns">
                                    {sortState.full_name === null && (
                                        <RiArrowDownSFill
                                            onClick={() =>
                                                handleSort('full_name')
                                            }
                                            size={30}
                                            className="cursor-pointer"
                                        />
                                    )}
                                    {sortState.full_name === 'desc' && (
                                        <RiArrowDownSFill
                                            color="#4f46e5"
                                            onClick={() =>
                                                handleSort('full_name')
                                            }
                                            size={30}
                                            className="cursor-pointer"
                                        />
                                    )}
                                    {sortState.full_name === 'asc' && (
                                        <RiArrowUpSFill
                                            color="#4f46e5"
                                            onClick={() =>
                                                handleSort('full_name')
                                            }
                                            size={30}
                                            className="cursor-pointer"
                                        />
                                    )}
                                </div>
                            </div>
                        </Th>
                        <Th>Группа</Th>
                        <Th>
                            <div className="flex gap-1 items-center">
                                <span>Пол</span>
                                <div className="btns">
                                    {sortState.gender === null && (
                                        <RiArrowDownSFill
                                            onClick={() => handleSort('gender')}
                                            size={30}
                                            className="cursor-pointer"
                                        />
                                    )}
                                    {sortState.gender === 'desc' && (
                                        <RiArrowDownSFill
                                            color="#4f46e5"
                                            onClick={() => handleSort('gender')}
                                            size={30}
                                            className="cursor-pointer"
                                        />
                                    )}
                                    {sortState.gender === 'asc' && (
                                        <RiArrowUpSFill
                                            color="#4f46e5"
                                            onClick={() => handleSort('gender')}
                                            size={30}
                                            className="cursor-pointer"
                                        />
                                    )}
                                </div>
                            </div>
                        </Th>
                        <Th>Номер телефона</Th>
                        <Th>Доп. номер телефона</Th>
                        <Th>Дата рождения</Th>
                        {!authority?.includes('MANAGER') && (
                            <Th>
                                <div className="flex gap-1 items-center">
                                    <span>Баланс</span>
                                    <div className="btns">
                                        {sortState.balance === null && (
                                            <RiArrowDownSFill
                                                onClick={() =>
                                                    handleSort('balance')
                                                }
                                                size={30}
                                                className="cursor-pointer"
                                            />
                                        )}
                                        {sortState.balance === 'desc' && (
                                            <RiArrowDownSFill
                                                color="#4f46e5"
                                                onClick={() =>
                                                    handleSort('balance')
                                                }
                                                size={30}
                                                className="cursor-pointer"
                                            />
                                        )}
                                        {sortState.balance === 'asc' && (
                                            <RiArrowUpSFill
                                                color="#4f46e5"
                                                onClick={() =>
                                                    handleSort('balance')
                                                }
                                                size={30}
                                                className="cursor-pointer"
                                            />
                                        )}
                                    </div>
                                </div>
                            </Th>
                        )}
                        <Th>Лиц. счет</Th>
                        {authority?.includes('TEACHER') && null}
                        {authority?.includes('CASHIER') && <Th>Действие</Th>}
                        {authority?.includes('MANAGER') && <Th>Действие</Th>}
                        {authority?.includes('ADMIN') && <Th>Действие</Th>}
                    </Tr>
                </THead>
                <TBody>
                    {studentsData?.map((student: student, index) => (
                        <Tr
                            key={student.id}
                            style={{
                                backgroundColor: !student.marked_for_delete
                                    ? ''
                                    : '#FB040060',
                            }}
                        >
                            {checkMode && (
                                <Td>
                                    <Checkbox
                                        //@ts-ignore
                                        checked={selectedStudents.includes(
                                            //@ts-ignore
                                            student?.id,
                                        )}
                                        onChange={() =>
                                            selectStudent(student.id)
                                        }
                                    />
                                </Td>
                            )}
                            <Td>{(page - 1) * 20 + index + 1}</Td>
                            <Td>
                                {student.avatar ? (
                                    <img
                                        className={
                                            'rounded-full border-[1px] border-gray-500 w-[35px] h-[35px]'
                                        }
                                        src={student?.avatar}
                                        alt={'ava'}
                                    />
                                ) : (
                                    <FaUserCircle size={30} />
                                )}
                            </Td>
                            <Td>{student.full_name}</Td>
                            <Td>
                                <div className="flex">
                                    {student?.group_names?.map(
                                        (item: string, index) => (
                                            <span key={index}>
                                                {' '}
                                                {item + ', '}
                                            </span>
                                        ),
                                    )}
                                </div>
                            </Td>
                            <Td>
                                {student.gender === 'MALE'
                                    ? 'Мальчик'
                                    : 'Девочка'}
                            </Td>
                            <Td>{student.phone_number}</Td>
                            <Td>{student.parent_phone_number}</Td>
                            <Td>{student.birthday_date}</Td>
                            {!authority?.includes('MANAGER') && (
                                //@ts-ignore
                                <Td>{formatNumber(student?.balance)}</Td>
                            )}
                            <Td>{student.account_number}</Td>
                            {authority?.includes('MANAGER') && (
                                <Td>
                                    <div className={'flex gap-1'}>
                                        <MdEdit
                                            onClick={() => {
                                                setDialogIsOpen(true)
                                                setCurrentStd(student)
                                            }}
                                            className={'cursor-pointer'}
                                            size={20}
                                            color={'gray'}
                                        />
                                        <HiSwitchHorizontal
                                            onClick={() => {
                                                setTransferIsOpen(true)
                                                setCurrentStd(student)
                                            }}
                                            className={'cursor-pointer'}
                                            size={20}
                                            color={'gray'}
                                            title="Перевести в другую группу"
                                        />
                                    </div>
                                </Td>
                            )}
                            {authority?.includes('ADMIN') && (
                                <Td>
                                    <div className={'flex gap-1'}>
                                        <MdDelete
                                            onClick={() =>
                                                sendDeleteRequest(student?.id)
                                            }
                                            className={'cursor-pointer'}
                                            size={20}
                                            color={'gray'}
                                        />
                                        <MdEdit
                                            onClick={() => {
                                                setDialogIsOpen(true)
                                                setCurrentStd(student)
                                            }}
                                            className={'cursor-pointer'}
                                            size={20}
                                            color={'gray'}
                                        />
                                        <HiSwitchHorizontal
                                            onClick={() => {
                                                setTransferIsOpen(true)
                                                setCurrentStd(student)
                                            }}
                                            className={'cursor-pointer'}
                                            size={20}
                                            color={'gray'}
                                            title="Перевести в другую группу"
                                        />
                                        <BsCurrencyDollar
                                            onClick={() => {
                                                setPaymentIsOpen(true)
                                                setCurrentStd(student)
                                            }}
                                            className={'cursor-pointer'}
                                            size={20}
                                            color={'gray'}
                                        />
                                        <Link
                                            to={`/student/transactionHistory/${student.id}`}
                                        >
                                            <IoMdEye size={20} color={'gray'} />
                                        </Link>
                                    </div>
                                </Td>
                            )}
                            {authority?.includes('TEACHER') && null}
                            {authority?.includes('CASHIER') && (
                                <Td className={'flex gap-1'}>
                                    <div className={'flex gap-1'}>
                                        <Link
                                            to={`/student/transactionHistory/${student.id}`}
                                        >
                                            <IoMdEye size={20} color={'gray'} />
                                        </Link>
                                        <BsCurrencyDollar
                                            onClick={() => {
                                                setPaymentIsOpen(true)
                                                setCurrentStd(student)
                                            }}
                                            className={'cursor-pointer'}
                                            size={20}
                                            color={'gray'}
                                        />
                                    </div>
                                </Td>
                            )}
                        </Tr>
                    ))}
                </TBody>
                {paymentIsOpen && (
                    <StudentPaymentDialog
                        refetch={refetch}
                        isOpen={paymentIsOpen}
                        setIsOpen={setPaymentIsOpen}
                        studentData={currentStd}
                    />
                )}
                {dialogIsOpen && (
                    <UpdateStudentDetails
                        refetch={refetch}
                        dialogIsOpen={dialogIsOpen}
                        setDialogIsOpen={setDialogIsOpen}
                        studentData={currentStd}
                    />
                )}
                {transferIsOpen && (
                    <TransferStudentDialog
                        refetch={refetch}
                        isOpen={transferIsOpen}
                        setIsOpen={setTransferIsOpen}
                        studentData={currentStd}
                    />
                )}
            </Table>
            <Pagination
                currentPage={page}
                total={totalCount}
                onChange={handleChange}
                pageSize={pageSize}
                displayTotal
            />
        </>
    )
}

export default StudentsTable
