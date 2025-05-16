import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path:  path.join(__dirname, "../../.env")  });

import axios from "axios";

const apiUrl = process.env.API_URL;
const inbox_identifier = process.env.INBOX_IDENTIFIER;
const apiAccessToken = process.env.API_ACCESS_TOKEN;


// https://app.chatwoot.com/public/api/v1/inboxes/{inbox_identifier}/contacts/{contact_identifier}/conversations/{conversation_id}
const getConversation = async (contactId, conversationId) => {

    const finalUrl = `${apiUrl}/inboxes/${inbox_identifier}/contacts/${contactId}/conversations/${conversationId}`

    const config = {
        headers:
        {
            api_access_token: apiAccessToken,
            'Content-Type': 'application/json; charset=utf-8'
        }
    }


    try {

        const response = await axios.get(finalUrl, config);

        console.log(response.data);

        return response.data;
        
    } catch (error) {

        throw (
            {
              status: error.response?.status || 500,
              message: error.response?.data || error,
            }
        )
    }


}

// https://app.chatwoot.com/public/api/v1/inboxes/{inbox_identifier}/contacts/{contact_identifier}/conversations

const createConversation = async (contactId) => {

    const finalUrl = `${apiUrl}/inboxes/${inbox_identifier}/contacts/${contactId}/conversations/`
    // console.log("Create Conversation url:", finalUrl)
    const config = {
        headers:
        {
            'Content-Type': 'application/json; charset=utf-8'
        }
    }

    try {

        const response = await axios.post(finalUrl, config);

        // console.log(response.data);

        return response.data;
        
    } catch (error) {

        throw (
            {
              status: error.response?.status || 500,
              message: error.response?.data || error,
            }
        )
    }

}


// https://app.chatwoot.com/public/api/v1/inboxes/{inbox_identifier}/contacts/{contact_identifier}/conversations/{conversation_id}/toggle_typing

const toggleTypingStatus = async (contactId, conversationId, typingStatus ) => {

    
    const finalUrl = `${apiUrl}/inboxes/${inbox_identifier}/contacts/${contactId}/conversations/${conversationId}/toggle_typing?typing_status=${typingStatus}`

    const config = {
        headers:
        {
            api_access_token: apiAccessToken,
            'Content-Type': 'application/json; charset=utf-8'
        }
    }


    try {

        const response = await axios.post(finalUrl, config);

        // console.log(response.data);

        return response.data;
        
    } catch (error) {

        throw (
            {
              status: error.response?.status || 500,
              message: error.response?.data || error,
            }
        )
    }

}


// https://app.chatwoot.com/public/api/v1/inboxes/{inbox_identifier}/contacts/{contact_identifier}/conversations/{conversation_id}/update_last_seen
const updateLastSeen = async (contactId, conversationId) => {

    
    const finalUrl = `${apiUrl}/inboxes/${inbox_identifier}/contacts/${contactId}/conversations/${conversationId}/update_last_seen`

    const config = {
        headers:
        {
            api_access_token: apiAccessToken,
            'Content-Type': 'application/json; charset=utf-8'
        }
    }


    try {

        const response = await axios.post(finalUrl, config);

        // console.log(response.data);

        return response.data;
        
    } catch (error) {

        throw (
            {
              status: error.response?.status || 500,
              message: error.response?.data || error,
            }
        )
    }

}



export default {
    getConversation,
    createConversation,
    toggleTypingStatus,
    updateLastSeen
}
