import express from "express";
import Controller from "../../controller/ConversationController.js"
import MessageRouter from '../router/MessageRouter.js'
import Middleware from '../../middleware/middleware.js'

const {handleValidationErrors , isParamContactIdCorrect, isParamConversationIdCorrect} = Middleware;

const router = express.Router({ mergeParams: true });

// documentaion swagger

/**
 * @swagger
 * tags:
 *   name: Conversation
 *   description: Endpoints for managing Conversations
 */


/**
 * @swagger
 * /contact/{contactId}/conversation/{conversationId}:
 *   get:
 *     summary: Retrieve details of a specific conversation for a given contact
 *     tags: [Conversation]
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: The `source_id` of the contact obtained during contact creation.
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The `id` of the conversation obtained when creating it.
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: "integer"
 *                     uuid:
 *                       type: string
 *                       format: uuid
 *                       example: "uuid"
 *                     inbox_id:
 *                       type: integer
 *                       example: "integer"
 *                     contact_last_seen_at:
 *                       type: integer
 *                       example: "integer"
 *                     status:
 *                       type: string
 *                       example: "string"
 *                     agent_last_seen_at:
 *                       type: integer
 *                       example: "integer"
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: "integer"
 *                           content:
 *                             type: string
 *                             example: "string"
 *                           message_type:
 *                             type: integer
 *                             example: "integer"
 *                           content_type:
 *                             type: string
 *                             example: "string"
 *                           content_attributes:
 *                             type: object
 *                             example: {}
 *                           created_at:
 *                             type: integer
 *                             example: "integer"
 *                           conversation_id:
 *                             type: integer
 *                             example: "integer"
 *                           attachments:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: "integer"
 *                                 message_id:
 *                                   type: integer
 *                                   example: "integer"
 *                                 file_type:
 *                                   type: string
 *                                   example: "image"
 *                                 account_id:
 *                                   type: integer
 *                                   example: "integer"
 *                                 extension:
 *                                   type: string
 *                                   nullable: true
 *                                 data_url:
 *                                   type: string
 *                                   format: uri
 *                                 thumb_url:
 *                                   type: string
 *                                   format: uri
 *                                 file_size:
 *                                   type: integer
 *                                   example: "integer"
 *                                 width:
 *                                   type: integer
 *                                   example: "integer"
 *                                 height:
 *                                   type: integer
 *                                   example: "integer"
 *                           sender:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: "integer"
 *                               name:
 *                                 type: string
 *                                 example: "Mr Alex"
 *                               available_name:
 *                                 type: string
 *                                 example: "Mr Alex"
 *                               avatar_url:
 *                                 type: string
 *                                 example: ""
 *                               type:
 *                                 type: string
 *                                 example: "user"
 *                               availability_status:
 *                                 type: string
 *                                 nullable: true
 *                               thumbnail:
 *                                 type: string
 *                                 example: ""
 *                     contact:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: "integer"
 *                         name:
 *                           type: string
 *                           example: "string"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "email"
 *                         phone_number:
 *                           type: string
 *                           example: "string"
 *                         account_id:
 *                           type: integer
 *                           example: "integer"
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: "date-time"
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *                           example: "date-time"
 *                         additional_attributes:
 *                           type: object
 *                           example: {}
 *                         identifier:
 *                           type: string
 *                           nullable: true
 *                         custom_attributes:
 *                           type: object
 *                           example: {}
 *                         last_activity_at:
 *                           type: string
 *                           format: date-time
 *                           example: "date-time"
 *                         contact_type:
 *                           type: string
 *                           example: "lead"
 *                         middle_name:
 *                           type: string
 *                           example: ""
 *                         last_name:
 *                           type: string
 *                           example: ""
 *                         location:
 *                           type: string
 *                           nullable: true
 *       400:
 *         description:  Invalid query — malformed or missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "BAD_REQUEST"
 *                 message:
 *                   type: string
 *                   example: "Invalid contactId or conversationId"
 *       404:
 *         description: Conversation or contact not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "NOT_FOUND"
 *                 message:
 *                   type: string
 *                   example: "Conversation not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "INTERNAL_SERVER_ERROR"
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */


