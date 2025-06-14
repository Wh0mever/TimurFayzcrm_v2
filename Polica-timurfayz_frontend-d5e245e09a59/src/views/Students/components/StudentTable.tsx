import React, { useEffect, useState, useMemo } from 'react'
import rtkQueryService from '@/services/RtkQueryService'
import { FilterParams, Sorting } from '@/@types/student'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    CircularProgress,
} from '@mui/material'

// Типы данных, которые приходят с бэкенда
interface Student {
    id: number
    full_name: string
    gender: 'MALE' | 'FEMALE'
    phone_number: string
    balance: string
    group_names: string[]
}


interface IProps {
    filter?: FilterParams
    sortings?: Sorting
}

const StudentsTable: React.FC<IProps> = ({ filter = {} }) => {
    const [students, setStudents] = useState<Student[]>([])
    const [totalCount, setTotalCount] = useState<number>(0)
    const [page, setPage] = useState<number>(0) // MUI использует нумерацию с 0


    const cleanParams = (params: Record<string, any>) => {
        return Object.fromEntries(
            Object.entries(params).filter(
                ([_, value]) => value !== null && value !== '' && value !== undefined
            )
        )
    }
    
    const queryParams = useMemo(() => {
        const rawParams = {
            ...filter,
            page: page + 1
        }


    
        return cleanParams(rawParams)
    }, [filter, page])
    

    const {
        data: filteredStudents,
        isSuccess,
        isLoading,
        refetch
    } = rtkQueryService.useGetFilteredStudentsQuery(
        { params: queryParams },
        { refetchOnMountOrArgChange: true },
    )

    useEffect(() => {
        if (isSuccess && filteredStudents) {
            setStudents(filteredStudents.results)
            setTotalCount(filteredStudents.count)
        }
    }, [filteredStudents, isSuccess])


    useEffect(() => {
        refetch()
        setPage(0)
    }, [filter])


    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>ФИО</TableCell>
                            <TableCell>Пол</TableCell>
                            <TableCell>Телефон</TableCell>
                            <TableCell>Баланс</TableCell>
                            <TableCell>Группа</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.id}</TableCell>
                                    <TableCell>{student.full_name}</TableCell>
                                    <TableCell>
                                        {student.gender === 'MALE'
                                            ? 'Мужской'
                                            : 'Женский'}
                                    </TableCell>
                                    <TableCell>
                                        {student.phone_number}
                                    </TableCell>
                                    <TableCell>{student.balance} сум</TableCell>
                                    <TableCell>
                                        {student.group_names.join(', ')}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={20}
                rowsPerPageOptions={[20]}
            />
        </Paper>
    )
}

export default StudentsTable

