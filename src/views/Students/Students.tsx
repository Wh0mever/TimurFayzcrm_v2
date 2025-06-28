import React, { useEffect, useState } from 'react'
import StudentsTable from '@/views/Students/components/StudentsTable'
import Button from '@/components/ui/Button'
import { HiPlusCircle } from 'react-icons/hi'
import rtkQueryService from '@/services/RtkQueryService'
import PostNewStudent from '@/views/Students/components/PostNewStudent'
import { useAppSelector } from '@/store'
import { Input, Spinner } from '@/components/ui'
import { IoIosSearch } from 'react-icons/io'
import { MdFilterAlt } from 'react-icons/md'
import { Checkbox, DialogContent, MenuItem, Select } from '@mui/material'
import { groups } from '@/@types/group'
import { FilterParams, Sorting } from '@/@types/student'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { useSearchParams } from 'react-router-dom'

const initialFilterData: FilterParams = {
    search: '',
    department: '',
    gender: '',
    marked_for_delete: false,
    group: '',
    has_bonus: false,
    bonus_start_date: null,
    bonus_end_date: null,
}

const Students = () => {
    const { authority, first_name, last_name } = useAppSelector(
        (state) => state.auth.user,
    )

    const [searchParams, setSearchParams] = useSearchParams()

    const parseParamsFromSearch = (): FilterParams => {
        return {
            search: searchParams.get('search') || '',
            department: searchParams.get('department') || '',
            gender: searchParams.get('gender') || '',
            marked_for_delete: searchParams.get('marked_for_delete') === 'true',
            group: searchParams.get('group') || '',
            has_bonus: searchParams.get('has_bonus') === 'true',
            bonus_start_date: searchParams.get('bonus_start_date') || null,
            bonus_end_date: searchParams.get('bonus_end_date') || null,
        }
    }

    const [params, setParams] = useState<FilterParams>(parseParamsFromSearch())
    const [filter, setFilter] = useState<FilterParams>(parseParamsFromSearch())
    const [sorting, setSorting] = useState<string>()
    const [filterOpen, setFilterOpen] = useState(false)

    const [page, setPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState(20)
    const [totalCount, setTotalCount] = useState(0)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)

    const cleanParams = (filters: FilterParams): FilterParams => {
        return Object.fromEntries(
            Object.entries(filters).filter(
                ([_, value]) =>
                    value != null && value !== '' && value !== undefined,
            ),
        ) as FilterParams
    }

    const {
        data: filteredStudents,
        refetch,
        isLoading,
    } = rtkQueryService.useGetFilteredStudentsQuery({
        params: cleanParams(filter),
        page,
        sortings: sorting,
    })

    const { data: groups, error: groupsError, isLoading: groupsLoading } =
        rtkQueryService.useGetAllGroupsQuery({
            params: params?.department ? { department: params.department } : {},
        })

    useEffect(() => {
        setTotalCount(filteredStudents?.count || 0)
    }, [page, filteredStudents])

    const applyFilters = () => {
        const cleanedParams = cleanParams(params)
        setFilter(cleanedParams)
        setPage(1)
        setFilterOpen(false)

        const queryObj: Record<string, string> = {}

        for (const [key, value] of Object.entries(cleanedParams)) {
            if (value !== null && value !== undefined && value !== '') {
                queryObj[key] = String(value)
            }
        }

        setSearchParams(queryObj)
    }

    const resetFilters = () => {
        setParams(initialFilterData)
        setFilter(initialFilterData)
        setPage(1)
        refetch()
        setFilterOpen(false)
        setSearchParams({})
    }

    const handleGetBonusStartDate = (e: any) => {
        const formattedDate = dayjs(e).format('YYYY-MM-DD')
        setParams({ ...params, bonus_start_date: formattedDate })
    }

    const handleGetBonusEndDate = (e: any) => {
        const formattedDate = dayjs(e).format('YYYY-MM-DD')
        setParams({ ...params, bonus_end_date: formattedDate })
    }

    const handleChagenBonus = () => {
        setParams({
            ...params,
            has_bonus: !params.has_bonus,
            bonus_start_date: null,
            bonus_end_date: null,
        })
    }

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Spinner size="3.25rem" />
            </div>
        )
    }

    return (
        <div>
            <div className="mb-5 flex justify-between">
                <h1>
                    Список студентов{' '}
                    {authority?.includes('TEACHER') &&
                        `${first_name} ${last_name}`}
                </h1>
                <div className="w-30">
                    {(authority?.includes('MANAGER') ||
                        authority?.includes('ADMIN')) && (
                        <Button
                            block
                            variant="solid"
                            size="sm"
                            icon={<HiPlusCircle />}
                            onClick={() => setDialogIsOpen(true)}
                        >
                            Добавить студента
                        </Button>
                    )}
                </div>
            </div>

            <div className="mb-3">
                <h3>Фильтры</h3>
                <div className="flex items-start gap-2 flex-col w-full">
                    <div className="flex gap-2 items-center w-full flex-wrap">
                        <label className="w-[18%]">
                            Поиск
                            <Input
                                value={params.search}
                                onChange={(e) =>
                                    setParams({ ...params, search: e.target.value })
                                }
                                prefix={<IoIosSearch size={18} />}
                                type="search"
                                placeholder="Поиск"
                            />
                        </label>
                        <label className="w-[18%]">
                            Отдел
                            <Select
                                value={params.department || ''}
                                onChange={(e) =>
                                    setParams({ ...params, department: e.target.value })
                                }
                                sx={{ height: '44px', borderRadius: '5px' }}
                                className="w-full"
                            >
                                <MenuItem value="">Не выбрано</MenuItem>
                                <MenuItem value="SCHOOL">Школа</MenuItem>
                                <MenuItem value="KINDERGARTEN">Дет сад</MenuItem>
                                <MenuItem value="CAMP">Лагерь</MenuItem>
                            </Select>
                        </label>
                        <label className="w-[18%]">
                            Пол
                            <Select
                                value={params.gender || ''}
                                onChange={(e) =>
                                    setParams({ ...params, gender: e.target.value })
                                }
                                sx={{ height: '44px', borderRadius: '5px' }}
                                className="w-full"
                            >
                                <MenuItem value="">Не выбрано</MenuItem>
                                <MenuItem value="MALE">Мальчик</MenuItem>
                                <MenuItem value="FEMALE">Девочка</MenuItem>
                            </Select>
                        </label>
                        <label className="w-[18%]">
                            Группа
                            <Select
                                value={params.group || ''}
                                onChange={(e) =>
                                    setParams({ ...params, group: e.target.value })
                                }
                                sx={{ height: '44px', borderRadius: '5px' }}
                                className="w-full"
                            >
                                <MenuItem value="">Не выбрано</MenuItem>
                                {(groups?.results || groups)?.map((group: groups) => (
                                    <MenuItem key={group.id} value={group.id}>
                                        {group.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </label>
                        <label className="flex flex-col w-[18%]">
                            Неправильные данные
                            <Checkbox
                                sx={{ width: 'fit-content' }}
                                checked={params.marked_for_delete}
                                onChange={() =>
                                    setParams({
                                        ...params,
                                        marked_for_delete: !params.marked_for_delete,
                                    })
                                }
                            />
                        </label>
                        <label className="flex flex-col w-[18%]">
                            Льготник
                            <Checkbox
                                sx={{ width: 'fit-content' }}
                                checked={params.has_bonus}
                                onChange={handleChagenBonus}
                            />
                        </label>
                        {params.has_bonus && (
                            <div className="flex gap-3">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Начало"
                                        value={
                                            params.bonus_start_date
                                                ? dayjs(params.bonus_start_date)
                                                : null
                                        }
                                        onChange={handleGetBonusStartDate}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                height: '44px',
                                            },
                                        }}
                                        format="YYYY-MM-DD"
                                    />
                                </LocalizationProvider>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Конец"
                                        value={
                                            params.bonus_end_date
                                                ? dayjs(params.bonus_end_date)
                                                : null
                                        }
                                        onChange={handleGetBonusEndDate}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                height: '44px',
                                            },
                                        }}
                                        format="YYYY-MM-DD"
                                    />
                                </LocalizationProvider>
                            </div>
                        )}
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

            {/* @ts-ignore */}
            <StudentsTable
                setSorting={setSorting}
                refetch={refetch}
                studentsData={filteredStudents?.results}
                page={page}
                pageSize={pageSize}
                setPage={setPage}
                totalCount={totalCount}
            />

            {dialogIsOpen && (
                <PostNewStudent
                    dialogIsOpen={dialogIsOpen}
                    setDialogIsOpen={setDialogIsOpen}
                    refetch={refetch}
                    isLoading={isLoading}
                />
            )}
        </div>
    )
}

export default Students
