import Message from '../chatwoot/Message.js'

const getAllMessage = async (contactId, conversationId) => {

    try 
    {
        const response = await Message.getAllMessage(contactId, conversationId);
        return response;
            
    } catch (error) {

        throw(
            {
                status: error?.status || 500,
                message: error?.message || error
            }
        )
    }
    
}

const getAllMessageAfter = async (conversationId, after) => {

    try 
    {
        const response = await Message.getAllMessageAfter(conversationId, after);
        return response;
            
    } catch (error) {

        throw(
            {
                status: error?.status || 500,
                message: error?.message || error
            }
        )
    }
    
}

const getAllMessageBefore = async (conversationId, before) => {

    try 
    {
        const response = await Message.getAllMessageBefore(conversationId, before);
        return response;
            
    } catch (error) {

        throw(
            {
                status: error?.status || 500,
                message: error?.message || error
            }
        )
    }
    
}


const sendMessageWithContent = async (contactId, conversationId, content) => {
    
    try 
    {
        const response = await Message.sendMessageWithContent(contactId, conversationId, content);
        return response;
            
    } catch (error) {

        throw(
            {
                status: error?.status || 500,
                message: error?.message || error
            }
        )
    }

}

const sendMessageWithFile = async (contactId, conversationId, filesPath) => {
    
    try 
    {
        const response = await Message.sendMessageWithFile(contactId, conversationId, filesPath);
        return response;
            
    } catch (error) {

        throw(
            {
                status: error?.status || 500,
                message: error?.message || error
            }
        )
    }

}

const sendMessageWithContentAndFile = async (contactId, conversationId, content, filesPath) => {
    
    try 
    {
        // console.log("message service pass succesfully ")
        const response = await Message.sendMessageWithContentAndFile(contactId, conversationId,content, filesPath);
        return response;
            
    } catch (error) {

        throw(
            {
                status: error?.status || 500,
                message: error?.message || error
            }
        )
    }

}

// const updateMessage = async () => {

// }


const deleteMessage = async (conversationId, messageId) => {

    try 
    {
        const response = await Message.deleteMessage(conversationId, messageId);
        return response;
            
    } catch (error) {

        throw(
            {
                status: error?.status || 500,
                message: error?.message || error
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