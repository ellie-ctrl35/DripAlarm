import { useState, useEffect } from 'react';
import { Modal, Box } from '@mui/material';
import Avatar from 'react-avatar';
import NavBar from '../../components/Navbar';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredNotifications, setFilteredNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const patients = await window.api.queryDatabase('SELECT * FROM Finalpatients');
                setNotifications(patients.reverse()); // Reverse the notifications array
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };

        fetchNotifications();
    }, []);

    useEffect(() => {
        setFilteredNotifications(
            notifications.filter(notification =>
                notification.patientname.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [notifications, searchQuery]);

    const handleClick = (notification) => {
        setSelectedNotification(notification);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const processFinishTime = (finishTime) => {
        const date = new Date(finishTime);
        return date.toLocaleString();
    };

    return (
        <div className="flex flex-col items-center w-full bg-gray-100 min-h-screen">
            <NavBar />
            <h2 className="text-xl font-semibold my-6">Notifications</h2>
            <p className="mb-4">You have {filteredNotifications.length} new notifications</p>
            <input
                type="text"
                placeholder="Search by patient name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 mb-4 w-96"
            />
            <div className="w-2/3">
                {filteredNotifications.map((notification) => (
                    <div
                        key={notification.id}
                        className="flex items-center p-4 mb-4 bg-white rounded shadow cursor-pointer"
                        onClick={() => handleClick(notification)}
                    >
                        <Avatar name={notification.patientname} size="40" round={true} />
                        <div className="ml-4">
                            <p className="font-semibold">{notification.patientname}</p>
                            <p>{notification.medname}</p>
                        </div>
                        <span className="ml-auto text-gray-500">{processFinishTime(notification.finishTime)}</span>
                    </div>
                ))}
            </div>

            <Modal
                open={isModalOpen}
                onClose={closeModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className="bg-white p-6 rounded shadow-lg mt-48 max-w-lg mx-auto">
                    <span className="text-xl font-semibold mb-4" id="modal-modal-title">Notification Details</span>
                    {selectedNotification && (
                        <div className='p-6 space-y-6' id="modal-modal-description">
                            <p>Patient Name: {selectedNotification.patientname}</p>
                            <p>Fluid Name: {selectedNotification.medname}</p>
                            <p>Finish Time: {processFinishTime(selectedNotification.finishTime)}</p>
                            <p>Patient Age: {selectedNotification.age}</p>
                            <p>Doses Taken: {selectedNotification.dosesTaken}</p>
                            <p>Ward Number: {selectedNotification.wardnumber}</p>
                            <p>Bed Number: {selectedNotification.bednumber}</p>
                            <p>Quantity: {selectedNotification.volumeoffluid}</p>
                            <p>Fluid Number: {selectedNotification.fluidNumber}</p>
                        </div>
                    )}
                </Box>
            </Modal>
        </div>
    );
};

export default Notifications;
