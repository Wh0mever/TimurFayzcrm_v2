import React from 'react'
import Table from '@/components/ui/Table'
import THead from '@/components/ui/Table/THead'
import Tr from '@/components/ui/Table/Tr'
import Th from '@/components/ui/Table/Th'
import TBody from '@/components/ui/Table/TBody'
import Td from '@/components/ui/Table/Td'
import formatNumber from '@/helpers/formatNumber'

interface IPayment {
    payment_method: string
    total_count: number
    total_amount: number
    total_income: number
    total_outcome: number
}

interface IProps {
    data: {
        total_count: number
        total_amount: number
        total_income: number
        total_outcome: number
        payment_methods: IPayment[]
    }
}

const initialState = {
    total_count: 0,
    total_amount: 0,
    total_income: 0,
    total_outcome: 0,
    payment_methods: [],
}

const PaymentSummaryTable: React.FC<IProps> = ({ data = initialState }) => {
    return (
        <>
            <Table>
                <THead>
                    <Tr>
                        <Th>Способ оплаты</Th>
                        <Th>Количество</Th>
                        <Th>Сумма доходов</Th>
                        <Th>Сумма расходов</Th>
                        <Th>Итоговая Сумма</Th>
                    </Tr>
                </THead>
                <TBody>
                    {data && data?.payment_methods?.map(
                        (item: IPayment, index: number) => (
                            <Tr key={index}>
                                <Td>{item.payment_method}</Td>
                                <Td>{formatNumber(item.total_count)}</Td>
                                <Td>{formatNumber(item.total_income)}</Td>
                                <Td>{formatNumber(item.total_outcome)}</Td>
                                <Td>{formatNumber(item.total_amount)}</Td>
                            </Tr>
                        ),
                    )}
                    <Tr>
                        <Td>
                            <strong>Итого</strong>
                        </Td>
                        <Td>
                            <strong>{data.total_count}</strong>
                        </Td>
                        <Td>
                            <strong>{formatNumber(data.total_income)}</strong>
                        </Td>
                        <Td>
                            <strong>{formatNumber(data.total_outcome)}</strong>
                        </Td>
                        <Td>
                            <strong>{formatNumber(data.total_amount)}</strong>
                        </Td>
                    </Tr>
                </TBody>
            </Table>
        </>
    )
}

export default PaymentSummaryTable
