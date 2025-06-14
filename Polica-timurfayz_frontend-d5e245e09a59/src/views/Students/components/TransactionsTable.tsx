import { balanceReport } from '@/@types/balanceReport'
import { response } from '@/@types/response'
import { Button, Input, Table } from '@/components/ui'
import TBody from '@/components/ui/Table/TBody'
import Td from '@/components/ui/Table/Td'
import Th from '@/components/ui/Table/Th'
import THead from '@/components/ui/Table/THead'
import Tr from '@/components/ui/Table/Tr'
import RtkQueryService from '@/services/RtkQueryService'
import { useAppSelector } from '@/store'
import { Checkbox, Dialog, DialogContent } from '@mui/material'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { MdDelete, MdEdit } from 'react-icons/md'
import formatNumber from "@/helpers/formatNumber";

interface transactinsTableProps {
    id: string | undefined
}

const reasons: { [key: string]: string } = {
    PAYMENT: 'Оплата',
    STUDY: 'Учеба',
    BONUS: 'Льгота',
    ADJUSTMENT: 'Изменение',
};

const TransactionsTable = ({id}:transactinsTableProps) => {
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

    const {
        register,
        handleSubmit,
    } = useForm();

    const {data: transactionsData, refetch} = RtkQueryService.useGetStudentBalanceReportQuery({token, id: id})
    const [putMarkOnPayment] = RtkQueryService.usePutMarkOnPaymentMutation()
    const [putMarkOnBonus] = RtkQueryService.usePutMarkOnBonusMutation()
    const [putMarkOnBalanceAdjustment] = RtkQueryService.usePutMarkOnBalanceAdjustmentMutation()
    
    const [deletePayment] = RtkQueryService.useDeletePaymentMutation()
    const [deleteBonus] = RtkQueryService.useDeleteBonusMutation()
    const [deleteStudyTransaction] = RtkQueryService.useDeleteStudyTransactionMutation()
    const [deleteBalanceAdjustment] = RtkQueryService.useDeleteBalanceAdjustmentMutation()

    const [currentTrs, setCurrentTrs] = useState({})
    const [dialogIsOpen, setDialogIsOpen] = useState(false)
    const [alertIsOpen, setAlertIsOpen] = useState(false)

    const sendDeleteRequest = (transaction: balanceReport) => {
        console.log(transaction);        
        if(confirm()){
            if(transaction.reason === 'PAYMENT') {
                deletePayment({token, id: transaction.id})
                    .then(() => {
                        refetch()
                    })
            } else if(transaction.reason === 'BONUS') {
                deleteBonus({token, id: transaction.id})
                    .then(() =>{
                        refetch()
                    })
            } else if(transaction.reason === 'ADJUSTMENT') {
                deleteBalanceAdjustment({token, id: transaction.id})
                    .then(() =>{
                        refetch()
                    })
            } else if(transaction.reason === 'STUDY') {
	            setDialogIsOpen(false)
	            setAlertIsOpen(true)
            }
        }
        
    }

    const submit = (data) => {
        data = {...data, id:currentTrs.id}
        if(currentTrs.reason === 'PAYMENT') {
            putMarkOnPayment({token, data})
                .then((res:response) =>{
                    if(res.data){
                        refetch()
                        setDialogIsOpen(false)
                    }
                })
        } else if(currentTrs.reason === 'BONUS') {
            putMarkOnBonus({token, data})
                .then((res:response) =>{
                    if(res.data){
                        refetch()
                        setDialogIsOpen(false)
                    }
                })
        } else if(currentTrs.reason === 'ADJUSTMENT') {
            putMarkOnBalanceAdjustment({token, data})
                .then((res:response) =>{
                    if(res.data){
                        refetch()
                        setDialogIsOpen(false)
                    }
                })
        } else if(currentTrs.reason === 'STUDY') {
            setDialogIsOpen(false)
            setAlertIsOpen(true)
        }
        
    }

    const onDialogClose = () => {
        setDialogIsOpen(false)
    }

    const {authority} = useAppSelector(
        (state) => state.auth.user
    )

  return (
    <Table>
        <THead>
            <Tr>
                <Th>
                    РАСХОД/ДОХОД
                </Th>
                <Th>
                    БАЛАНС ДО
                </Th>
                <Th>
                    СУММА
                </Th>
                <Th>
                    БАЛАНС ПОСЛЕ
                </Th>
                <Th>
                    ДАТА
                </Th>
                <Th>
                    ПРИЧИНА
                </Th>
                <Th>
                    Коментарий
                </Th>
                <Th>
                    действие
                </Th>
            </Tr>
        </THead>
        <TBody>
            {
                transactionsData?.map((transaction:balanceReport) => (
                    <Tr 
                        key={transaction.id}
                        style={{
                            backgroundColor: transaction.mark_for_delete ? '#FB040060' : '',
                        }}
                    >
                        <Td>
                            {transaction.balance_change_type === 'INCOME' ? '+' : '-'}
                        </Td>
                        <Td>
                            {formatNumber(transaction.balance_before)}
                        </Td>
                        <Td>
                            {formatNumber(transaction.total)}
                        </Td>
                        <Td>
                            {formatNumber(transaction.balance_after)}
                        </Td>
                        <Td>
                            {transaction.date.split('T')[0]}
                        </Td>
                        <Td>
                            {reasons[transaction.reason]}
                        </Td>
                        <Td>
                            {transaction.comment_text}
                        </Td>
                        <Td className='flex gap-2'>
                            <div className='flex gap-1'>
                                {authority?.includes('ADMIN') && (
                                    <MdDelete onClick={() => {
                                        setCurrentTrs(transaction)
                                        sendDeleteRequest(transaction)
        
                                    }} className={'cursor-pointer'} size={20} color={'gray'}/>
                                )}
                                <MdEdit 
                                    onClick={() => {
                                        setCurrentTrs(transaction)
                                        setDialogIsOpen(true)
                                    }} 
                                    className={'cursor-pointer'} size={20} color={'gray'}
                                />
                            </div>
                        </Td>
                    </Tr>
                ))
            }
        </TBody>
        <Dialog
            open={dialogIsOpen}
            onClose={onDialogClose}
            fullWidth
            maxWidth='sm'
        >
            <DialogContent>
                <h3>Исправление данных транзакции </h3>
                <form
                    onSubmit={handleSubmit(submit)}
                    className={'flex flex-col gap-[20px] pt-10 text-black'}
                >
                    <label>
                        Данные были введены не првильно
                        <Checkbox defaultChecked={currentTrs.marked_for_delete} {...register('marked_for_delete')} />
                    </label>
                    <label className={'flex flex-col gap-1'}>
                        <span>Коментарий</span>
                        <Input
                            {...register('comment')}
                            textArea
                            type={'number'}
                            style={{
                                color: 'black'
                            }}
                        />
                    </label>
                    <Button
                        block
                        variant="solid"
                        type="submit"
                    >
                        Сохранить
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
        <Dialog
            open={alertIsOpen}
            onClose={() => setAlertIsOpen(false)}
            fullWidth
            maxWidth='sm'
        >
            <DialogContent>
            <p>
                Это транзакция является оплатой урока чтобы удалить или редактировать удалите ученика из класса
            </p>
            <div className="text-right mt-6">
                <Button variant="solid" onClick={() => setAlertIsOpen(false)}>
                    Закрыть
                </Button>
            </div>
            </DialogContent>
        </Dialog>
    </Table>
  )
}

export default TransactionsTable