router.get("/:conversationId",
    isParamContactIdCorrect, 
    isParamConversationIdCorrect, 
    handleValidationErrors,
    Controller.getConversation);       // contactId = source_id of the contact obtained on contact create

 /**
 * @swagger
 * /contact/{contactId}/conversation:
 *   post:
 *     summary: Create a new conversation for a given contact
 *     tags:
 *       - Conversation
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: The `source_id` of the contact  obtained during contact creation.
 *     responses:
 *       201:
 *         description: Conversation successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: "integer"
 *                     uuid:
 *                       type: string
 *                       format: uuid
 *                       example: "uuid"
 *                     inbox_id:
 *                       type: integer
 *                       example: "integer"
 *                     contact_last_seen_at:
 *                       type: integer
 *                       example: "integer"
 *                     status:
 *                       type: string
 *                       example: open
 *                     agent_last_seen_at:
 *                       type: integer
 *                       example: "integer"
 *                     messages:
 *                       type: array
 *                       items: {}
 *                       example: []
 *                     contact:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: "integer"
 *                         name:
 *                           type: string
 *                           example: string
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "string"
 *                         phone_number:
 *                           type: string
 *                           example: "string"
 *                         account_id:
 *                           type: integer
 *                           example: "integer"
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: "date-time"
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *                           example: "date-time"
 *                         additional_attributes:
 *                           type: object
 *                           example: {}
 *                         identifier:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         custom_attributes:
 *                           type: object
 *                           example: {}
 *                         last_activity_at:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                           example: null
 *                         contact_type:
 *                           type: string
 *                           example: "string"
 *                         middle_name:
 *                           type: string
 *                           example: "string"
 *                         last_name:
 *                           type: string
 *                           example: "string"
 *                         location:
 *                           type: string
 *                           nullable: true
 *                           example: "string"
 *                         country_code:
 *                           type: string
 *                           nullable: true
 *                           example: "string"
 *                         blocked:
 *                           type: boolean
 *                           example: "boolean"
 *                         label_list:
 *                           type: array
 *                           items: {}
 *                           example: []
 *       400:
 *         description: Invalid contact ID format or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Invalid contact ID"
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Contact not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Something went wrong on the server"
 *       503:
 *         description: Service unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Service temporarily unavailable. Please try again later."
 */

router.post("/",isParamContactIdCorrect, 
    handleValidationErrors, 
    Controller.createConversation);



/**
 * @swagger
 * /contact/{contactId}/conversation/{conversationId}/toggle_typing:
 *   post:
 *     summary: Toggle the typing status in the conversation
 *     tags:
 *       - Conversation
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: The `source_id` of the contact  obtained during contact creation.
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The `id` of the conversation
 *       - in: query
 *         name: typing_status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [on, off]
 *         description: Toggle typing indicator. Must be either `on` or `off`.
 *     responses:
 *       200:
 *         description: Typing status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: string
 *                   example: ""
 *       400:
 *         description: Missing or invalid query parameter or path ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ERROR
 *                 message:
 *                   type: string
 *                   example: "typing_status must be either 'on' or 'off' "
 *       404:
 *         description: Contact or conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ERROR
 *                 message:
 *                   type: string
 *                   example: "Conversation Not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ERROR
 *                 message:
 *                   type: string
 *                   example: "Something went wrong on the server"
 *       503:
 *         description: Service temporarily unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ERROR
 *                 message:
 *                   type: string
 *                   example: "Service temporarily unavailable. Please try again later."
 */

router.post("/:conversationId/toggle_typing", 
    isParamContactIdCorrect, 
    isParamConversationIdCorrect, 
    handleValidationErrors,
    Controller.toggleTypingStatus);

/**
 * @swagger
 * /contact/{contactId}/conversation/{conversationId}/update_last_seen:
 *   post:
 *     summary: Update the last seen timestamp of a conversation
 *     tags:
 *       - Conversation
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: The `source_id` of the contact  obtained during contact creation.
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The `id` of the conversation
 *     responses:
 *       200:
 *         description: Last seen timestamp updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: "Last seen timestamp updated"
 *       400:
 *         description: Invalid parameters in path
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ERROR
 *                 message:
 *                   type: string
 *                   example: "Invalid contactId or conversationId"
 *       404:
 *         description: Conversation or contact not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ERROR
 *                 message:
 *                   type: string
 *                   example: "Conversation not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ERROR
 *                 message:
 *                   type: string
 *                   example: "Unexpected server error"
 *       503:
 *         description: Service temporarily unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ERROR
 *                 message:
 *                   type: string
 *                   example: "Service temporarily unavailable. Please try again later."
 */


router.post("/:conversationId/update_last_seen", 
    isParamContactIdCorrect, 
    isParamConversationIdCorrect,
    handleValidationErrors, 
    Controller.updateLastSeen);


router.use("/:conversationId/message", 
    MessageRouter);

export default router;