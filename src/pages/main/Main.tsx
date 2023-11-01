import './main.scss';
const Main = ({ path }: { path: string }) => {
    return (
        <div class="main_page_container">
            <div className="sidebar">
                <SideBar />
            </div>
            <div className="main_section">
                <Conversation />
            </div>
        </div>
    );
};

const SideBar = () => {
    return (
        <>
            <div class="sidebar_comp">
                {/* === logo contaianer === */}
                <div className="logo_container">
                    <img src="public/logo.png" alt="" />
                    <h1 class="logo_text">AlooChat</h1>
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
                <PeoppleList />
            </div>
        </>
    );
};

const PeoppleList = () => {
    return (
        <>
            <div className="peoplelist_container">
                {/* pinned chats  */}
                <div className="pinnedchats">
                    {/* title container  */}
                    <div className="title">
                        <img src="public/pinned_messages.png" alt="" />
                        <p>PINNED CHATS</p>
                    </div>
                    <SinglePersonList />
                    <SinglePersonList />
                    <SinglePersonList />
                    <SinglePersonList />
                </div>

                {/* all chats  */}
                <div className="allchats">
                    {/* title container  */}
                    <div className="title">
                        <img src="public/all_messages.png" alt="" />
                        <p>ALL MESSAGES</p>
                    </div>
                    <SinglePersonList />
                    <SinglePersonList />
                    <SinglePersonList />
                    <SinglePersonList />
                </div>
            </div>
        </>
    );
};

const SinglePersonList = () => {
    return (
        <>
            <div className="singlepersonlist_container">
                <div className="wrapper">
                    <div className="dp_container">
                        <img class="dp" src="public/dp1.png" alt="" />
                    </div>
                    <div className="details_container">
                        <div className="upper_row rows">
                            <h4 class="name">Ryal Rafter</h4>
                            <p class="time">04:50 PM</p>
                        </div>
                        <div className="lower_row rows">
                            <p class="msg">Hey, how's it going?</p>
                            <div className="notification">
                                <p>2</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const Conversation = () => {
    return (
        <>
            <ConversationHead />
            <ConversationBody />
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

const ConversationBody = () => {
    return (
        <>
            <div className="conversation_body_container">
                <SingleChat message="That sounds like a great plan! Excited 😃" />
                <SingleChat message="That sounds like a great plan! Excited 😃" />
                <SingleChat
                    message="That sounds like a great plan! Excited 😃"
                    right
                />
                <SingleChat
                    message="That sounds like a great plan! Excited 😃"
                    right
                />
                <SingleChat message="That sounds like a great plan! Excited 😃" />
                <SingleChat message="That sounds like a great plan! Excited 😃That sounds like a great plan! Excited 😃That sounds like a great plan! Excited 😃" />
                <SingleChat
                    message="That sounds like a great plan! Excited 😃 That sounds like a great plan! Excited 😃"
                    right
                />
                <SingleChat message="That sounds like a great plan! Excited 😃" />
            </div>
        </>
    );
};

const SingleChat = ({
    message,
    right,
}: {
    message: string;
    right?: boolean;
}) => {
    return (
        <>
            <div className={`single_chat_container ${right ? 'right' : ''}`}>
                <div className="dp_wrapper">
                    <img src="public/dp1.png" alt="" />
                </div>
                <div className="message_wrapper">
                    <div className="name_wrapper">
                        <div className="name">Ryal Rafter</div>
                        <div className="time">10:30 AM</div>
                    </div>
                    <div className="message">{message}</div>
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

export default Main;
