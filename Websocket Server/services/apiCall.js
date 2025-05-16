import axios from "axios";

const apiUrl = 'http://localhost:4000/api/v1';

const getContactInfo = async (header) => {
    
    console.log("appel commence ... ")
    const { source_id } = header;
    
    if(!source_id)
    {
        return res.status(400).send({status: "FAILED", message: "source_id  is missed"})
    }

    try {

        const finalUrl = `${apiUrl}/contact/${source_id}`;
        const response = await axios.get(finalUrl);

        console.log("reponse data: ", response.data)
        return {
            //status: response.status,
            data: response.data
        };
        
    } catch (error) {
        throw({
            status: error.response?.status || 5000,
            message: error?.message || error
        })
    }


}

const updateContact = async (header, body) => {
    
    const { source_id } = header;
    const { name, email, phone_number } = body;

    if(!name || !email || !phone_number )
    {
        return res.status(400).send({status: "FAILED", message: "one of the following fields is incorrect (name, email, phone_number), please correct it"})
    }

    if(!source_id)
    {
        return res.status(400).send({status: "FAILED", message: "source_id  is missed"})
    }

    try {

        const data = {
            name,
            email,
            phone_number
        }


        const finalUrl = `${apiUrl}/contact/${source_id}`;
        
        const response = await axios.patch(finalUrl,  data ,{
            headers: {
              'Content-Type': 'application/json'
            }
        });


        console.log("reponse data: ", response.data)

        return {
            //status: response.status,
            data: response.data
        };
        
    } catch (error) {
        throw({
            status: error.response?.status || 5000,
            message: error?.message || error
        })
    }
}

const deleteContact = async (header) => {
    
    const { id } = header;
    
    if(!id)
    {
        return res.status(400).send({status: "FAILED", message: "id of contact is missed"});
    }

    try {

        const finalUrl = `${apiUrl}/contact/${id}`;
        const response = await axios.delete(finalUrl);

      
        console.log("reponse data: ", response.data)
       
        return {
            //status: response.status,
            data: response.data
        };
 
    } catch (error) {
        throw({
            status: error.response?.status || 5000,
            message: error?.message || error
        })
    }


}

const getMessageAfter = async (header) => {
      
    const {source_id ,conversation_id, message_id } = header;
    
    if(!conversation_id || !message_id || !source_id)
    {
        return res.status(400).send({status: "FAILED", message: "One of the following field is missed source_id, conversation_id or message_id"});
    }

    try {

        const finalUrl = `${apiUrl}/contact/${source_id}/conversation/${conversation_id}/message?after=${message_id}`;
        const response = await axios.get(finalUrl, {
            headers: {
              'Content-Type': 'application/json'
            }
        });

      
        console.log("reponse data: ", response.data)
        
        return {
            //status: response.status,
            data: response.data
        };
        
    } catch (error) {
        throw({
            status: error.response?.status || 5000,
            message: error?.message || error
        })
    }
}

const getAllMessage = async (header) => {
      
    const {source_id ,conversation_id } = header;
    
    if(!conversation_id  || !source_id)
    {
        return res.status(400).send({status: "FAILED", message: "One of the following field is missed source_id, conversation_id"});
    }

    try {

        const finalUrl = `${apiUrl}/contact/${source_id}/conversation/${conversation_id}/message`;
        const response = await axios.get(finalUrl, {
            headers: {
              'Content-Type': 'application/json'
            }
        });

      
        console.log("reponse data: ", response.data)
        
        return {
            //status: response.status,
            data: response.data
        };
 
    } catch (error) {
        throw({
            status: error.response?.status || 5000,
            message: error?.message || error
        })
    }
}

