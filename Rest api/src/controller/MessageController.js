import Service from '../services/MessageService.js'

const getAllMessage = async (req, res) => {
    
    const { params : {contactId, conversationId} } = req;


    if('before' in req.query)
    {
        const before = Number(req.query.before); // Convertit 'before' en nombre


        if(!Number.isInteger(before))
        {
            return res.status(400).send({status: "Failed", message: "The request query 'after' must be an integer"});
        }

        try 
        {
    
            const response = await Service.getAllMessageBefore(conversationId, before)
            // console.log(response)
            return res
                        .status(200)
                        .send(
                            {
                                status: "OK",
                                data: response,
                            }
                        )
    
        } catch (error) {
        
            return res
                        .status(error?.status || 500)
                        .send(
                            {
                                status: "FAILED",
                                data: {error: error?.message || error}
                            }
                        )
        }

    }
    
    if('after' in req.query)
    {
        const after = Number(req.query.after); // Convertit 'after' en nombre


        if(!Number.isInteger(after))
        {
            return res.status(400).send({status: "Failed", message: "The request query 'after' must be an integer"});
        }

        try 
        {
    
            const response = await Service.getAllMessageAfter(conversationId, after)
            // console.log(response)
            return res
                        .status(200)
                        .send(
                            {
                                status: "OK",
                                data: response,
                            }
                        )
    
        } catch (error) {
        
            return res
                        .status(error?.status || 500)
                        .send(
                            {
                                status: "FAILED",
                                data: {error: error?.message || error}
                            }
                        )
        }

    }

    console.log("No : it's not ");
    
    if(!contactId || !conversationId)
    {
        return res.status(400).send({status: "FAILED", message: "The request parameter is INVALID "});
    }
    
    try 
    {

        const response = await Service.getAllMessage(contactId, conversationId)
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

const sendMessage = async (req, res) => {

    const { params : {contactId, conversationId} } = req;

    const content = req.body?.content;
    const filesPath = req.files;
    
    const isContentPresent = typeof content === 'string' && content.trim() !== '';
    const isfilesPathPresent = Array.isArray(filesPath) && filesPath.length > 0;

    // Exemple : log des fichiers
    if(filesPath !== undefined)
    {
        filesPath.forEach((file, index) => {
        console.log(`Fichier ${index + 1} : ${file.originalname}`);
        console.log(`Type MIME : ${file.mimetype}`);
        console.log(`Taille : ${file.size}`);
      // file.buffer contient le contenu du fichier
    });
    }
    
    
    if(!contactId || !conversationId)
    {
        return res.status(400).send({status: "FAILED", message: "The request parameter is INVALID "});
    }
    
    try 
    {

        let response;

        // console.log("isContentPresent ", isContentPresent);
        // console.log("isfilesPathPresent ", isfilesPathPresent);
        // console.log("content : ", content)
        // console.log("filesPath : ", filesPath)

        if (isContentPresent && isfilesPathPresent) {

            // Les deux sont présents
            console.log("message with both content and files")
            response = await Service.sendMessageWithContentAndFile(contactId, conversationId, content, filesPath);

        } else if (isContentPresent && !isfilesPathPresent) {

            // Seulement le contenu est présent
            console.log("message with only content ")
            response = await Service.sendMessageWithContent(contactId, conversationId, content);

        } else if (!isContentPresent && isfilesPathPresent) {

            // Seulement les fichiers sont présents
            console.log("message with only file ")
            response = await Service.sendMessageWithFile(contactId, conversationId, filesPath);

        } else {
            // Aucun des deux n’est présent
            return res.status(400).send({
                status: "FAILED",
                message: "missing message content",
            });
        }

        // Réponse standard
        res.status(200).send({
            status: "OK",
            data: response,
        });


        

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


// const updateMessage = async (req, res) => {

// }


const deleteMessage = async (req, res) => {

    const { params : {conversationId, messageId} } = req;

    if(!conversationId || !messageId)
    {
        return res.status(400).send({status: "FAILED", message: "The request parameter is INVALID "});
    }
    
    try 
    {

        const response = await Service.deleteMessage(conversationId, messageId)
        // console.log(response)
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



export default {
    getAllMessage,
    sendMessage,
    // updateMessage,
    deleteMessage
}