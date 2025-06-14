import RtkQueryService from '@/services/RtkQueryService'
import React, { useState } from 'react'
import StudentsTable from './components/StudentsTable'
import { Checkbox, MenuItem, Select } from '@mui/material'
import { Button, Input, Notification, Spinner, toast } from '@/components/ui'
import { IoIosSearch } from 'react-icons/io'
import { groups } from '@/@types/group'
import { FilterParams, Sorting } from '@/@types/student'

const StudentsDebt = () => {
    const initialFilterData = {
        search: '',
        department: '',
        gender: '',
        group: '',
        has_debt: true,
    }
    const [params, setParams] = useState<FilterParams>(initialFilterData)
    const [filter, setFilter] = useState<FilterParams>(initialFilterData)
    const [sorting, setSorting] = useState<string>()
    const [checkMode, setCheckMode] = useState<boolean>(false)
    const [selectedStudents, setSelectedStudents] = useState([])

    const [page, setPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState(20)
    const [totalCount, setTotalCount] = useState(0)

    const cleanParams = (filters: FilterParams): FilterParams => {
        return Object.fromEntries(
            Object.entries(filters).filter(
                ([_, value]) =>
                    value != null && value !== '' && value !== undefined,
            ),
        ) as FilterParams
    }

    const {
        data: studentsDebt,
        refetch,
        isLoading,
    } = RtkQueryService.useGetFilteredStudentsQuery({
        params: cleanParams(filter),
        page,
        sortings: sorting,
    })

    const [sendSmsTodebtors, { isLoading: isSendingSms }] =
        RtkQueryService.useSendSmsToDebtorsMutation()

    const { data: groups } = RtkQueryService.useGetAllGroupsQuery({
        params: params?.department ? { department: params.department } : {},
    })

    React.useEffect(() => {
        setTotalCount(studentsDebt?.count)
    }, [page, studentsDebt])

    // Функция для применения фильтров
    const applyFilters = () => {
        const cleanedParams = cleanParams(params) // Убираем пустые параметры
        setFilter(cleanedParams) // Обновляем параметры
    }

    // Функция для сброса фильтров
    const resetFilters = () => {
        setParams(initialFilterData)
        setFilter(initialFilterData)
        setPage(1)
        refetch()
    }

    if (isLoading) {
        return (
            <div className=" w-full h-full flex items-center justify-center">
                <Spinner size="3.25rem" />
            </div>
        )
    }

    const openNotification = (
        type: 'success' | 'warning' | 'danger' | 'info',
    ) => {
        toast.push(
            <Notification
                title={type.charAt(0).toUpperCase() + type.slice(1)}
                type={type}
            >
                {type === 'success' && 'Усепшно'}
                {type === 'danger' && 'Ошибка'}
            </Notification>,
        )
    }

    const sendSms = () => {
        if (confirm('Выдействительно хотите отправить СМС?')) {
            sendSmsTodebtors({ data: { student_ids: selectedStudents } }).then(
                (res: unknown) => {
                    //@ts-ignore
                    if (res?.data) {
                        openNotification('success')
                        setCheckMode(false)
                    }
                    //@ts-ignore
                    if (res?.error) {
                        openNotification('danger')
                    }
                },
            )
        }
    }

    return (
        <div>
            <div>
                <h1 className={'mb-5 '}>Список должников</h1>
                <div className="mb-3">
                    <h3>Фильтры</h3>
                    <div className="flex flex-col items-start gap-2 w-full">
                        <div className="flex gap-2 items-center w-full">
                            <label className="w-[18%]">
                                Поиск
                                <Input
                                    value={params?.search}
                                    onChange={(event) => {
                                        setParams({
                                            ...params,
                                            search: event.target.value,
                                        })
                                    }}
                                    prefix={<IoIosSearch size={18} />}
                                    type="search"
                                    placeholder="Поиск"
                                />
                            </label>
                            <label className="w-[18%]">
                                Отдел
                                <Select
                                    value={params?.department || ''}
                                    sx={{
                                        height: '44px',
                                        borderRadius: '5px',
                                    }}
                                    className={'w-full'}
                                    placeholder="Отдел"
                                    onChange={(e) =>
                                        setParams((prev) => ({
                                            ...prev,
                                            department: e.target.value || null, // null для пустого значения
                                        }))
                                    }
                                >
                                    <MenuItem value={''}>Не выбрано</MenuItem>
                                    <MenuItem value={'SCHOOL'}>Школа</MenuItem>
                                    <MenuItem value={'KINDERGARTEN'}>
                                        Дет сад
                                    </MenuItem>
                                    <MenuItem value={'CAMP'}>Лагерь</MenuItem>
                                </Select>
                            </label>
                            <label className="w-[18%]">
                                Пол
                                <Select
                                    value={params?.gender || ''}
                                    sx={{
                                        height: '44px',
                                        borderRadius: '5px',
                                    }}
                                    className={'w-full'}
                                    placeholder="Пол"
                                    onChange={(e) =>
                                        setParams((prev) => ({
                                            ...prev,
                                            gender: e.target.value || '', // null для пустого значения
                                        }))
                                    }
                                >
                                    <MenuItem value={''}>Не выбрано</MenuItem>
                                    <MenuItem value={'MALE'}>Мальчик</MenuItem>
                                    <MenuItem value={'FEMALE'}>
                                        Девочка
                                    </MenuItem>
                                </Select>
                            </label>
                            <label className="w-[18%]">
                                Группа
                                <Select
                                    value={params?.group || ''}
                                    sx={{
                                        height: '44px',
                                        borderRadius: '5px',
                                    }}
                                    className={'w-full'}
                                    placeholder="Группа"
                                    onChange={(e) =>
                                        setParams((prev) => ({
                                            ...prev,
                                            group: e.target.value || null, // null для пустого значения
                                        }))
                                    }
                                >
                                    <MenuItem value={''}>Не выбрано</MenuItem>
                                    {(groups?.results || groups)?.map((group: groups) => (
                                        <MenuItem
                                            key={group.id}
                                            value={group.id}
                                        >
                                            {group.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </label>
                        </div>
                        <div className="btns flex gap-2 justify-end">
                            <Button variant="solid" onClick={applyFilters}>
                                Подтвердить
                            </Button>
                            <Button
                                type="button"
                                onClick={resetFilters}
                                variant="solid"
                                color="red-500"
                            >
                                Сбросить
                            </Button>
                            {!checkMode && (
                                <Button
                                    type="button"
                                    onClick={() => setCheckMode(true)}
                                    variant="solid"
                                >
                                    Выбрать для отправки СМС
                                </Button>
                            )}
                            {checkMode && (
                                <Button
                                    type="button"
                                    disabled={isSendingSms}
                                    onClick={() => sendSms()}
                                    variant="solid"
                                >
                                    Отправить СМС{' '}
                                    {isSendingSms && <Spinner size={'sm'} />}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                <StudentsTable
                    checkMode={checkMode}
                    setSorting={setSorting}
                    refetch={refetch}
                    totalCount={totalCount}
                    page={page}
                    pageSize={pageSize}
                    setPage={setPage}
                    studentsData={studentsDebt?.results}
                    //@ts-ignore
                    selectedStudents={selectedStudents}
                    //@ts-ignore
                    setSelectedStudents={setSelectedStudents}
                />
            </div>
            {studentsDebt?.length === 0 && <h1>Должников нет</h1>}
        </div>
    )
}

export default StudentsDebt
