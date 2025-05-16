import Services from '../services/ContactService.js'


const createContact = async (req, res) => {

    const { name, email, phone_number } = req.body;

    const contactInformations = {
      email,
      name,
      phone_number,
    };
    

    try {
        const newContact = await Services.createContact(contactInformations);

        res
            .status(201)
            .send(
                {
                    status: "Ok",
                    data: newContact,
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


const getContact = async (req, res) => {


    const { params : {contactId}, } = req;

    try {

        const contactInformations = await Services.getContact(contactId)

        // console.log(contactInformations)
        res
            .status(200)
            .send(
                {
                    status: "OK",
                    data: contactInformations,
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

const updateContact = async (req, res) => {

    console.log("Controller Succes");

    const { params : {contactId}, } = req;

    const { name, email, phone_number } = req.body;

    const contactInformations = {
      email,
      name,
      phone_number,
    };

    try {

        const NewContactInformations = await Services.updateContact(contactId, contactInformations)

        res
            .status(200)
            .send(
                {
                    status: "OK",
                    data: NewContactInformations,
                }
            )
        
    } catch (error) {

        res
            .send(error?.status || 500)
            .send(
                {
                    status: "FAILED",
                    data: {error: error?.message || error}
                }
            )
    }
}

const deleteContact = async (req, res) => {

    const { params : {contactId} } = req;

    try {

        const contactInformations = await Services.deleteContact(contactId)

        // console.log(contactInformations)
        res
            .status(200)
            .send(
                {
                    status: "OK",
                    data: contactInformations,
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
    createContact,
    getContact,
    updateContact,
    deleteContact
}