import React, { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { MenuItem, FormHelperText, Select } from '@mui/material'
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

const TransferStudentDialog: React.FC<TransferStudentDialogProps> = ({
    isOpen,
    setIsOpen,
    studentData,
    refetch,
}) => {
    const [loading, setLoading] = useState(false)
    const [selectedGroupId, setSelectedGroupId] = useState<number>(0)

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

    // Мгновенный перевод студента
    const onTransfer = async () => {
        if (!selectedGroupId) {
            return
        }

        console.log(studentData)

        setLoading(true)
        try {
            await transferStudent({
                studentId: studentData.id,
                data: {
                    group_from: studentData.group_ids[0],
                    group_to: selectedGroupId,
                    joined_date: dayjs().format('YYYY-MM-DD')
                }
            }).unwrap()
            
            refetch()
            setIsOpen(false)
            setSelectedGroupId(0)
        } catch (error) {
            console.error('Ошибка при переводе студента:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setIsOpen(false)
        setSelectedGroupId(0)
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose}>
            {studentData.group_ids.length === 0 && (
                <div className="flex items-center gap-2 mb-4">
                    <HiSwitchHorizontal size={24} className="text-blue-600" />
                    <h2 className="text-xl font-semibold">Студент не состоиит ни в одной группе!</h2>
                </div>
            )}
            {studentData.group_ids.length > 0 && (
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

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Новая группа *
                            </label>
                            <Select
                                value={selectedGroupId || ''}
                                onChange={(e) => setSelectedGroupId(Number(e.target.value))}
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
                            {availableGroups.length === 0 && !groupsLoading && (
                                <FormHelperText>
                                    Нет доступных групп для перевода
                                </FormHelperText>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="default"
                                onClick={handleClose}
                                disabled={loading}
                                className="flex-1"
                            >
                                Отмена
                            </Button>
                            <Button
                                variant="solid"
                                onClick={onTransfer}
                                loading={loading}
                                disabled={loading || availableGroups.length === 0 || !selectedGroupId}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                Перевести
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Dialog>
    )
}

export default TransferStudentDialog 