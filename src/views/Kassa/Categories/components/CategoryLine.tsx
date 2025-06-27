import React, {useState} from 'react';
import {outlayCategories} from "@/@types/outlayCategories";
import Tr from "@/components/ui/Table/Tr";
import Td from "@/components/ui/Table/Td";
import {IoCloseCircleOutline} from "react-icons/io5";
import {IoMdEye} from "react-icons/io";
import {MdDelete, MdEdit} from "react-icons/md";
import CategoryItemList from "@/views/Kassa/Categories/components/CategoryItemList";
import rtkQueryService from "@/services/RtkQueryService";

interface categoryLineProps {
    category: outlayCategories,
    setCurrentCat: (setCurrentCat: outlayCategories) => void,
    setEditModalOpen: (EditModalOpen: boolean) => void,

}

function CategoryLine({category, setEditModalOpen, setCurrentCat}:categoryLineProps) {
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

    const {refetch} = rtkQueryService.useGetAllOutlayCategoriesQuery({token})

    const [deleteOutlayCategory] = rtkQueryService.useDeleteOutlayCategoryMutation()

    const deleteReq = (id:number | undefined) => {
        if (confirm()){
            deleteOutlayCategory({id, token})
                .then(() => {
                    refetch()
                })
        }
    }

    const [itemsListOpen, setItemsListOpen] = useState<boolean>(false)


    return (
        <>
            <Tr>
                <Td className={'w-full'}>{category.title}</Td>
                <Td className={'flex gap-1'}>
                    {
                        itemsListOpen ?
                            <IoCloseCircleOutline
                                className={'cursor-pointer'}
                                size={20}
                                color={'gray'}
                                onClick={() => {
                                    setItemsListOpen(!itemsListOpen)
                                }}
                            />
                            :
                            <IoMdEye
                                className={'cursor-pointer'}
                                size={20}
                                color={'gray'}
                                onClick={() => {
                                    setItemsListOpen(!itemsListOpen)
                                }}
                            />
                    }
                    <MdEdit
                        onClick={() => {
                            setCurrentCat(category)
                            setEditModalOpen(true)
                        }}
                        className={'cursor-pointer'}
                        size={20}
                        color={'gray'}
                    />
                    <MdDelete
                        onClick={() => deleteReq(category.id)}
                        className={'cursor-pointer'}
                        size={20}
                        color={'gray'}
                    />
                </Td>
            </Tr>
            {itemsListOpen && <CategoryItemList category={category}/>}
        </>
    );
}

export default CategoryLine;