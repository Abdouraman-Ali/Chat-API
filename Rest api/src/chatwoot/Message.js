import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path:  path.join(__dirname, "../../.env")  });


import axios from "axios";
import FormData from "form-data";

const apiUrl = process.env.API_URL;
const apiUrlApp = process.env.API_URL_APP;
const inbox_identifier = process.env.INBOX_IDENTIFIER;
const account_id = process.env.ACCOUNT_ID;
const apiAccessToken = process.env.API_ACCESS_TOKEN;

const MAX_TOTAL_SIZE = 20 * 1024 * 1024;  // Taille maximale de donnee pouvant etre envoyee 20 Mo


// const allowedExtensions = ['.pdf', '.csv','.jpg', '.gif' ,'.png', '.mp3', '.ogg', '.mp4'];       // Extensions autorisées

// Types MIME correspondants aux extensions autorisées (s'assurer que chaque extention ajouter a son mine type correspondant)
const extensionToMime = {
  '.pdf': 'application/pdf',
  '.csv': 'text/csv',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', // important à inclure avec .jpg
  '.gif': 'image/gif',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4'
};

// https://app.chatwoot.com/public/api/v1/inboxes/{inbox_identifier}/contacts/{contact_identifier}/conversations/{conversation_id}/messages



function isValidFile(file) {
  if (!file || typeof file !== 'object') return false;

  const ext = path.extname(file.originalname).toLowerCase();
  const expectedMime = extensionToMime[ext];

  console.log(`📁 Fichier : ${file.originalname}`);
  console.log(`🔍 Extension : ${ext}, MIME reçu : ${file.mimetype}, MIME attendu : ${expectedMime}`);

  const isAllowedExt = Object.keys(extensionToMime).includes(ext);
  const isMimeMatch = expectedMime && file.mimetype === expectedMime;

  return isAllowedExt && isMimeMatch && Buffer.isBuffer(file.buffer);
}



