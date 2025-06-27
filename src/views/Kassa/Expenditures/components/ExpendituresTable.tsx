import React, { useState } from 'react'
import THead from '@/components/ui/Table/THead'
import Tr from '@/components/ui/Table/Tr'
import Th from '@/components/ui/Table/Th'
import TBody from '@/components/ui/Table/TBody'
import { Button, Input, Pagination, Table } from '@/components/ui'
import rtkQueryService from '@/services/RtkQueryService'
import { payment } from '@/@types/payment'
import Td from '@/components/ui/Table/Td'
import { MdDelete, MdEdit } from 'react-icons/md'
import { useAppSelector } from '@/store'
import { BsReceipt } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { Checkbox, Dialog, DialogContent } from '@mui/material'
import { useForm } from 'react-hook-form'
import { response } from '@/@types/response'
import RtkQueryService from '@/services/RtkQueryService'
import formatNumber from '@/helpers/formatNumber'

const paymentMethods = {
    CARD: 'Карта',
    CASH: 'Наличные',
    TRANSFER: 'Перечисление',
    HUMO: 'HUMO',
    UZCARD: 'UZCARD',
    CLICK: 'CLICK',
    PAYME: 'PAYME',
    UZUM: 'UZUM',
}

interface expTableProps {
    payments: payment[]
    refetch: () => void
    page: number
    setPage: (e: number) => void
    pageSize: number
    totalCount: number
}

function ExpendituresTable({
    payments,
    refetch,
    page,
    pageSize,
    setPage,
    totalCount,
}: expTableProps) {
    const [currentTrs, setCurrentTrs] = useState({})
    const [dialogIsOpen, setDialogIsOpen] = useState(false)
    const [alertIsOpen, setAlertIsOpen] = useState(false)

    const { register, handleSubmit } = useForm()

    const [deletePayment] = rtkQueryService.useDeletePaymentMutation()
    const [putMarkOnPayment] = RtkQueryService.usePutMarkOnPaymentMutation()
    const [putMarkOnBonus] = RtkQueryService.usePutMarkOnBonusMutation()
    const [putMarkOnBalanceAdjustment] =
        RtkQueryService.usePutMarkOnBalanceAdjustmentMutation()

    const deleteReq = (id: number) => {
        if (confirm('Вы точно хотите удалить транзакцию')) {
            deletePayment({ id }).then(() => {
                refetch()
            })
        }
    }

    const { authority } = useAppSelector((state) => state.auth.user)

    const submit = (data: any) => {
        console.log(data)
        data = { ...data, id: currentTrs.id }
        putMarkOnPayment({ data }).then((res: response) => {
            if (res.data) {
                refetch()
                setDialogIsOpen(false)
            }
        })
    }

    const handleChange = (e: any) => {
        setPage(e)
    }
    return (
        <>
            <Table>
                <THead>
                    <Tr>
                        <Th>#</Th>
                        <Th>Доход/Расход</Th>
                        <Th>Дата</Th>
                        <Th>Сумма</Th>
                        <Th>Метод</Th>
                        <Th>Причина/Студент</Th>
                        <Th>Коментарии</Th>
                        <Th>Кассир</Th>
                        {authority?.includes('CASHIER') && null}
                        {authority?.includes('ADMIN') && <Th>Действие</Th>}
                    </Tr>
                </THead>
                <TBody>
                    {payments?.map((payment: payment, index: number) => (
                        <Tr
                            key={payment.id}
                            style={{
                                backgroundColor: payment.marked_for_delete
                                    ? '#FB040060'
                                    : '',
                            }}
                        >
                            <Td>{(page - 1) * 20 + index + 1}</Td>
                            <Td>
                                {payment.payment_type === 'INCOME'
                                    ? 'ДОХОД'
                                    : 'РАСХОД'}
                            </Td>
                            <Td>{payment.created_at.split('T')[0]}</Td>
                            <Td>{formatNumber(payment.amount)}</Td>
                            <Td>{paymentMethods[payment.payment_method]}</Td>
                            <Td>
                                {payment.student
                                    ? payment?.student_obj?.full_name
                                    : payment?.outlay_obj?.title}
                            </Td>
                            <Td>{payment.comment}</Td>
                            <Td>
                                {payment.created_user.first_name}
                                {payment.payment_model_type === 'STUDENT' &&
                                    payment.payment_type === 'OUTCOME' &&
                                    '(возврат)'}
                            </Td>
                            {authority?.includes('CASHIER') && (
                                <Td>
                                    {payment.payment_model_type ===
                                        'STUDENT' && (
                                        <Link to={`/receipt/${payment.id}`}>
                                            <BsReceipt
                                                size={20}
                                                color={'gray'}
                                            />
                                        </Link>
                                    )}
                                    <MdEdit
                                        onClick={() => {
                                            setCurrentTrs(payment)
                                            setDialogIsOpen(true)
                                        }}
                                        className={'cursor-pointer'}
                                        size={20}
                                        color={'gray'}
                                    />
                                </Td>
                            )}
                            {authority?.includes('ADMIN') && (
                                <Td>
                                    <div className="flex">
                                        <MdDelete
                                            onClick={() =>
                                                deleteReq(payment.id)
                                            }
                                            className={'cursor-pointer'}
                                            size={20}
                                            color={'gray'}
                                        />

                                        {payment.payment_model_type ===
                                            'STUDENT' && (
                                            <Link to={`/receipt/${payment.id}`}>
                                                <BsReceipt
                                                    size={20}
                                                    color={'gray'}
                                                />
                                            </Link>
                                        )}
                                        <MdEdit
                                            onClick={() => {
                                                setCurrentTrs(payment)
                                                setDialogIsOpen(true)
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
            </Table>
            <Pagination
                currentPage={page}
                total={totalCount}
                onChange={handleChange}
                pageSize={pageSize}
                displayTotal
            />
            <Dialog
                open={dialogIsOpen}
                onClose={() => setDialogIsOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogContent>
                    <h3>Исправление данных транзакции </h3>
                    <form
                        onSubmit={handleSubmit(submit)}
                        className={'flex flex-col gap-[20px] pt-10 text-black'}
                    >
                        <label>
                            Данные были введены не првильно
                            <Checkbox
                                defaultChecked={currentTrs.marked_for_delete}
                                {...register('marked_for_delete')}
                            />
                        </label>
                        <label className={'flex flex-col gap-1'}>
                            <span>Коментарий</span>
                            <Input
                                {...register('comment')}
                                textArea
                                type={'number'}
                                style={{
                                    color: 'black',
                                }}
                            />
                        </label>
                        <Button block variant="solid" type="submit">
                            Сохранить
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog
                open={alertIsOpen}
                onClose={() => setAlertIsOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogContent>
                    <p>
                        Это транзакция является оплатой урока чтобы удалить или
                        редактировать удалите ученика из класса
                    </p>
                    <div className="text-right mt-6">
                        <Button
                            variant="solid"
                            onClick={() => setAlertIsOpen(false)}
                        >
                            Закрыть
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ExpendituresTable
