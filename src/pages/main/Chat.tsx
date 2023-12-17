import { useSocket } from '../../context/socketContext';
import { useEffect, useState, useRef, StateUpdater } from 'preact/hooks';
import './chat.scss';
import { useAuth } from '../../context/AuthContext';
import {
    LocalStorage,
    getChatObjectMetadata,
    requestHandler,
} from '../../utils';
import { deleteOneOnOneChat, getChatMessages, getUserChats, sendMessage } from '../../api';
import {
    ChatListItemInterface,
    ChatMessageInterface,
} from '../../interfaces/chat';
import moment from 'moment';
import {  h } from 'preact';
import AddChatModal from '../../components/AddChatModal/AddChatModal';
import backArrow from '../../../public/back.png'
const CONNECTED_EVENT = 'connected';
const DISCONNECT_EVENT = 'disconnect';
const JOIN_CHAT_EVENT = 'joinChat';
const NEW_CHAT_EVENT = 'newChat';
const TYPING_EVENT = 'typing';
const STOP_TYPING_EVENT = 'stopTyping';
const MESSAGE_RECEIVED_EVENT = 'messageReceived';
const LEAVE_CHAT_EVENT = 'leaveChat';
// const UPDATE_GROUP_NAME_EVENT = 'updateGroupName';
// const SOCKET_ERROR_EVENT = "socketError";