const getMessageBefore = async (header) => {
      
    const {source_id ,conversation_id, message_id } = header;
    
    if(!conversation_id || !message_id || !source_id)
    {
        return res.status(400).send({status: "FAILED", message: "One of the following field is missed source_id, conversation_id or message_id"});
    }

    try {

        const finalUrl = `${apiUrl}/contact/${source_id}/conversation/${conversation_id}/message?before=${message_id}`;
        const response = await axios.get(finalUrl, {
            headers: {
              'Content-Type': 'application/json'
            }
        });

      
        console.log("reponse data: ", response.data)
        
        return {
            //status: response.status,
            data: response.data
        };
 
    } catch (error) {
        throw({
            status: error.response?.status || 5000,
            message: error?.message || error
        })
    }
}


const newMessage = async (header, body) =>{

    const { source_id, conversation_id } = header;
    const { content } = body;


    if(!source_id || !conversation_id)
    {
        return res.status(400).send({status: "FAILED", message: "Either source_id or conversation_id is missed"});
    }

    if(!content)
    {
        return res.status(400).send({status: "FAILED", message: "the content of the message is missing"});
    }
 
    try {

        const body = {
            content
        }

        const finalUrl = `${apiUrl}/contact/${source_id}/conversation/${conversation_id}/message`;

        const response = await axios.post(finalUrl, body ,{
            headers: {
              'Content-Type': 'application/json'
            }
        });

      
        console.log("reponse data: ", response.data)


        
        return {
            //////status: response.status,
            data: response.data
        };
 
        
    } catch (error) {
        throw({
            status: error.response?.status || 5000,
            message: error?.message || error
        })
    }

}

const deleteMessage = async (header) => {
    
    const {conversation_id, message_id } = header;


    if(!message_id || !conversation_id)
    {
        return res.status(400).send({status: "FAILED", message: "Either conversation_id or message_id is missed"});
    }
 
    try {

        const finalUrl = `${apiUrl}/conversation/${conversation_id}/message/${message_id}`;

        const response = await axios.delete(finalUrl);

      
        console.log("reponse data: ", response.data)

      
        return {
            //////status: response.status,
            data: response.data
        };
 
    } catch (error) {
        throw({
            status: error.response?.status || 5000,
            message: error?.message || error
        })
    }

}

// http://localhost:4000/api/v1/contact/22e19d26-26d9-4e98-b909-11db860cc17f/conversation/24/update_last_seen

const updateLastSeen = async (header) => {

    const { source_id, conversation_id } = header;

    if(!source_id || !conversation_id)
    {
        return res.status(400).send({status: "FAILED", message: "Either source_id or conversation_id is missed"});
    }

    try {

        const finalUrl = `${apiUrl}/contact/${source_id}/conversation/${conversation_id}/update_last_seen`;

        const response = await axios.post(finalUrl);

      
        console.log("reponse data: ", response.data)

   
        return {
            //status: response.status,
            data: response.data
        };
 
        
    } catch (error) {
        throw({
            status: error.response?.status || 5000,
            message: error?.message || error
        })
    }



}

// http://localhost:4000/api/v1/contact/2be4c859-4056-4f93-b9fa-19d10e757d80/conversation/25/toggle_typing?typing_status=on
const typingStatus = async (header, status) => {

    const { source_id, conversation_id } = header;

    if(!source_id || !conversation_id)
    {
        return res.status(400).send({status: "FAILED", message: "Either source_id or conversation_id is missed"});
    }

    try {

        const finalUrl = `${apiUrl}/contact/${source_id}/conversation/${conversation_id}/toggle_typing?typing_status=${status}`;

        const response = await axios.post(finalUrl);

        console.log("reponse data: ", response.data)


       
        return {
            //status: response.status,
            data: response.data
        };
 
        
    } catch (error) {
        throw({
            status: error.response?.status || 5000,
            message: error?.message || error
        })
    }
    
}




export default {
    getContactInfo,
    updateContact,
    deleteContact,
    getMessageAfter,
    getMessageBefore,
    getAllMessage,
    newMessage,
    deleteMessage,
    updateLastSeen,
    typingStatus
}


