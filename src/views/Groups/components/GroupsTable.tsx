import React, { useState } from 'react'
import THead from '@/components/ui/Table/THead'
import Tr from '@/components/ui/Table/Tr'
import Th from '@/components/ui/Table/Th'
import Td from '@/components/ui/Table/Td'
import TBody from '@/components/ui/Table/TBody'
import { Pagination, Table } from '@/components/ui'
import { MdDelete, MdEdit } from 'react-icons/md'
import rtkQueryService from '@/services/RtkQueryService'
import UpdateGroupDetails from '@/views/Groups/components/UpdateGroupDetails'
import { groups } from '@/@types/group'
import { Link } from 'react-router-dom'
import { IoMdEye } from 'react-icons/io'
import { useAppSelector } from '@/store'
import formatNumber from '@/helpers/formatNumber'

interface GroupsTable {
    groupsData: []
    refetch: () => void
    page: number
    setPage: (e: number) => void
    totalCount: number
    pageSize: number
}

const GroupsTable: React.FC<GroupsTable> = ({
    groupsData,
    pageSize,
    refetch,
    page,
    setPage,
    totalCount,
}) => {
    const [deleteGroup] = rtkQueryService.useDeleteGroupMutation()
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)
    const [currentGrp, setCurrentGrp] = useState<groups>({})

    const { authority } = useAppSelector((state) => state.auth.user)

    const sendDeleteRequest = (id: number | undefined) => {
        if (confirm('Вы точно хотите удалить группу?')) {
            deleteGroup({
                id: id,
            }).then(() => {
                refetch()
                setDialogIsOpen(false)
            })
        }
    }

    return (
        <>
            <Table>
                <THead>
                    <Tr>
                        <Th>Название</Th>
                        <Th>Учитель</Th>
                        <Th>Цена</Th>
                        <Th>Дата старта</Th>
                        <Th>Дата завершения</Th>
                        {authority?.includes('MANAGER') && <Th>Действие</Th>}
                        {authority?.includes('ADMIN') && <Th>Действие</Th>}
                    </Tr>
                </THead>
                <TBody>
                    {groupsData?.map((group: groups) => (
                        <Tr
                            key={group.id}
                            style={{
                                backgroundColor: !group.marked_for_delete
                                    ? ''
                                    : '#FB040060',
                            }}
                        >
                            <Td>
                                <Link
                                    to={`/group/${group.id}`}
                                    className={'hover:underline'}
                                >
                                    {group.name}
                                </Link>
                            </Td>
                            <Td>
                                {group.teacher_obj?.user.first_name}{' '}
                                {group.teacher_obj?.user.last_name}
                            </Td>
                            <Td>{formatNumber(group.price)}</Td>
                            <Td>{group?.start_date?.split('T')[0]}</Td>
                            <Td>{group?.end_date?.split('T')[0]}</Td>
                            {authority?.includes('MANAGER') && (
                                <Td>
                                    <div>
                                        <Link to={`/group/${group.id}/`}>
                                            <IoMdEye size={20} color={'gray'} />
                                        </Link>
                                    </div>
                                </Td>
                            )}
                            {authority?.includes('ADMIN') && (
                                <Td className={''}>
                                    <div className={'flex gap-3'}>
                                        <MdDelete
                                            onClick={() =>
                                                sendDeleteRequest(group?.id)
                                            }
                                            className={'cursor-pointer'}
                                            size={20}
                                            color={'gray'}
                                        />
                                        <MdEdit
                                            onClick={() => {
                                                setCurrentGrp(group)
                                                setDialogIsOpen(true)
                                            }}
                                            className={'cursor-pointer'}
                                            size={20}
                                            color={'gray'}
                                        />
                                        <Link to={`/group/${group.id}/`}>
                                            <IoMdEye size={20} color={'gray'} />
                                        </Link>
                                    </div>
                                </Td>
                            )}
                        </Tr>
                    ))}
                </TBody>
                {dialogIsOpen && (
                    <UpdateGroupDetails
                        refetch={refetch}
                        dialogIsOpen={dialogIsOpen}
                        setDialogIsOpen={setDialogIsOpen}
                        groupData={currentGrp}
                    />
                )}
            </Table>
            <Pagination
                currentPage={page}
                total={totalCount}
                onChange={(e: number) => setPage(e)}
                pageSize={pageSize}
                displayTotal
            />
        </>
    )
}

export default GroupsTable
