import { useEffect, useState } from 'preact/hooks';
import './AddChatModal.scss';
import { UserInterface } from '../../interfaces/user';
import { requestHandler } from '../../utils';
import { createGroupChat, createUserChat, getAvailableUsers } from '../../api';
import { h } from 'preact';
import { ChatListItemInterface } from '../../interfaces/chat';

const AddChatModal = ({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: (chat: ChatListItemInterface) => void;
}) => {
    // State to store the list of users, initialized as an empty array
    const [users, setUsers] = useState<UserInterface[]>([]);
    // State to store the name of a group, initialized as an empty string
    const [groupName, setGroupName] = useState('');
    // State to determine if the chat is a group chat, initialized as false
    const [isGroupChat, setIsGroupChat] = useState(false);
    // State to store the list of participants in a group chat, initialized as an empty array
    const [groupParticipants, setGroupParticipants] = useState<string[]>([]);
    // State to store the ID of a selected user, initialized as null
    const [selectedUserId, setSelectedUserId] = useState<null | string>(null);
    // State to determine if a chat is currently being created, initialized as false
    const [creatingChat, setCreatingChat] = useState(false);

    // Function to fetch users
    const getUsers = async () => {
        // Handle the request to get available users
        requestHandler(
            // Callback to fetch available users
            async () => await getAvailableUsers(),
            null, // No loading setter callback provided
            // Success callback
            (res) => {
                const { data } = res; // Extract data from response
                setUsers(data || []); // Set users data or an empty array if data is absent
            },
            alert // Use the alert as the error handler
        );
    };

    // Function to create a new chat with a user
    const createNewChat = async () => {
        // If no user is selected, show an alert
        if (!selectedUserId) return alert('Please select a user');

        // Handle the request to create a chat
        await requestHandler(
            // Callback to create a user chat
            async () => await createUserChat(selectedUserId),
            setCreatingChat, // Callback to handle loading state
            // Success callback
            (res) => {
                const { data } = res; // Extract data from response
                // If chat already exists with the selected user
                if (res.statusCode === 200) {
                    alert('Chat with selected user already exists');
                    return;
                }
                onSuccess(data); // Execute the onSuccess function with received data
                handleClose(); // Close the modal or popup
            },
            alert // Use the alert as the error handler
        );
    };

      // Function to create a new group chat
  const createNewGroupChat = async () => {
    // Check if a group name is provided
    if (!groupName) return alert("Group name is required");
    // Ensure there are at least 2 group participants
    if (!groupParticipants.length || groupParticipants.length < 2)
      return alert("There must be at least 2 group participants");

    // Handle the request to create a group chat
    await requestHandler(
      // Callback to create a group chat with name and participants
      async () =>
        await createGroupChat({
          name: groupName,
          participants: groupParticipants,
        }),
      setCreatingChat, // Callback to handle loading state
      // Success callback
      (res) => {
        const { data } = res; // Extract data from response
        onSuccess(data); // Execute the onSuccess function with received data
        handleClose(); // Close the modal or popup
      },
      alert // Use the alert as the error handler
    );
  };


    const handleGroupCheckboxChange = (
        e: h.JSX.TargetedEvent<HTMLInputElement>
    ) => {
        setIsGroupChat(e.currentTarget.checked);
    };

    // Function to reset local state values and close the modal/dialog
    const handleClose = () => {
        // Clear the list of users
        setUsers([]);
        // Reset the selected user ID
        setSelectedUserId('');
        // Clear the group name
        setGroupName('');
        // Clear the group participants list
        setGroupParticipants([]);
        // Set the chat type to not be a group chat
        setIsGroupChat(false);
        // Execute the onClose callback/function
        onClose();
    };

    useEffect(() => {
        getUsers();
    }, []);

    useEffect(() => {
        console.log(groupParticipants);
    }, [groupParticipants]);

    useEffect(() => {
        console.log(users);
    }, [users]);

    return (
        <div id="addChatModal">
            <div className="modal_container">
                <div className="modal_header">
                    <button className="close" onClick={() => handleClose()}>
                        X
                    </button>
                </div>
                <div className="modal_body">
                    <div className="switch_wrapper">
                        <p>Is Group?</p>
                        <label class="switch">
                        <input
                            type="checkbox"
                            onChange={(e) => handleGroupCheckboxChange(e)}
                        />
                        <span class="slider round"></span>
                    </label>
                    </div>
                    
                    {/* set group name  */}
                    {
                      isGroupChat && 
                      <>
                      <div className="group_name_wrapper">
                            <label>Group Name</label> &nbsp;
                            <input 
                            type="text"
                            onChange={e=>{
                            setGroupName(e.currentTarget.value);
                            }} />
                      </div>
                      
                      </>
                    }
                    <br />
                    {/* user selection dropdown / */}
                    <select
                        placeholder={
                            isGroupChat
                                ? 'Select group participants...'
                                : 'Select a user to chat...'
                        }
                        value={isGroupChat ? '' : selectedUserId || ''}
                        onChange={(e) => {
                            let value = e.currentTarget.value;
                            if (
                                isGroupChat &&
                                !groupParticipants.includes(value)
                            ) {
                                // if user is creating a group chat track the participants in an array
                                setGroupParticipants([
                                    ...groupParticipants,
                                    value,
                                ]);
                            } else {
                                setSelectedUserId(value);
                                // if user is creating normal chat just get a single user
                            }
                        }}
                    >
                        <option value="" selected>
                            select an user
                        </option>
                        {users.map((user, index) => {
                            return (
                                <option key={index} value={user._id}>
                                    {user.username}
                                </option>
                            );
                        })}
                    </select>
                    {isGroupChat && (
                        <div className="participants_list_container">
                            {users
                                .filter((user) => {
                                    return groupParticipants.includes(user._id);
                                })
                                ?.map((participant, key) => {
                                    return (
                                        <>
                                        <div className="group_member_card">
                                            <span key={key}>
                                                    {participant.username}
                                                </span>
                                                <button
                                                onClick={()=>
                                                    setGroupParticipants(
                                                    groupParticipants.filter((user) =>{
                                                        return !user.includes(participant._id);
                                                    })
                                                    )
                                                }
                                                >X</button>
                                        </div>
                                        </>
                                    );
                                })}
                        </div>
                    )}
                </div>
                <div className="modal_footer">
                    <button className="submit" disabled={creatingChat} onClick={isGroupChat ? createNewGroupChat : createNewChat}>
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddChatModal;
