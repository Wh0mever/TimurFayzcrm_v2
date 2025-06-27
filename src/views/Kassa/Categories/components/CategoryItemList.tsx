import React, {useState} from 'react';
import {outlayCategories} from "@/@types/outlayCategories";
import {useForm} from "react-hook-form";
import rtkQueryService from "@/services/RtkQueryService";
import {Button, Input, Table} from "@/components/ui";
import THead from "@/components/ui/Table/THead";
import Tr from "@/components/ui/Table/Tr";
import Th from "@/components/ui/Table/Th";
import TBody from "@/components/ui/Table/TBody";
import Td from "@/components/ui/Table/Td";
import {MdDelete, MdEdit} from "react-icons/md";
import {categoryItem} from "@/@types/categoruItem";
import {HiPlusCircle} from "react-icons/hi";
import AddCategoryItemDialog from "@/views/Kassa/Categories/components/AddCategoryItemDialog";
import {response} from "@/@types/response";
import { Dialog, DialogContent } from '@mui/material';

interface CatItemsListProps {
    category: outlayCategories
}

function CategoryItemList({category}:CatItemsListProps) {
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

    const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
    const [addModalOpen, setAddModalOpen] = useState<boolean>(false)
    const [currentItem, setCurrentItem] = useState<categoryItem>({
        "id": 0,
        "title": 'string',
        "category": 0,
        category_obj: {
            id: 0,
            title:'string'
        }
    })

    const {register, handleSubmit, reset} = useForm<outlayCategories>()

    const {data:categoryItems, refetch} = rtkQueryService.useGetOutlayCategoryItemsQuery({token, id: category?.id})
    const [updateOutlayCategoryItem] = rtkQueryService.useUpdateOutlayCategoryItemMutation()
    const [deleteOutlayCategoryItem] = rtkQueryService.useDeleteOutlayCategoryItemMutation()

    const deleteReq = (id:number) => {
        if (confirm()){
            deleteOutlayCategoryItem({id, token})
                .then(() => {
                    refetch()
                })
        }
    }

    const submit = (data:object) => {
        updateOutlayCategoryItem({data: {...data, id:currentItem.id}, token})
            .then((res:response) => {
                if(res.data) {
                    refetch()
                    setEditModalOpen(false)
                }
            })
    }

    return (
        <div className={'bg-gray-200 p-5'}>
            <Button
                variant={'solid'}
                icon={<HiPlusCircle />}
                className={'mb-3'}
                onClick={() => setAddModalOpen(true)}
            >
                Добавить подкотегорию
            </Button>
            {addModalOpen && <AddCategoryItemDialog isOpen={addModalOpen} setIsOpen={setAddModalOpen} id={category.id}/>}
            {
                categoryItems?.length > 0 ?
                    <Table>
                        <THead>
                            <Tr>
                                <Th>
                                    Название
                                </Th>
                                <Th>
                                    Действие
                                </Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {
                                categoryItems?.map((item: categoryItem) =>
                                    <>
                                        <Tr key={item.id}>
                                            <Td>{item.title}</Td>
                                            <Td className={'flex gap-1'}>
                                                <MdEdit
                                                    onClick={() => {
                                                        setCurrentItem(item)
                                                        setEditModalOpen(true)
                                                        reset()
                                                    }}
                                                    className={'cursor-pointer'}
                                                    size={20}
                                                    color={'gray'}
                                                />
                                                <MdDelete
                                                    onClick={() => deleteReq(item.id)}
                                                    className={'cursor-pointer'}
                                                    size={20}
                                                    color={'gray'}
                                                />
                                            </Td>
                                        </Tr>

                                    </>
                                )
                            }
                        </TBody>
                    </Table>
                    :
                    null
            }
            {editModalOpen &&
                <Dialog
                    open={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    fullWidth
                    maxWidth='sm'
                >
                    <DialogContent>
                    <h3>Изменение подкатегории</h3>
                    <form
                        className={'flex flex-col gap-4 mt-4'}
                        onSubmit={handleSubmit(submit)}
                    >
                        <label>
                            <span>Название подкатегории</span>
                            <Input
                                defaultValue={currentItem.title}
                                type={'text'}
                                {...register('title', {required:true})}
                            />
                        </label>
                        <Button variant={'solid'}>Сохраниить</Button>
                    </form>
                    </DialogContent>
                </Dialog>
            }
        </div>
    );
}

export default CategoryItemList;