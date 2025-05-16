import Contact from '../chatwoot/Contact.js'


const createContact = async (contactInformations) => {


    try {

        const newContact = await Contact.createContact(contactInformations);
        return newContact;

    } catch (error) {
        
        throw(
            {
                status: error?.status || 500,
                message: error?.message || error,
            }
        )
    }

}


const getContact = async (contactId) => {

    try {

        const contactInformations = await Contact.getContact(contactId);

        return contactInformations;
        
    } catch (error) {
        throw(
            {
                status: error?.status || 500,
                message: error?.message || error,
            }
        )    
    }
}

const updateContact = async (contactId, body) => {

    
    try {

        const NewContactInformations = await Contact.updateContact(contactId, body);

        return NewContactInformations;
        
    } catch (error) {
        throw(
            {
                status: error?.status || 500,
                message: error?.message || error,
            }
        )    
    }

}


const deleteContact = async (contactId) => {

    try {

        const contactInformations = await Contact.deleteContact(contactId);

        return contactInformations;
        
    } catch (error) {
        throw(
            {
                status: error?.status || 500,
                message: error?.message || error,
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
