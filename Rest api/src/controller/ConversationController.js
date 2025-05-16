import Service from "../services/ConversationServices.js"



const getConversation = async (req, res) => {

    const {
        params : {contactId, conversationId},
    } = req;

    if(!contactId || !conversationId)
    {
        return res.status(400).send({status: "FAILED", message: "The request parameter is INVALID "});
    }

    try {
    
            const conversationInformations = await Service.getConversation(contactId, conversationId)
            console.log(conversationInformations)
    
            res
                .status(200)
                .send(
                    {
                        status: "OK",
                        data: conversationInformations,
                    }
                )
            
        } catch (error) {
    
            res
                .status(error?.status || 500)
                .send(
                    {
                        status: "FAILED",
                        data: {error: error?.message || error}
                    }
                )
        }
}


const createConversation = async (req, res) => {

    const {
        params : {contactId},
    } = req;

    if(!contactId)
    {
        return res.status(400).send({status: "FAILED", message: "The request parameter is INVALID"});
    }

    try {
    
            const newConversation = await Service.createConversation(contactId)
    
            res
                .status(200)
                .send(
                    {
                        status: "OK",
                        data: newConversation,
                    }
                )
            
        } catch (error) {
    
            res
                .status(error?.status || 500)
                .send(
                    {
                        status: "FAILED",
                        data: {error: error?.message || error}
                    }
                )
        }

}

const toggleTypingStatus = async (req, res) => {

    const { params : {contactId, conversationId} } = req;
    const typingStatus = req.query.typing_status;


    if(!contactId || !conversationId)
    {
        return res.status(400).send({status: "FAILED", message: "The request parameter is INVALID "});
    }

    if(!["on", "off"].includes(typingStatus))
    {
        return res.status(400).send({status: "FAILED", message: "The request query 'typing_status' is required, it must be either 'on' or 'off' "});
    }

    try {
    
            const response = await Service.toggleTypingStatus(contactId, conversationId, typingStatus)
    
            res
                .status(200)
                .send(
                    {
                        status: "OK",
                        data: response,
                    }
                )
            
        } catch (error) {
    
            res
                .status(error?.status || 500)
                .send(
                    {
                        status: "FAILED",
                        data: {error: error?.message || error}
                    }
                )
        }

}

const updateLastSeen = async (req, res) => {

    const {
        params : {contactId, conversationId},
    } = req;

    if(!contactId || !conversationId)
    {
        return res.status(400).send({status: "FAILED", message: "The request parameter is INVALID "});
    }

    try {
    
            const conversationInformations = await Service.updateLastSeen(contactId, conversationId)
    
            res
                .status(200)
                .send(
                    {
                        status: "OK",
                        data: conversationInformations,
                    }
                )
            
        } catch (error) {
    
            res
                .status(error?.status || 500)
                .send(
                    {
                        status: "FAILED",
                        data: {error: error?.message || error}
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