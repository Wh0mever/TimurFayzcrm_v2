import React, { useEffect, useState } from 'react'
import rtkQueryService from '@/services/RtkQueryService'
import Button from '@/components/ui/Button'
import { HiPlusCircle } from 'react-icons/hi'
import PostNewGroup from '@/views/Groups/components/PostNewGroup'
import GroupsTable from '@/views/Groups/components/GroupsTable'
import { Checkbox, MenuItem, Select } from '@mui/material'
import { Input, Spinner } from '@/components/ui'
import { MdFilterAlt } from 'react-icons/md'
import { IoIosSearch } from 'react-icons/io'
import { useAppSelector } from '@/store'
import { teacher } from '@/@types/teacher'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

interface FilterParams {
    search?: string
    department?: string | null
    start_date?: string | null
    end_date?: string | null
    marked_for_delete?: boolean | undefined
    teacher?: string | null
}

const initialFilterData = {
    search: '',
    department: '',
    marked_for_delete: false,
    start_date: null,
    end_date: null,
    teacher: '',
}

const Groups = () => {
    const [params, setParams] = useState<FilterParams>(initialFilterData)
    const [filter, setFilter] = useState<FilterParams>(initialFilterData)
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
        data: groups,
        refetch,
        isLoading,
    } = rtkQueryService.useGetAllGroupsQuery({
        params: cleanParams(filter),
        page,
    })
    const { data: teachers } = rtkQueryService.useGetFilteredEmployeesQuery({
        params: params?.department
            ? { user_type: 'TEACHER', department: params.department }
            : {},
    })

    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)

    useEffect(() => {
        setTotalCount(groups?.count)
    }, [page, groups])

    // Функция для применения фильтров
    const applyFilters = () => {
        const cleanedParams = cleanParams(params) // Убираем пустые параметры
        setFilter(cleanedParams) // Обновляем параметры
        setPage(1);
    }

    // Функция для сброса фильтров
    const resetFilters = () => {
        setParams(initialFilterData)
        setFilter(initialFilterData)
        setPage(1)
        refetch()
    }

    const handleStartDatePickerChange = (e: any) => {
        const dateObject = dayjs(e)
        const formattedDate = dateObject.format('YYYY-MM-DD')
        setParams({ ...params, start_date: formattedDate })
    }

    const handleEndDatePickerChange = (e: any) => {
        const dateObject = dayjs(e)
        const formattedDate = dateObject.format('YYYY-MM-DD')
        setParams({ ...params, end_date: formattedDate })
    }

    // useEffect(applyFilters, [])

    const { authority } = useAppSelector((state) => state.auth.user)

    if (isLoading) {
        return (
            <div className=" w-full h-full flex items-center justify-center">
                <Spinner size="3.25rem" />
            </div>
        )
    }

    return (
        <div>
            <div className={'mb-5 flex justify-between'}>
                <h1>Группы</h1>
                <div className={'w-30'}>
                    {authority?.includes('ADMIN') && (
                        <Button
                            block
                            variant="solid"
                            size="sm"
                            icon={<HiPlusCircle />}
                            onClick={() => setDialogIsOpen(true)}
                        >
                            Добавить группу
                        </Button>
                    )}
                </div>
            </div>
            <div className="mb-2">
                <h3>Фильтры</h3>
                <div className="flex flex-col gap-2 items-start">
                    <div className="div flex flex-wrap gap-2 items-center">
                        <label className="w-[200px]">
                            Поиск
                            <Input
                                value={params.search || ''}
                                onChange={(event) => {
                                    setParams({
                                        ...params,
                                        search: event.target.value,
                                    })
                                    refetch()
                                }}
                                prefix={<IoIosSearch size={20} />}
                                type="search"
                                placeholder="Поиск"
                            />
                        </label>
                        <label className="w-[200px]">
                            Отдел
                            <Select
                                value={params.department || ''}
                                sx={{
                                    height: '44px',
                                    borderRadius: '5px',
                                }}
                                className={'w-full'}
                                placeholder="Отдел"
                                onChange={(event) =>
                                    setParams({
                                        ...params,
                                        department: event.target.value,
                                    })
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
                        <label className="w-[200px]">
                            Учитель
                            <Select
                                value={params.teacher || ''}
                                sx={{
                                    height: '44px',
                                    borderRadius: '5px',
                                }}
                                className={'w-full'}
                                placeholder="Отдел"
                                onChange={(event) =>
                                    setParams({
                                        ...params,
                                        teacher: event.target.value,
                                    })
                                }
                            >
                                <MenuItem value={''}>Не выбрано</MenuItem>
                                {teachers?.map((teacher: teacher) => (
                                    <MenuItem
                                        key={teacher.id}
                                        value={teacher.id}
                                    >
                                        {teacher.user.first_name}{' '}
                                        {teacher.user.last_name[0]}.
                                    </MenuItem>
                                ))}
                            </Select>
                        </label>
                        <label className="w-[200px]">
                            Дата начала
                            <LocalizationProvider
                                //@ts-ignore
                                sx={{
                                    height: '44px',
                                }}
                                dateAdapter={AdapterDayjs}
                            >
                                <DatePicker
                                    value={
                                        params.start_date
                                            ? dayjs(params.start_date)
                                            : null
                                    }
                                    onChange={handleStartDatePickerChange}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '44px',
                                        },
                                    }}
                                    format="YYYY-MM-DD"
                                />
                            </LocalizationProvider>
                        </label>
                        <label className="w-[200px]">
                            Дата завершения
                            <LocalizationProvider
                                //@ts-ignore
                                sx={{
                                    height: '44px',
                                }}
                                dateAdapter={AdapterDayjs}
                            >
                                <DatePicker
                                    value={
                                        params.end_date
                                            ? dayjs(params.end_date)
                                            : null
                                    }
                                    onChange={handleEndDatePickerChange}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '44px',
                                        },
                                    }}
                                    format="YYYY-MM-DD"
                                />
                            </LocalizationProvider>
                        </label>
                        <label className="flex flex-col w-[200px]">
                            Неправильные данные
                            <Checkbox
                                sx={{ width: 'fit-content' }}
                                checked={params.marked_for_delete}
                                onChange={() =>
                                    setParams({
                                        ...params,
                                        marked_for_delete:
                                            !params.marked_for_delete,
                                    })
                                }
                            />
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
                    </div>
                </div>
            </div>
            <GroupsTable
                refetch={refetch}
                groupsData={groups?.results}
                page={page}
                setPage={setPage}
                totalCount={totalCount}
                pageSize={pageSize}
            />
            {dialogIsOpen && (
                <PostNewGroup
                    refetch={refetch}
                    dialogIsOpen={dialogIsOpen}
                    setDialogIsOpen={setDialogIsOpen}
                />
            )}
        </div>
    )
}

export default Groups
