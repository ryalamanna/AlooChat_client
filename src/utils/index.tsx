import { AxiosResponse } from 'axios';
import { APISuccessResponseInterface } from '../models/api';
import { ChatListItemInterface } from '../interfaces/chat';
import { UserInterface } from '../interfaces/user';

// A utility function for handling API requests with loading, success, and error handling
export const requestHandler = async (
    api: () => Promise<AxiosResponse<APISuccessResponseInterface, any>>,
    setLoading: ((state: boolean) => void )| null,
    onSuccess: (data: APISuccessResponseInterface) => void,
    onError: (error: string) => void
) => {
    // Show loading state if setLoading function is provided
    setLoading && setLoading(true);
    // loading.value = true;
    try {
        // Make the API request
        const response = await api();
        const { data } = response;
        if (data?.success) {
            // Call the onSuccess callback with the response data
            onSuccess(data);
        }
    } catch (error: any) {
        // Handle error cases, including unauthorized and forbidden cases
        if ([401, 403].includes(error?.response.data?.statusCode)) {
            // localStorage.clear(); // Clear local storage on authentication issues
            if (isBrowser) window.location.href = '/login'; // Redirect to login page
        }
        onError(error?.response?.data?.message || 'Something went wrong');
    } finally {
        // Hide loading state if setLoading function is provided
        setLoading && setLoading(false);
        // loading.value = false;
    }
};

// A class that provides utility functions for working with local storage
export class LocalStorage {
    // Get a value from local storage by key
    static get(key: string) {
        if (!isBrowser) return;
        const value = localStorage.getItem(key);
        if (value) {
            try {
                return JSON.parse(value);
            } catch (err) {
                return null;
            }
        }
        return null;
    }

    // Set a value in local storage by key
    static set(key: string, value: any) {
        if (!isBrowser) return;
        localStorage.setItem(key, JSON.stringify(value));
    }

    // Remove a value from local storage by key
    static remove(key: string) {
        if (!isBrowser) return;
        localStorage.removeItem(key);
    }

    // Clear all items from local storage
    static clear() {
        if (!isBrowser) return;
        localStorage.clear();
    }
}

// Check if the code is running in a browser environment
export const isBrowser = typeof window !== 'undefined';

// This utility function generates metadata for chat objects.
// It takes into consideration both group chats and individual chats.
export const getChatObjectMetadata = (
    chat: ChatListItemInterface, // The chat item for which metadata is being generated.
    loggedInUser: UserInterface // The currently logged-in user details.
  ) => {
    // Determine the content of the last message, if any.
    // If the last message contains only attachments, indicate their count.
    const lastMessage = chat.lastMessage?.content
      ? chat.lastMessage?.content
      : chat.lastMessage
      ? `${chat.lastMessage?.attachments?.length} attachment${
          chat.lastMessage.attachments.length > 1 ? "s" : ""
        }`
      : "No messages yet"; // Placeholder text if there are no messages.
  
    if (chat.isGroupChat) {
      // Case: Group chat
      // Return metadata specific to group chats.
      return {
        // Default avatar for group chats.
        avatar: "https://via.placeholder.com/100x100.png",
        title: chat.name, // Group name serves as the title.
        description: `${chat.participants.length} members in the chat`, // Description indicates the number of members.
        lastMessage: chat.lastMessage
          ? chat.lastMessage?.sender?.username + ": " + lastMessage
          : lastMessage,
      };
    } else {
      // Case: Individual chat
      // Identify the participant other than the logged-in user.
      const participant = chat.participants.find(
        (p) => p._id !== loggedInUser?._id
      );
      // Return metadata specific to individual chats.
      return {
        avatar: participant?.avatar?.url ? participant?.avatar?.url : "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg", // Participant's avatar URL.
        title: participant?.username, // Participant's username serves as the title.
        description: participant?.email, // Email address of the participant.
        lastMessage,
      };
    }
  };