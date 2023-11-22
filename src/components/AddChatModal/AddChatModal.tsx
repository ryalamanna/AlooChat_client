import { useEffect, useState } from 'preact/hooks';
import './AddChatModal.scss';
import { UserInterface } from '../../interfaces/user';
import { requestHandler } from '../../utils';
import { createUserChat, getAvailableUsers } from '../../api';
import { h } from 'preact';
import { ChatListItemInterface } from '../../interfaces/chat';


const AddChatModal = ({
  open,
  onClose,
  onSuccess
}:{
  open: boolean;
  onClose: () => void;
  onSuccess: (chat: ChatListItemInterface) => void;
}) => {
  // State to store the list of users, initialized as an empty array
  const [users, setUsers] = useState<UserInterface[]>([]);
  // State to store the name of a group, initialized as an empty string
  const [groupName, setGroupName] = useState("");
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

  function handleUserSelect(e : h.JSX.TargetedEvent<HTMLSelectElement>){
    setSelectedUserId(e.currentTarget.value)
  }

  // Function to create a new chat with a user
  const createNewChat = async () => {
    // If no user is selected, show an alert
    if (!selectedUserId) return alert("Please select a user");

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
          alert("Chat with selected user already exists");
          return;
        }
        onSuccess(data); // Execute the onSuccess function with received data
        handleClose(); // Close the modal or popup
      },
      alert // Use the alert as the error handler
    );
  };

  
  // Function to reset local state values and close the modal/dialog
  const handleClose = () => {
    // Clear the list of users
    setUsers([]);
    // Reset the selected user ID
    setSelectedUserId("");
    // Clear the group name
    setGroupName("");
    // Clear the group participants list
    setGroupParticipants([]);
    // Set the chat type to not be a group chat
    setIsGroupChat(false);
    // Execute the onClose callback/function
    onClose();
  };

  useEffect(() => {
    getUsers();
  }, [])
  
  useEffect(() => {
    console.log(users);
    
  }, [users])
  

  return (
    <div id='addChatModal'>
      <div className="modal_container">
        <div className="modal_header">
          <button className="close" onClick={()=>handleClose()}>close</button>
        </div>
        <div className="modal_body">
          <select name="" id="" onChange={e=>handleUserSelect(e)}>
            <option value="" selected>select an user</option>
            {
              users.map((user , index)=>{
                return(
                  <option key={index} value={user._id}>{user.username}</option>
                )
              })
            }
          </select>
        </div>
        <div className="modal_footer">
          <button className="submit" onClick={createNewChat}>
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddChatModal