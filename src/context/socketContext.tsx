/* eslint-disable react-refresh/only-export-components */
import  {  StateUpdater, useContext, useEffect, useState } from 'preact/hooks';
import socketio, { Socket } from 'socket.io-client';
import { LocalStorage } from '../utils';
import {createContext , FunctionComponent} from 'preact'

const CONNECTED_EVENT = 'connected';
const DISCONNECT_EVENT = 'disconnect';
const JOIN_CHAT_EVENT = 'joinChat';
const NEW_CHAT_EVENT = 'newChat';
const TYPING_EVENT = 'typing';
const STOP_TYPING_EVENT = 'stopTyping';
const MESSAGE_RECEIVED_EVENT = 'messageReceived';
const LEAVE_CHAT_EVENT = 'leaveChat';
const UPDATE_GROUP_NAME_EVENT = 'updateGroupName';
// const SOCKET_ERROR_EVENT = "socketError";


// Function to establish a socket connection with authorization token
const getSocket = () => {
    const token = LocalStorage.get('token'); // Retrieve jwt token from local storage or cookie
    console.log(token , 'token');
    
    console.log('http://localhost:8000');

    // Create a socket connection with the provided URI and authentication
    return socketio('http://localhost:8000', {
        withCredentials: true,
        auth: { token },
    });
};

// Create a context to hold the socket instance
const SocketContext = createContext<{
    socket: ReturnType<typeof socketio> | null;
    isConnected : boolean;
    setIsConnected : any
}>({
    socket: null,
    isConnected : false,
    setIsConnected : null
});

// Custom hook to access the socket instance from the context
const useSocket = () => useContext(SocketContext);

interface MyComponentProps {
    children: preact.ComponentChildren;
}

// SocketProvider component to manage the socket instance and provide it through context
const SocketProvider: FunctionComponent<MyComponentProps> = ({
    children,
}) => {
    // State to store the socket instance
    const [socket, setSocket] = useState<ReturnType<typeof socketio> | null>(
        null
    );
    const [isConnected, setIsConnected] = useState(false);
    // Set up the socket connection when the component mounts
    useEffect(() => {
        console.log('effect');
        setSocket(getSocket());
    }, [])
    
    function onConnect(){
        setIsConnected(true);
    }

    useEffect(() => {
      console.log(socket , 'this is  socket instance');
      if(!socket) return;
      socket.on(CONNECTED_EVENT, onConnect);

      // When the component using this hook unmounts or if `socket` or `chats` change:
      return () => {
          // Remove all the event listeners we set up to avoid memory leaks and unintended behaviors.
          socket.off(CONNECTED_EVENT, onConnect);
      };
    }, [socket])

    
    
    return (
        // Provide the socket instance through context to its children
        <SocketContext.Provider value={{ socket , isConnected , setIsConnected}}>
            {children}
        </SocketContext.Provider>
    );
};

// Export the SocketProvider component and the useSocket hook for other components to use
export { SocketProvider, useSocket };