const getAllMessage = async (contactId, conversationId) => {

    const finalUrl = `${apiUrl}/inboxes/${inbox_identifier}/contacts/${contactId}/conversations/${conversationId}/messages`

    const config = {
        headers:
        {
            api_access_token: apiAccessToken,
            'Content-Type': 'application/json; charset=utf-8'
        }
    }

    try {

        const response = await axios.get(finalUrl, config);
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

// https://app.chatwoot.com/api/v1/accounts/{account_id}/conversations/{conversation_id}/messages

const getAllMessageAfter = async (conversationId, after) => {

    const finalUrl = `${apiUrlApp}/accounts/${account_id}/conversations/${conversationId}/messages?=&after=${after}`

    const config = {
        headers:
        {
            api_access_token: apiAccessToken,
            'Content-Type': 'application/json; charset=utf-8'
        }
    }

    try {

        const response = await axios.get(finalUrl, config);
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

const getAllMessageBefore = async (conversationId, before) => {

    const finalUrl = `${apiUrlApp}/accounts/${account_id}/conversations/${conversationId}/messages?=&before=${before}`

    const config = {
        headers:
        {
            api_access_token: apiAccessToken,
            'Content-Type': 'application/json; charset=utf-8'
        }
    }

    try {

        const response = await axios.get(finalUrl, config);
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

// https://app.chatwoot.com/public/api/v1/inboxes/{inbox_identifier}/contacts/{contact_identifier}/conversations/{conversation_id}/messages

const sendMessageWithContent = async (contactId, conversationId, content) => {

    console.log("Send Message with juste content");

    const finalUrl = `${apiUrl}/inboxes/${inbox_identifier}/contacts/${contactId}/conversations/${conversationId}/messages`

    const config = {
        headers:
        {
            'Content-Type': 'application/json; charset=utf-8'
        }
    }

    const body = {
        content : content 
    }


    try {

        const response = await axios.post(finalUrl, body, config);
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

const sendMessageWithFile = async (contactId, conversationId, filesPath) => {

    console.log("Send Message with juste file");

    
    const invalidFiles = [];   // Liste des fichiers invalides à retourner ou enregistrer
    const finalUrl = `${apiUrl}/inboxes/${inbox_identifier}/contacts/${contactId}/conversations/${conversationId}/messages`
    let totalSize = 0;
    
    // Créez une instance de FormData
    const form = new FormData();


    filesPath.forEach(file => {
        if (!isValidFile(file)) {
            console.warn(`❌ Fichier invalide : ${file.originalname}`);
            invalidFiles.push({
                name: file.originalname,
                reason: 'Unauthorized file type or invalid extension'
            });
            return;
        }

        if ((totalSize + file.size) > MAX_TOTAL_SIZE) {
            invalidFiles.push({
                name: file.originalname,
                reason: `📦 The file « ${file.originalname} » (${(file.size / 1024 / 1024).toFixed(2)}MB) was not accepted because the total size limit allowed (${MAX_TOTAL_SIZE_MB.toFixed(2)} MB) would be outdated.`,
                details: `➡️ Current cumulative size : ${(totalSize / 1024 / 1024).toFixed(2)} MB\n➡️ File size : ${(file.size / 1024 / 1024).toFixed(2)} MB\n💡 Tip: You can still send about ${(MAX_TOTAL_SIZE - totalSize) / 1024 / 1024 < 0 ? 0 : ((MAX_TOTAL_SIZE - totalSize) / 1024 / 1024).toFixed(2)} MB. Reduce the size of this file or split it into multiple uploads.`      });
            return;
        }

        form.append('attachments[]', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype
        });

        totalSize += file.size;

        console.log(`✅ Fichier ajouté : ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} Mo)`);
        console.log("totalSize, ", totalSize)
    });

    

    try {


        const response = await axios.post(finalUrl, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: MAX_TOTAL_SIZE,
        });

        let finaleResponse;

        // si des fichier sont invalides
        if (invalidFiles.length > 0) {
            
            console.log('📦 Fichiers invalides à renvoyer au client :', invalidFiles);
            // return res.status(400).json({ error: 'Certains fichiers sont invalides', files: invalidFiles });
            
            finaleResponse = {
                ...response.data,
                invalidFiles: invalidFiles
            }
        }
        else{

            finaleResponse = {
                ...response.data,
            }

        }

        return finaleResponse;

    } catch (error) {
        throw {
            status: error.response?.status || 500,
            message: error.response?.data || error.message,
        };
    }


}

const sendMessageWithContentAndFile = async (contactId, conversationId, content, filesPath) => {

    console.log("Send Message with both content and file");
     // Liste des fichiers invalides à retourner ou enregistrer
    const invalidFiles = [];
    const finalUrl = `${apiUrl}/inboxes/${inbox_identifier}/contacts/${contactId}/conversations/${conversationId}/messages`
    let totalSize = 0;
    
    // Créez une instance de FormData
    const form = new FormData();


    filesPath.forEach(file => {
        if (!isValidFile(file)) {
            console.warn(`❌ Fichier invalide : ${file.originalname}`);
            invalidFiles.push({
                name: file.originalname,
                reason: 'Unauthorized file type or invalid extension'
            });
            return;
        }

        if ((totalSize + file.size) > MAX_TOTAL_SIZE) {
            invalidFiles.push({
                name: file.originalname,
                reason: `📦 The file « ${file.originalname} » (${(file.size / 1024 / 1024).toFixed(2)}MB) was not accepted because the total size limit allowed (${MAX_TOTAL_SIZE_MB.toFixed(2)} MB) would be outdated.`,
                details: `➡️ Current cumulative size : ${(totalSize / 1024 / 1024).toFixed(2)} MB\n➡️ File size : ${(file.size / 1024 / 1024).toFixed(2)} MB\n💡 Tip: You can still send about ${(MAX_TOTAL_SIZE - totalSize) / 1024 / 1024 < 0 ? 0 : ((MAX_TOTAL_SIZE - totalSize) / 1024 / 1024).toFixed(2)} MB. Reduce the size of this file or split it into multiple uploads.`      });
            return;
                
        }

        form.append('attachments[]', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype
        });

        totalSize += file.size;

        console.log(`✅ Fichier ajouté : ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} Mo)`);
    });

    // ajout du message
    form.append('content', content);

    

    try {


        const response = await axios.post(finalUrl, form, {
            headers: form.getHeaders(),
        maxContentLength: Infinity,
            maxBodyLength: MAX_TOTAL_SIZE,
        });

        let finaleResponse;

        // si des fichier sont invalides
        if (invalidFiles.length > 0) {
            
            console.log('📦 Fichiers invalides à renvoyer au client :', invalidFiles);
            // return res.status(400).json({ error: 'Certains fichiers sont invalides', files: invalidFiles });
            
            finaleResponse = {
                ...response.data,
                invalidFiles: invalidFiles
            }
        }
        else{

            finaleResponse = {
                ...response.data,
            }

        }

        return finaleResponse;

    } catch (error) {
        throw {
            status: error.response?.status || 500,
            message: error.response?.data || error.message,
        };
    }


}

// https://app.chatwoot.com/public/api/v1/inboxes/{inbox_identifier}/contacts/{contact_identifier}/conversations/{conversation_id}/messages/{message_id}

// const updateMessage = async (contactId, conversationId, messageId) => {

//     const finalUrl = `${apiUrl}/inboxes/${inbox_identifier}/contacts/${contactId}/conversations/${conversationId}/messages/${messageId}`

//     const config = {
//         headers:
//         {
//             'Content-Type': 'application/json; charset=utf-8'
//         }
//     }

//     const body = {
//         content : content 
//     }


//     try {

//         const response = await axios.patch(finalUrl, body, config);
//         return response.data;
        
//     } catch (error) {

//         throw (
//             {
//               status: error.response?.status || 500,
//               message: error.response?.data || error,
//             }
//         )
//     }


// }

// https://app.chatwoot.com/api/v1/accounts/{account_id}/conversations/{conversation_id}/messages/{message_id}

const deleteMessage = async (conversationId,  messageId) => {

    const finalUrl = `${apiUrlApp}/accounts/${account_id}/conversations/${conversationId}/messages/${messageId}`


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
    getAllMessageAfter,
    getAllMessageBefore,
    getAllMessage,
    sendMessageWithContent,
    sendMessageWithFile,
    sendMessageWithContentAndFile,
    // updateMessage,
    deleteMessage
}


