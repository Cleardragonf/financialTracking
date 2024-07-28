import React, {useState} from "react"
import { AddDebtModals } from "../modals/AddDebtModals";

export const AddDebtButton = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    return(
        <div className="App">
            <button onClick={openModal}>Add Debt</button>
            <AddDebtModals isOpen={isModalOpen} onClose={closeModal} />
        </div>
    )
}