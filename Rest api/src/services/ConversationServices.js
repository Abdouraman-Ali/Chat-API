import Conversation from "../chatwoot/Conversation.js"



const getConversation = async (contactId, conversationId) => {

    try {

        const conversationInformations = await Conversation.getConversation(contactId, conversationId);
        console.log(conversationInformations)
        return conversationInformations
        
    } catch (error) {

        throw(
            {
                status: error?.status || 500,
                message: error?.message || error
            }
        )
        
    }

}

const createConversation = async (contactId) => {

    try {

        const newConversation = await Conversation.createConversation(contactId);
        return newConversation
        
    } catch (error) {

        throw(
            {
                status: error?.status || 500,
                message: error?.message || error
            }
        )
        
    }

}

const toggleTypingStatus = async (contactId, conversationId, typingStatus) => {

    try {

        const response = await Conversation.toggleTypingStatus(contactId, conversationId,  typingStatus);
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

const updateLastSeen = async (contactId, conversationId) => {

    try {

        const response = await Conversation.updateLastSeen(contactId, conversationId);
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
    getConversation,
    createConversation,
    toggleTypingStatus,
    updateLastSeen
}

