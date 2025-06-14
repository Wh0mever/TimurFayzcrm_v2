import React, { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui'
import { MenuItem, FormHelperText, Select } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import rtkQueryService from '@/services/RtkQueryService'
import { student } from '@/@types/student'
import { groups } from '@/@types/group'
import { HiSwitchHorizontal } from 'react-icons/hi'

interface TransferStudentDialogProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    studentData: student
    refetch: () => void
}

interface TransferFormData {
    groupId: number
    transferDate: string
}

const TransferStudentDialog: React.FC<TransferStudentDialogProps> = ({
    isOpen,
    setIsOpen,
    studentData,
    refetch,
}) => {
    const [loading, setLoading] = useState(false)
    
    const { 
        control, 
        handleSubmit, 
        reset, 
        watch,
        formState: { errors } 
    } = useForm<TransferFormData>({
        defaultValues: {
            groupId: 0,
            transferDate: dayjs().format('YYYY-MM-DD')
        }
    })

    const selectedGroupId = watch('groupId')

    // Получаем список всех групп того же отдела
    const { data: allGroups, isLoading: groupsLoading } = rtkQueryService.useGetAllGroupsQuery({
        params: { department: studentData.department as string || 'SCHOOL' },
    })

    // Мутация для перевода студента
    const [transferStudent] = rtkQueryService.useTransferStudentMutation()

    // Фильтруем группы - исключаем текущие группы студента
    const allGroupsData = allGroups?.results || allGroups || []
    const availableGroups = allGroupsData.filter((group: groups) => 
        group.name && !studentData.group_names?.includes(group.name)
    )

    // Обработка отправки формы
    const onSubmit = async (data: TransferFormData) => {
        if (!data.groupId) {
            return
        }

        setLoading(true)
        try {
            await transferStudent({
                studentId: studentData.id,
                data: {
                    group: data.groupId,
                    joined_date: data.transferDate
                }
            }).unwrap()
            
            refetch()
            setIsOpen(false)
            reset()
        } catch (error) {
            console.error('Ошибка при переводе студента:', error)
        } finally {
            setLoading(false)
        }
    }

    // Моментальный перевод на сегодняшнюю дату
    const onQuickTransfer = async () => {
        if (!selectedGroupId) {
            return
        }

        setLoading(true)
        try {
            await transferStudent({
                studentId: studentData.id,
                data: {
                    group: selectedGroupId,
                    joined_date: dayjs().format('YYYY-MM-DD')
                }
            }).unwrap()
            
            refetch()
            setIsOpen(false)
            reset()
        } catch (error) {
            console.error('Ошибка при переводе студента:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setIsOpen(false)
        reset()
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose}>
            <div className="flex flex-col p-6 max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-4">
                    <HiSwitchHorizontal size={24} className="text-blue-600" />
                    <h2 className="text-xl font-semibold">Перевод студента</h2>
                </div>
                
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Студент:</p>
                    <p className="font-medium">{studentData.full_name}</p>
                    <p className="text-sm text-gray-600 mt-1">Текущие группы:</p>
                    <p className="text-sm">{studentData.group_names?.join(', ') || 'Нет групп'}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Новая группа *
                        </label>
                        <Controller
                            name="groupId"
                            control={control}
                            rules={{ required: 'Выберите группу' }}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    disabled={groupsLoading || availableGroups.length === 0}
                                    sx={{ width: '100%', height: '44px' }}
                                    displayEmpty
                                >
                                    <MenuItem value="" disabled>
                                        {groupsLoading ? 'Загрузка...' : 'Выберите группу'}
                                    </MenuItem>
                                    {availableGroups.map((group: groups) => (
                                        <MenuItem key={group.id} value={group.id}>
                                            {group.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                        {errors.groupId && (
                            <FormHelperText error>
                                {errors.groupId.message}
                            </FormHelperText>
                        )}
                        {availableGroups.length === 0 && !groupsLoading && (
                            <FormHelperText>
                                Нет доступных групп для перевода
                            </FormHelperText>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Дата перевода *
                        </label>
                        <Controller
                            name="transferDate"
                            control={control}
                            rules={{ required: 'Выберите дату' }}
                            render={({ field }) => (
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        value={field.value ? dayjs(field.value) : null}
                                        onChange={(date) => 
                                            field.onChange(date ? date.format('YYYY-MM-DD') : '')
                                        }
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!errors.transferDate,
                                                helperText: errors.transferDate?.message
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            )}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            variant="solid"
                            loading={loading}
                            disabled={loading || availableGroups.length === 0}
                            className="flex-1"
                        >
                            Перевести на дату
                        </Button>
                        <Button
                            type="button"
                            variant="solid"
                            onClick={onQuickTransfer}
                            loading={loading}
                            disabled={loading || availableGroups.length === 0 || !selectedGroupId}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            Перевести сегодня
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default TransferStudentDialog 