const Chat = ({ path }: { path?: string }) => {
    console.log(path);
    
    const currentChat = useRef<ChatListItemInterface | null>(null);

    const { user } = useAuth();
    const { socket, isConnected, setIsConnected } = useSocket();

    const [openAddChat, setOpenAddChat] = useState(false); // To control the 'Add Chat' modal

    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [selfTyping, setSelfTyping] = useState(false); // To track if the current user is typing
    console.log(loadingMessages);
    
    const [isTyping, setIsTyping] = useState(false); // To track if the other user is typing
    const [typingParticipant, setTypingParticipantt] = useState<string>(''); // to track which user is typing

    // To keep track of the setTimeout function
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // to focud on the mesasge input as soon as the current chat is changed
    const messageInputRef = useRef<HTMLInputElement | null>(null);

    const [chats, setChats] = useState<ChatListItemInterface[]>([]);
    const [unreadMessages, setUnreadMessages] = useState<
        ChatMessageInterface[]
    >([]); // To track unread messages
    const [messages, setMessages] = useState<ChatMessageInterface[]>([]);
    const [message, setMessage] = useState<string>('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]); // To store files attached to messages

    const [showing , setShowing] = useState<'chats' | 'messages'>('chats');
    console.log(attachedFiles);
    
    function onConnect() {
        setIsConnected(true);
        alert('Connected');
    }

    const onDisconnect = () => {
        setIsConnected(false);
    };

    const getChats = async () => {
        requestHandler(
            async () => await getUserChats(),
            setLoadingChats,
            (res) => {
                const { data } = res;
                setChats(data || []);
            },
            alert
        );
    };

    const getMessages = async () => {
        console.log('get');
        
        // Check if a chat is selected, if not, show an alert
        if (!currentChat.current?._id) return alert('No chat is selected');

        // Check if socket is available, if not, show an alert
        if (!socket) return;
        // alert('Socket not available');

        // Emit an event to join the current chat
        console.log(currentChat.current?._id, 'joined chat get message');

        socket.emit(JOIN_CHAT_EVENT, currentChat.current?._id);

        // Filter out unread messages from the current chat as those will be read
        setUnreadMessages(
            unreadMessages.filter(
                (msg) => msg.chat !== currentChat.current?._id
            )
        );

        // Make an async request to fetch chat messages for the current chat
        requestHandler(
            // Fetching messages for the current chat
            async () => await getChatMessages(currentChat.current?._id || ''),
            // Set the state to loading while fetching the messages
            setLoadingMessages,
            // After fetching, set the chat messages to the state if available
            (res) => {
                const { data } = res;
                setMessages(data || []);
            },
            // Display any error alerts if they occur during the fetch
            (data: string) => {
                if (data == 'User is not a part of this chat') {
                    currentChat.current = null;
                }
                alert(data);
            }
        );
    };

    const handleOnMessageChange = (
        e: h.JSX.TargetedEvent<HTMLInputElement>
    ) => {
        // Update the message state with the current input value
        setMessage(e.currentTarget.value);

        console.log(socket, isConnected, 'on change');
        // If socket doesn't exist or isn't connected, exit the function
        if (!socket || !isConnected) return;

        console.log(selfTyping, 'selftyping');

        // Check if the user isn't already set as typing
        if (!selfTyping) {
            //     // Set the user as typing
            console.log(currentChat.current?._id, 'typing event');
            setSelfTyping(true);

            //     // Emit a typing event to the server for the current chat
            socket.emit(TYPING_EVENT, currentChat.current?._id);
        }

        // Clear the previous timeout (if exists) to avoid multiple setTimeouts from running
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Define a length of time (in milliseconds) for the typing timeout
        const timerLength = 3000;

        // Set a timeout to stop the typing indication after the timerLength has passed
        typingTimeoutRef.current = setTimeout(() => {
            // Emit a stop typing event to the server for the current chat
            socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);

            // Reset the user's typing state
            setSelfTyping(false);
        }, timerLength);
    };

    // Function to send a chat message
    const sendChatMessage = async () => {
        // If no current chat ID exists or there's no socket connection, exit the function
        if (!currentChat.current?._id || !socket) return;

        // Emit a STOP_TYPING_EVENT to inform other users/participants that typing has stopped
        socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);

        // Use the requestHandler to send the message and handle potential response or error
        await requestHandler(
            // Try to send the chat message with the given message and attached files
            async () =>
                await sendMessage(
                    currentChat.current?._id || '', // Chat ID or empty string if not available
                    message, // Actual text message
                    // attachedFiles // Any attached files
                ),
            null,
            // On successful message sending, clear the message input and attached files, then update the UI
            (res) => {
                setMessage(''); // Clear the message input
                setAttachedFiles([]); // Clear the list of attached files
                setMessages((prev) => [res.data, ...prev]); // Update messages in the UI
                updateChatLastMessage(currentChat.current?._id || '', res.data); // Update the last message in the chat
            },

            // If there's an error during the message sending process, raise an alert
            alert
        );
    };

    /**
     *  A  function to update the last message of a specified chat to update the chat list
     */
    const updateChatLastMessage = (
        chatToUpdateId: string,
        message: ChatMessageInterface // The new message to be set as the last message
    ) => {
        // Search for the chat with the given ID in the chats array
        const chatToUpdate = chats.find((chat) => chat._id === chatToUpdateId)!;

        // Update the 'lastMessage' field of the found chat with the new message
        chatToUpdate.lastMessage = message;

        // Update the 'updatedAt' field of the chat with the 'updatedAt' field from the message
        chatToUpdate.updatedAt = message?.updatedAt;

        // Update the state of chats, placing the updated chat at the beginning of the array
        setChats([
            chatToUpdate, // Place the updated chat first
            ...chats.filter((chat) => chat._id !== chatToUpdateId), // Include all other chats except the updated one
        ]);
    };

    /**
     * Handles the event when a new message is received.
     */
    const onMessageReceived = (message: ChatMessageInterface) => {
        console.log('recieved');

        // Check if the received message belongs to the currently active chat
        if (message?.chat !== currentChat.current?._id) {
            // If not, update the list of unread messages
            setUnreadMessages((prev) => [message, ...prev]);
        } else {
            // If it belongs to the current chat, update the messages list for the active chat
            setMessages((prev) => [message, ...prev]);
        }

        // Update the last message for the chat to which the received message belongs
        updateChatLastMessage(message.chat || '', message);
    };

    /**
     * Handles the "typing" event on the socket.
     */
    const handleOnSocketTyping = (chatId: string) => {
        console.log('typingging on socket');

        // Check if the typing event is for the currently active chat.
        if (chatId !== currentChat.current?._id) return;

        // Set the typing state to true for the current chat.
        console.log(chatId);
        
        setTypingParticipantt(chatId);
        setIsTyping(true);
    };

    /**
     * Handles the "stop typing" event on the socket.
     */
    const handleOnSocketStopTyping = (chatId: string) => {
        // Check if the stop typing event is for the currently active chat.
        if (chatId !== currentChat.current?._id) return;

        // Set the typing state to false for the current chat.
        setIsTyping(false);
    };

    const onNewChat = (chat: ChatListItemInterface) => {
        setChats((prev) => [chat, ...prev]);
    };

    // This function handles the event when a user leaves a chat.
    const onChatLeave = (chat: ChatListItemInterface) => {
        // Check if the chat the user is leaving is the current active chat.
        if (chat._id === currentChat.current?._id) {
            // If the user is in the group chat they're leaving, close the chat window.
            currentChat.current = null;
            // Remove the currentChat from local storage.
            LocalStorage.remove('currentChat');
        }
        // Update the chats by removing the chat that the user left.
        setChats((prev) => prev.filter((c) => c._id !== chat._id));
    };

    useEffect(() => {
        getChats();

        // Retrieve the current chat details from local storage.
        const _currentChat = LocalStorage.get('currentChat');

        // If there's a current chat saved in local storage:
        if (_currentChat !== undefined && _currentChat!==null) {
            // Set the current chat reference to the one from local storage.
            currentChat.current = _currentChat;
            // If the socket connection exists, emit an event to join the specific chat using its ID.
            if (_currentChat.current?._id) {
                console.log('joined chat', _currentChat.current?._id);
                socket?.emit(JOIN_CHAT_EVENT, _currentChat.current?._id);
            }

            // Fetch the messages for the current chat.
            getMessages();
        }
        // An empty dependency array ensures this useEffect runs only once, similar to componentDidMount.
    }, []);

    useEffect(() => {
        getMessages();

        // If the socket isn't initialized, we don't set up listeners.
        if (!socket) {
            return;
        }

        // Set up event listeners for various socket events:
        // Listener for when the socket connects.
        socket.on(CONNECTED_EVENT, onConnect);
        // Listener for when the socket disconnects.
        socket.on(DISCONNECT_EVENT, onDisconnect);
        // // Listener for when a user is typing.
        socket.on(TYPING_EVENT, handleOnSocketTyping);
        // // Listener for when a user stops typing.
        socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
        // // Listener for when a new message is received.
        socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
        // // Listener for the initiation of a new chat.
        socket.on(NEW_CHAT_EVENT, onNewChat);
        // // Listener for when a user leaves a chat.
        socket.on(LEAVE_CHAT_EVENT, onChatLeave);
        // // Listener for when a group's name is updated.
        // socket.on(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);

        // When the component using this hook unmounts or if `socket` or `chats` change:
        return () => {
            // Remove all the event listeners we set up to avoid memory leaks and unintended behaviors.
            socket.off(CONNECTED_EVENT, onConnect);
            socket.off(DISCONNECT_EVENT, onDisconnect);
            socket.off(TYPING_EVENT, handleOnSocketTyping);
            socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
            socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
            socket.off(NEW_CHAT_EVENT, onNewChat);
            socket.off(LEAVE_CHAT_EVENT, onChatLeave);
            // socket.off(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
        };

        // Note:
        // The `chats` array is used in the `onMessageReceived` function.
        // We need the latest state value of `chats`. If we don't pass `chats` in the dependency array,
        // the `onMessageReceived` will consider the initial value of the `chats` array, which is empty.
        // This will not cause infinite renders because the functions in the socket are getting mounted and not executed.
        // So, even if some socket callbacks are updating the `chats` state, it's not
        // updating on each `useEffect` call but on each socket call.
    }, [socket, chats]);

    useEffect(() => {
        console.log(isConnected);
    }, [isConnected]);

    useEffect(() => {
        // to focus on the mesasge input as soon as the current chat is changed
        if (messageInputRef.current) {
            messageInputRef.current.focus();
        }
    }, [currentChat.current]);

    useEffect(() => {
        console.log(currentChat.current?.participants);
    }, [currentChat.current]);

    return (
        <>
            {openAddChat && (
                <AddChatModal
                    onClose={() => {
                        setOpenAddChat(false);
                    }}
                    onSuccess={() => {
                        getChats();
                    }}
                />
            )}

            <div class={`main_page_container ${showing}`}>
                <div className="sidebar">
                    <div class="sidebar_comp">
                        {/* === logo contaianer === */}
                        <div className="logo_container">
                            <img src="public/logo.png" alt="" />
                            <h1 class="logo_text">AlooChat</h1>
                            {isConnected && <div class="connectionDot"></div>}
                        </div>
                        {/* === search container === */}
                        <div className="search_container">
                            <input
                                type="text"
                                class="form-control"
                                placeholder="Search People"
                            />
                            <button
                                className="btn btn_primary"
                                onClick={() => setOpenAddChat(true)}
                            >
                                +
                            </button>
                        </div>
                        {loadingChats ? (
                            <div>laoding...</div>
                        ) : (
                            // ===  List of all chats ===
                            <div className="peoplelist_container">
                                {/* pinned chats  */}
                                {/* <div className="pinnedchats">
                                <div className="title">
                                    <img src="public/pinned_messages.png" alt="" />
                                    <p>PINNED CHATS</p>
                                </div>
                                <SinglePersonList />
                                <SinglePersonList />
                                <SinglePersonList />
                                <SinglePersonList />
                            </div> */}

                                {/* all chats  */}
                                <div className="allchats">
                                    {/* title container  */}
                                    <div className="title">
                                        <img
                                            src="public/all_messages.png"
                                            alt=""
                                        />
                                        <p>ALL MESSAGES</p>
                                    </div>
                                    {chats.map((chat) => {
                                        return (
                                            <SingleChat
                                                key={chat._id}
                                                chat={chat}
                                                unreadCount={
                                                    unreadMessages.filter(
                                                        (n) =>
                                                            n.chat === chat._id
                                                    ).length
                                                }
                                                setMessages={setMessages}
                                                currentChat={currentChat}
                                                getMessages={getMessages}
                                                onChatDelete={(chatId) => {
                                                    setChats((prev) =>
                                                        prev.filter(
                                                            (chat) =>
                                                                chat._id !== chatId
                                                        )
                                                    );
                                                    if (
                                                        currentChat.current?._id ===
                                                        chatId
                                                    ) {
                                                        currentChat.current = null;
                                                        LocalStorage.remove(
                                                            'currentChat'
                                                        );
                                                    }
                                                }}
                                                setShowing = {setShowing}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                            // ===  List of all chats - END ==
                        )}

                        {chats.length == 0 && (
                            <>
                                <h4>You have no chat !!!!</h4>
                                <img
                                    src="./public/no-chats-unscreen.GIF"
                                    alt=""
                                />
                            </>
                        )}
                        <div className="bottom_fade"></div>
                    </div>
                </div>

                {/* === conversation main container ===  */}
                <div className="main_section">
                    {currentChat.current ? (
                        <>
                            {/* === conversation header ===  */}
                            <div class="conversation_head_container">
                                <div className="info">
                                    <button className='back' onClick={()=>setShowing('chats')}>
                                        <img src={backArrow} alt="" />
                                    </button>
                                    <div className="dp_wrapper">
                                        <img
                                            src={`${
                                                getChatObjectMetadata(
                                                    currentChat.current,
                                                    user!
                                                )?.avatar
                                            }`}
                                            alt=""
                                        />
                                        <div className="dot"></div>
                                    </div>
                                    <div className="name_status_wrapper">
                                        <p class="name">
                                            {
                                                getChatObjectMetadata(
                                                    currentChat.current,
                                                    user!
                                                )?.title
                                            }
                                        </p>
                                        <p class="status">Online</p>
                                    </div>
                                </div>
                                <div className="options">
                                    <div>
                                        <img
                                            src="./public/options.png"
                                            alt=""
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* === conversation header - END ===  */}

                            {/* ===  conversation body === */}
                            <div className="conversation_body_container">
                                {isTyping && (
                                    <TypingConponent
                                        isGroupChat={
                                            currentChat.current.isGroupChat
                                        }
                                        currentChat={currentChat}
                                        typingParticipant={typingParticipant}
                                    />
                                )}
                                {messages &&
                                    messages.map((message, key) => {
                                        return (
                                            <SingleMessage
                                                message={message}
                                                IsOwnChat={
                                                    message.sender._id ===
                                                    user?._id
                                                }
                                                key={key}
                                            />
                                        );
                                    })}
                            </div>
                            {/* === conversation body - END === */}

                            {/* === conversation footer === */}
                            <div className="conversation_footer_container">
                                <div className="input_wrapper">
                                    {/* <button>
                                    <img src="public/emoji_btn.png" alt="" />
                                </button> */}
                                    <input
                                        ref={messageInputRef}
                                        type="text"
                                        placeholder={'Type message..'}
                                        value={message}
                                        onInput={handleOnMessageChange}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                sendChatMessage();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="button_wrapper">
                                    {/* <button className="attachments">
                                    <img src="public/mic.png" alt="" />
                                </button>
                                <button className="attachments">
                                    <img src="public/attachment.png" alt="" />
                                </button> */}
                                    <button className="send btn btn_primary">
                                        <span>Send</span>
                                        <img src="public/send.png" alt="" />
                                    </button>
                                </div>
                            </div>
                            {/* === conversation footer - END === */}
                        </>
                    ) : (
                        <div>nope</div>
                    )}
                </div>
                {/* === conversation main container - END ===  */}
            </div>
        </>
    );
};

const SingleChat = ({
    chat,
    unreadCount,
    setMessages,
    currentChat,
    getMessages,
    onChatDelete,
    setShowing
}: {
    chat: ChatListItemInterface;
    unreadCount: number;
    setMessages: StateUpdater<ChatMessageInterface[]>;
    currentChat: { current: ChatListItemInterface | null };
    getMessages: () => void;
    onChatDelete: (chatId: string) => void;
    setShowing: (data : 'chats' | 'messages') => void;
}) => {
    const { user } = useAuth();

    // Define an asynchronous function named 'deleteChat'.
    const deleteChat = async () => {
        await requestHandler(
        // A callback function that performs the deletion of a one-on-one chat by its ID.
        async () => await deleteOneOnOneChat(chat._id),
        null,
        // A callback function to be executed on success. It will call 'onChatDelete'
        // function with the chat's ID as its parameter.
        () => {
            onChatDelete(chat._id);
        },
        // The 'alert' function (likely to display error messages to the user.
        alert
        );
    };
    return (
        <>
            <div
                className="singlepersonlist_container"
                role="button"
                onClick={() => {
                    if (
                        currentChat.current?._id &&
                        currentChat.current?._id === chat._id
                    )
                        return;
                    LocalStorage.set('currentChat', chat);
                    currentChat.current = chat;
                    setMessages([]);
                    getMessages();
                    setShowing('messages');
                }}
            >
                <div className="wrapper">
                    <button class='chat_options' >
                        <img src="./public/options.png" alt="" />
                        <div className="dropdown">
                            {
                                !chat.isGroupChat && 
                                <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const ok = confirm(
                                      "Are you sure you want to delete this chat?"
                                    );
                                    if (ok) {
                                      deleteChat();
                                    }
                                }}
                                className="delete_button dropdown_item">
                                    Delete Chat
                                </button>
                            }
                            {
                                chat.isGroupChat && 
                                <button className="info_button dropdown_item">
                                    Group Info
                                </button>
                            }
                        </div>
                    </button>
                    <div className="dp_container">
                        <img
                            class="dp"
                            src={`${
                                getChatObjectMetadata(chat, user!)?.avatar
                            }`}
                            alt=""
                        />
                    </div>
                    <div className="details_container">
                        <div className="upper_row rows">
                            <h4 class="name">
                                {getChatObjectMetadata(chat, user!)?.title ||
                                    ''}
                            </h4>
                            <p class="time">
                                {moment(chat.updatedAt)
                                    .add('TIME_ZONE', 'hours')
                                    .fromNow(true)}
                            </p>
                        </div>
                        <div className="lower_row rows">
                            <p class="msg">
                                {getChatObjectMetadata(
                                    chat,
                                    user!
                                )?.lastMessage.substring(0, 25)}
                                {getChatObjectMetadata(chat, user!)?.lastMessage
                                    .length >= 24
                                    ? '...'
                                    : '' || ''}
                            </p>
                            {unreadCount > 0 && (
                                <div className="notification">
                                    <p>{unreadCount}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const SingleMessage = ({
    message,
    IsOwnChat,
}: {
    message: ChatMessageInterface;
    IsOwnChat: boolean;
}) => {
    return (
        <>
            <div
                className={`single_chat_container ${IsOwnChat ? 'right' : ''}`}
            >
                <div className="dp_wrapper">
                    <img
                        src={`${
                            message.sender.avatar?.url
                                ? message.sender.avatar.url
                                : 'https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg'
                        }`}
                        alt=""
                    />
                </div>
                <div className="message_wrapper">
                    <div className="name_wrapper">
                        <div className="name">{message.sender.username}</div>
                        <div className="time">
                            {moment(message.updatedAt)
                                .add('TIME_ZONE', 'hours')
                                .fromNow(true)}{' '}
                        </div>
                    </div>
                    <div className="message">{message.content}</div>
                </div>
            </div>
        </>
    );
};

const TypingConponent = ({
    isGroupChat,
    currentChat,
    typingParticipant,
}: {
    isGroupChat: boolean;
    currentChat?: { current: ChatListItemInterface | null };
    typingParticipant?: string;
}) => {
    const {user} = useAuth()
    const [url , setUrl] = useState<string | undefined>('')
    const [username , setusername] = useState<string | undefined>('')

    useEffect(() => {
        setusername(currentChat?.current?.participants.filter(participant => participant._id !== user?._id)[0].username)

        let sender = currentChat?.current?.participants.filter(participant => participant._id !== user?._id)[0].avatar;
        if(sender && sender.url){
            setUrl(sender.url)
        }
    }, [])
    

    useEffect(() => {
      console.log(username);
      
    }, [username])
    

    return (
        <div class="single_chat_container typing">
            <div className="dp_wrapper">
                {!isGroupChat && (
                    <img
                        src={url || "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg"}
                        alt=""
                    />
                )}
            </div>
            <div className="message_wrapper">
                <div className="name_wrapper">
                    <div className="name">
                        {!isGroupChat && username}
                        {isGroupChat &&
                            currentChat?.current?.participants.filter(
                                (participant) => {
                                    return participant._id.toString() == typingParticipant;
                                }
                            )[0].username}
                    </div>
                    <div className="time"></div>
                </div>
                <div className="message">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
