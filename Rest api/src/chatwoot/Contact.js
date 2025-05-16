import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path:  path.join(__dirname, "../../.env")  });

import axios from "axios"



const apiUrl = process.env.API_URL;
const apiUrlApp = process.env.API_URL_APP;
const account_id =process.env.ACCOUNT_ID;
const inbox_identifier = process.env.INBOX_IDENTIFIER;
const apiAccessToken = process.env.API_ACCESS_TOKEN;


// console.log(account_id)
// console.log("inbox_identifier",inbox_identifier)
// console.log(apiAccessToken)



const createContact = async (body) => {

    console.log("Contact Chatwoot Succes");

    const finalUrl = `${apiUrl}/inboxes/${inbox_identifier}/contacts`

    const config = {
        headers:
        {
            api_access_token: apiAccessToken,
            'Content-Type': 'application/json; charset=utf-8'
        }
    }

    console.log("body :", body)

    try {

        const response = await axios.post(finalUrl, body, config);
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

// https://app.chatwoot.com/public/api/v1/inboxes/{inbox_identifier}/contacts/{contact_identifier}

const getContact = async (contactId) => {

    const finalUrl = `${apiUrl}/inboxes/${inbox_identifier}/contacts/${contactId}`

    try {

        const response = await axios.get(finalUrl);
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

const updateContact = async (contactId, body) => {

    const finalUrl = `${apiUrl}/inboxes/${inbox_identifier}/contacts/${contactId}`

    const newContact = {
        email: body.email,
        name: body.name,
        phone_number: body.phone_number,
    }

    const config = {
        headers:
        {
            'Content-Type': 'application/json; charset=utf-8'
        }
    }

    try {

        const response = await axios.patch(finalUrl, newContact, config);
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

// https://app.chatwoot.com/api/v1/accounts/{account_id}/contacts/{id}

const deleteContact = async (contactId) => {

    const finalUrl = `${apiUrlApp}/accounts/${account_id}/contacts/${contactId}`

    const config = {
        headers:
        {
            api_access_token: apiAccessToken,
            'Content-Type': 'application/json; charset=utf-8'
        }
    }
    try {

        const response = await axios.delete(finalUrl, config);
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
    createContact,
    getContact,
    updateContact,
    deleteContact,
}