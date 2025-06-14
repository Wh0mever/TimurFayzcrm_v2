import React, { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { HiPlusCircle } from 'react-icons/hi'
import ExpendituresTable from '@/views/Kassa/Expenditures/components/ExpendituresTable'
import AddTransaction from '@/views/Kassa/Expenditures/components/AddTransaction'
import rtkQueryService from '@/services/RtkQueryService'
import { cashier } from '@/@types/cashiers'
import { useAppSelector } from '@/store'
import { MdFilterAlt } from 'react-icons/md'
import { Spinner, Table } from '@/components/ui'
import { Checkbox, MenuItem, Select } from '@mui/material'
import { outlayCategories } from '@/@types/outlayCategories'
import THead from '@/components/ui/Table/THead'
import Tr from '@/components/ui/Table/Tr'
import Th from '@/components/ui/Table/Th'
import TBody from '@/components/ui/Table/TBody'
import Td from '@/components/ui/Table/Td'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTimePicker } from '@mui/x-date-pickers'
import formatNumber from '@/helpers/formatNumber'
import PaymentSummaryTable from './components/PaymentSummaryTable'

const paymentMethods = {
    CARD: 'Карта',
    CASH: 'Наличные',
    TRANSFER: 'Перечисление',
    PAYME: 'Payme',
    HUMO: 'HUMO',
    UZCARD: 'UZCARD',
    CLICK: 'CLICK',
    UZUM: 'UZUM',
}

interface FilterParams {
    payment_type?: string | null
    payment_method?: string | null
    outlay_category?: number | null | string
    outlay?: number | null | string
    marked_for_delete?: boolean | undefined
    department?: string | null
    payment_model_type?: string | null
    start_date?: string | null
    end_date?: string | null
}

const initialFilterData = {
    department: '',
    marked_for_delete: false,
    payment_type: '',
    payment_method: '',
    outlay_category: '',
    outlay: '',
    payment_model_type: '',
    start_date: '',
    end_date: '',
}

