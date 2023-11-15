import { useSocket } from '../../context/socketContext';
import { useEffect, useState, useRef } from 'preact/hooks';
import './chat.scss';
import { useAuth } from '../../context/AuthContext';
import {
    LocalStorage,
    getChatObjectMetadata,
    requestHandler,
} from '../../utils';
import { getChatMessages, getUserChats } from '../../api';
import {
    ChatListItemInterface,
    ChatMessageInterface,
} from '../../interfaces/chat';
import moment from 'moment';

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

const Chat = ({ path }: { path?: string }) => {
    const currentChat = useRef<ChatListItemInterface | null>(null);

    const { user } = useAuth();
    const { socket } = useSocket();

    const [isConnected, setIsConnected] = useState(false);
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const [chats, setChats] = useState<ChatListItemInterface[]>([]);
    const [unreadMessages, setUnreadMessages] = useState<
        ChatMessageInterface[]
    >([]); // To track unread messages
    const [messages, setMessages] = useState<ChatMessageInterface[] | null>(null);

    function onConnect() {
        setIsConnected(true);
    }

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
        // Check if a chat is selected, if not, show an alert
        if (!currentChat.current?._id) return alert('No chat is selected');

        // Check if socket is available, if not, show an alert
        if (!socket) return alert('Socket not available');

        // Emit an event to join the current chat
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
            alert
        );
    };

    useEffect(() => {
        getChats();
        
        // Retrieve the current chat details from local storage.
        const _currentChat = LocalStorage.get('currentChat');

        // If there's a current chat saved in local storage:
        if (_currentChat) {
            // Set the current chat reference to the one from local storage.
            currentChat.current = _currentChat;
            // If the socket connection exists, emit an event to join the specific chat using its ID.
            socket?.emit(JOIN_CHAT_EVENT, _currentChat.current?._id);
            // Fetch the messages for the current chat.
            getMessages();
        }
        // An empty dependency array ensures this useEffect runs only once, similar to componentDidMount.
    }, []);

    useEffect(() => {
        // If the socket isn't initialized, we don't set up listeners.
        if (!socket) return;

        // Set up event listeners for various socket events:
        // Listener for when the socket connects.
        socket.on(CONNECTED_EVENT, onConnect);
        // Listener for when the socket disconnects.
        // socket.on(DISCONNECT_EVENT, onDisconnect);
        // // Listener for when a user is typing.
        // socket.on(TYPING_EVENT, handleOnSocketTyping);
        // // Listener for when a user stops typing.
        // socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
        // // Listener for when a new message is received.
        // socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
        // // Listener for the initiation of a new chat.
        // socket.on(NEW_CHAT_EVENT, onNewChat);
        // // Listener for when a user leaves a chat.
        // socket.on(LEAVE_CHAT_EVENT, onChatLeave);
        // // Listener for when a group's name is updated.
        // socket.on(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);

        // When the component using this hook unmounts or if `socket` or `chats` change:
        return () => {
            // Remove all the event listeners we set up to avoid memory leaks and unintended behaviors.
            socket.off(CONNECTED_EVENT, onConnect);
            // socket.off(DISCONNECT_EVENT, onDisconnect);
            // socket.off(TYPING_EVENT, handleOnSocketTyping);
            // socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
            // socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
            // socket.off(NEW_CHAT_EVENT, onNewChat);
            // socket.off(LEAVE_CHAT_EVENT, onChatLeave);
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

    return (
        <div class="main_page_container">
            <div className="sidebar">
                <SideBar
                    chats={chats}
                    isConnected={isConnected}
                    loadingChats={loadingChats}
                    unreadMessages={unreadMessages}
                    setMessages={setMessages}
                    currentChat={currentChat}
                    getMessages={getMessages}
                />
            </div>
            <div className="main_section">
                <Conversation messages={messages} />
            </div>
        </div>
    );
};

const SideBar = ({
    chats,
    isConnected,
    loadingChats,
    unreadMessages,
    setMessages,
    currentChat,
    getMessages,
}: {
    chats: ChatListItemInterface[];
    isConnected: boolean;
    loadingChats: boolean;
    unreadMessages: ChatMessageInterface[];
    setMessages: any;
    currentChat: { current: ChatListItemInterface | null };
    getMessages: () => void;
}) => {
    return (
        <>
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
                    <button className="btn btn_primary">+</button>
                </div>
                {loadingChats ? (
                    <div>laoding...</div>
                ) : (
                    <PeoppleList
                        chats={chats}
                        unreadMessages={unreadMessages}
                        setMessages={setMessages}
                        currentChat={currentChat}
                        getMessages={getMessages}
                    />
                )}
                <div className="bottom_fade"></div>
            </div>
        </>
    );
};

const PeoppleList = ({
    chats,
    unreadMessages,
    setMessages,
    currentChat,
    getMessages,
}: {
    chats: ChatListItemInterface[];
    unreadMessages: ChatMessageInterface[];
    setMessages: (data: string) => void;
    currentChat: { current: ChatListItemInterface | null };
    getMessages: () => void;
}) => {
    return (
        <>
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
                        <img src="public/all_messages.png" alt="" />
                        <p>ALL MESSAGES</p>
                    </div>
                    {chats.map((chat) => {
                        return (
                            <SinglePersonList
                                key={chat._id}
                                chat={chat}
                                unreadCount={
                                    unreadMessages.filter(
                                        (n) => n.chat === chat._id
                                    ).length
                                }
                                setMessages={setMessages}
                                currentChat={currentChat}
                                getMessages={getMessages}
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );
};

const SinglePersonList = ({
    chat,
    unreadCount = 55,
    setMessages,
    currentChat,
    getMessages,
}: {
    chat: ChatListItemInterface;
    unreadCount: number;
    setMessages: (data: string) => void;
    currentChat: { current: ChatListItemInterface | null };
    getMessages: () => void;
}) => {
    const { user } = useAuth();
    interface participantMetaModel {
        avatar: string | undefined; // Participant's avatar URL.
        title: string | undefined; // Participant's username serves as the title.
        description: string | undefined; // Email address of the participant.
        lastMessage: string;
    }
    const [participant, setParticipant] =
        useState<participantMetaModel | null>();

    useEffect(() => {
        setParticipant(getChatObjectMetadata(chat, user!));
    }, []);

    useEffect(() => {
        console.log(participant);
    }, [participant]);

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
                    setMessages('');
                    getMessages();
                }}
            >
                <div className="wrapper">
                    <div className="dp_container">
                        <img class="dp" src={`${participant?.avatar}`} alt="" />
                    </div>
                    <div className="details_container">
                        <div className="upper_row rows">
                            <h4 class="name">{participant?.title || ''}</h4>
                            <p class="time">
                                {moment(chat.updatedAt)
                                    .add('TIME_ZONE', 'hours')
                                    .fromNow(true)}
                            </p>
                        </div>
                        <div className="lower_row rows">
                            <p class="msg">{participant?.lastMessage || ''}</p>
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

const Conversation = ({ messages }: { messages: ChatMessageInterface[] | null }) => {
    return (
        <>
            <ConversationHead />
            <ConversationBody messages={messages} />
            <ConversationFooter />
        </>
    );
};

const ConversationHead = () => {
    return (
        <>
            <div class="conversation_head_container">
                <div className="info">
                    <div className="dp_wrapper">
                        <img src="public/dp1.png" alt="" />
                        <div className="dot"></div>
                    </div>
                    <div className="name_status_wrapper">
                        <p class="name">Ryal Rafter</p>
                        <p class="status">Online</p>
                    </div>
                </div>
                <div className="options">
                    <div>
                        <img src="public/options.png" alt="" />
                    </div>
                </div>
            </div>
        </>
    );
};

const ConversationBody = ({
    messages,
}: {
    messages: ChatMessageInterface[] | null;
}) => {

    const {user} = useAuth()

    console.log(messages);
    

    return (
        <>
            <div className="conversation_body_container">
                {
                    messages && messages.map((message , key) => {
                        return (
                            <SingleChat message={message} IsOwnChat={message.sender._id === user?._id} key={key} />
                        )
                    })
                }
            </div>
        </>
    );
};

const SingleChat = ({
    message,
    IsOwnChat
}: {
    message: ChatMessageInterface;
    IsOwnChat : boolean;
}) => {
    return (
        <>
            <div className={`single_chat_container ${IsOwnChat ? 'right' : ''}`}>
                <div className="dp_wrapper">
                    <img src={`${message.sender.avatar ? message.sender.avatar : 'https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg'}`} alt="" />
                </div>
                <div className="message_wrapper">
                    <div className="name_wrapper">
                        <div className="name">{message.sender.username}</div>
                        <div className="time">{moment(message.updatedAt).add("TIME_ZONE", "hours").fromNow(true)}{" "}</div>
                    </div>
                    <div className="message">{message.content}</div>
                </div>
            </div>
        </>
    );
};

const ConversationFooter = () => {
    return (
        <>
            <div className="conversation_footer_container">
                <div className="input_wrapper">
                    <button>
                        <img src="public/emoji_btn.png" alt="" />
                    </button>
                    <input type="text" placeholder={'Type message..'} />
                </div>
                <div className="button_wrapper">
                    <button className="attachments">
                        <img src="public/mic.png" alt="" />
                    </button>
                    <button className="attachments">
                        <img src="public/attachment.png" alt="" />
                    </button>
                    <button className="send btn btn_primary">
                        <span>Send</span>
                        <img src="public/send.png" alt="" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default Chat;