function Expenditures() {
    const [isOpen, setIsOpen] = useState<boolean>()

    const [params, setParams] = useState<FilterParams>(initialFilterData)
    const [filter, setFilter] = useState<FilterParams>(initialFilterData)
    const [categoryId, setCategoryId] = useState<string | number | null>(0)

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

    const { data: cashiers } = rtkQueryService.useGetCashiersQuery({
        params: cleanParams(filter),
    })
    const { data: outlayItems } =
        rtkQueryService.useGetOutlayCategoryItemsQuery()
    const {
        data: payments,
        refetch,
        isLoading,
    } = rtkQueryService.useGetAllPaymentsQuery({
        params: cleanParams(filter),
        page,
    })

    const { data: paymentsSummary } =
        rtkQueryService.useGetPaymentsSummaryQuery({
            params: cleanParams(filter),
        })

    useEffect(() => {
        setTotalCount(payments?.count)
    }, [page, payments])

    // Функция для применения фильтров
    const applyFilters = () => {
        const cleanedParams = cleanParams(params) // Убираем пустые параметры
        setFilter(cleanedParams) // Обновляем параметры
        setPage(1)
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

    return (
        <div>
            <div className={'flex justify-between items-center mb-3'}>
                <div className={'flex flex-col gap-2'}>
                    <h2>Транзакции расходов/доходов</h2>
                </div>
                <div>
                    <Button
                        block
                        variant="solid"
                        size="sm"
                        icon={<HiPlusCircle />}
                        style={{
                            width: 'fit-content',
                        }}
                        onClick={() => setIsOpen(true)}
                    >
                        Добавить
                    </Button>
                </div>
                {isOpen && (
                    <AddTransaction
                        refetch={refetch}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                    />
                )}
            </div>
            <div className={'flex gap-1 flex-col mb-5'}>
                <h3>Касса</h3>
                <Table>
                    <THead>
                        <Tr>
                            {cashiers?.map((item: cashier) => (
                                <Th key={item.id}>
                                    {paymentMethods[item.payment_method]}
                                </Th>
                            ))}
                        </Tr>
                    </THead>
                    <TBody>
                        <Tr>
                            {cashiers?.map((item: cashier) => (
                                <Td key={item.id}>
                                    {formatNumber(item.amount)}
                                </Td>
                            ))}
                        </Tr>
                    </TBody>
                </Table>
            </div>

            <hr />

            <h3>Итоги</h3>
            <PaymentSummaryTable data={paymentsSummary} />

            <hr />

            <h4>Фильтры</h4>
            <div className="w-full flex flex-col items-start gap-2 mb-2">
                <div className="flex w-full items-center gap-2 flex-wrap">
                    <label className="flex flex-col gap-1  w-[160px]">
                        Тип транзакции
                        <Select
                            value={params.payment_type || ''}
                            sx={{
                                height: '44px',
                                borderRadius: '5px',
                            }}
                            className={'w-full'}
                            placeholder="Тип транзакции"
                            onChange={(e) =>
                                setParams((prev) => ({
                                    ...prev,
                                    payment_type: e.target.value || null, // null для пустого значения
                                }))
                            }
                        >
                            <MenuItem value={''}>Не выбрано</MenuItem>
                            <MenuItem value={'INCOME'}>ДОХОД</MenuItem>
                            <MenuItem value={'OUTCOME'}>РАСХОД</MenuItem>
                        </Select>
                    </label>
                    <label className={'flex flex-col gap-1  w-[160px]'}>
                        Дата начала
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                                ampm={false}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '44px',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        height: '44px',
                                    },
                                }}
                                value={
                                    params.start_date
                                        ? dayjs(params.start_date)
                                        : null
                                }
                                format="YYYY-M-D HH:MM"
                                onChange={(newValue) => {
                                    const formattedDate =
                                        dayjs(newValue).format(
                                            'YYYY-MM-DD HH:MM',
                                        )
                                    setParams((prev) => ({
                                        ...prev,
                                        start_date: formattedDate || null, // null для пустого значения
                                    }))
                                }}
                            />
                        </LocalizationProvider>
                    </label>
                    <label className={'flex flex-col gap-1  w-[160px]'}>
                        Дата конца
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                                ampm={false}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '44px',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        height: '44px',
                                    },
                                }}
                                format="YYYY-M-D HH:MM"
                                value={
                                    params.end_date
                                        ? dayjs(params.end_date)
                                        : null
                                }
                                onChange={(newValue) => {
                                    const formattedDate =
                                        dayjs(newValue).format(
                                            'YYYY-MM-DD HH:MM',
                                        )

                                    setParams((prev) => ({
                                        ...prev,
                                        end_date: formattedDate || null,
                                    }))
                                }}
                            />
                        </LocalizationProvider>
                    </label>
                    <label className={'flex flex-col gap-1  w-[160px]'}>
                        Выберите отдел
                        <Select
                            placeholder="Выберите отдел"
                            onChange={(e) =>
                                setParams((prev) => ({
                                    ...prev,
                                    department: e.target.value || null, // null для пустого значения
                                }))
                            }
                            value={params.department || ''}
                            sx={{
                                height: '44px',
                            }}
                        >
                            <MenuItem value={''}>Не выбрано</MenuItem>
                            <MenuItem value={'SCHOOL'}>Школа</MenuItem>
                            <MenuItem value={'CAMP'}>Лагерь</MenuItem>
                            <MenuItem value={'KINDERGARTEN'}>Дет сад</MenuItem>
                        </Select>
                    </label>
                    <label className={'flex flex-col gap-1  w-[160px]'}>
                        Причина транзакции
                        <Select
                            placeholder="Причина транзакции"
                            onChange={(e) =>
                                setParams((prev) => ({
                                    ...prev,
                                    payment_model_type: e.target.value || null, // null для пустого значения
                                }))
                            }
                            value={params.payment_model_type || ''}
                            sx={{
                                height: '44px',
                            }}
                        >
                            <MenuItem value={''}>Не выбрано</MenuItem>
                            <MenuItem value={'STUDENT'}>Студент</MenuItem>
                            <MenuItem value={'OUTLAY'}>Прочие расходы</MenuItem>
                        </Select>
                    </label>
                    <label className={'flex flex-col gap-1  w-[160px]'}>
                        Метод оплаты
                        <Select
                            value={params.payment_method || ''}
                            sx={{
                                height: '44px',
                                borderRadius: '5px',
                            }}
                            className={'w-full'}
                            placeholder="Пол"
                            onChange={(e) =>
                                setParams((prev) => ({
                                    ...prev,
                                    payment_method: e.target.value || null, // null для пустого значения
                                }))
                            }
                        >
                            <MenuItem value={''}>Не выбрано</MenuItem>
                            <MenuItem value={'CASH'}>Наличка</MenuItem>
                            <MenuItem value={'CARD'}>Карта</MenuItem>
                            <MenuItem value={'TRANSFER'}>Перечисление</MenuItem>
                            <MenuItem value={'HUMO'}>Humo</MenuItem>
                            <MenuItem value={'UZCARD'}>UzCard</MenuItem>
                            <MenuItem value={'CLICK'}>Click</MenuItem>
                            <MenuItem value={'PAYME'}>Payme</MenuItem>
                            <MenuItem value={'UZUM '}>Uzum</MenuItem>
                        </Select>
                    </label>
                    <label className={'flex flex-col gap-1  w-[160px]'}>
                        Расход
                        <Select
                            value={params.outlay || ''}
                            sx={{
                                height: '44px',
                                borderRadius: '5px',
                            }}
                            className={'w-full'}
                            placeholder=""
                            onChange={(e) =>
                                setParams((prev) => ({
                                    ...prev,
                                    outlay: e.target.value || null, // null для пустого значения
                                }))
                            }
                        >
                            <MenuItem value={''}>Не выбрано</MenuItem>
                            {outlayItems?.map((item: outlayCategories) => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </label>

                    <label className={'flex flex-col gap-1  w-[160px]'}>
                        Неправильные данные
                        <Checkbox
                            sx={{ width: 'fit-content' }}
                            checked={params.marked_for_delete || false}
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
            <ExpendituresTable
                refetch={refetch}
                payments={payments.results}
                page={page}
                setPage={setPage}
                pageSize={pageSize}
                totalCount={totalCount}
            />
        </div>
    )
}

export default Expenditures
