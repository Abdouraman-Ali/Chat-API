import express from "express";
import Controller from "../../controller/MessageController.js"
import Middleware from '../../middleware/middleware.js'

// path.join(__dirname, "../router/*.js"),


const { handleValidationErrors ,upload,multerErrorHandler , isParamContactIdCorrect, isParamConversationIdCorrect, isParamMessageIdCorrect} = Middleware;
const {getAllMessage, sendMessage, updateMessage, deleteMessage} = Controller;
const router = express.Router({ mergeParams: true });


/**
 * @swagger
 * tags:
 *   name: Message
 *   description: Endpoints for managing messages
 */


/**
 * @swagger
 * /contact/{contactId}/conversation/{conversationId}/message:
 *   get:
 *     summary: Retrieve all messages in a conversation
 *     tags:
 *       - Message
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
 *         name: before
 *         schema:
 *           type: integer
 *         required: false
 *         description: Retrieve messages sent before the given message `id`
 *       - in: query
 *         name: after
 *         schema:
 *           type: integer
 *         required: false
 *         description: Retrieve messages sent after the given message `id`
 *     responses:
 *       200:
 *         description: Successfully retrieved messages with conversation metadata
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
 *                     meta:
 *                       type: object
 *                       properties:
 *                         labels:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: []
 *                         additional_attributes:
 *                           type: object
 *                           additionalProperties: true
 *                         contact:
 *                           type: object
 *                           properties:
 *                             additional_attributes:
 *                               type: object
 *                               additionalProperties: true
 *                             custom_attributes:
 *                               type: object
 *                               additionalProperties: true
 *                             email:
 *                               type: string
 *                               example: "string"
 *                             id:
 *                               type: integer
 *                               example: "integer"
 *                             identifier:
 *                               type: string
 *                               nullable: true
 *                             name:
 *                               type: string
 *                               example: "string"
 *                             phone_number:
 *                               type: string
 *                               example: "string"
 *                             thumbnail:
 *                               type: string
 *                               example: "string"
 *                             blocked:
 *                               type: boolean
 *                               example: "boolean"
 *                             type:
 *                               type: string
 *                               example: "string"
 *                         assignee:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: "integer"
 *                             name:
 *                               type: string
 *                               example: "string"
 *                             available_name:
 *                               type: string
 *                               example: "string"
 *                             avatar_url:
 *                               type: string
 *                               example: "string"
 *                             type:
 *                               type: string
 *                               example: "string"
 *                             availability_status:
 *                               type: string
 *                               example: "string"
 *                             thumbnail:
 *                               type: string
 *                               example: "string"
 *                         agent_last_seen_at:
 *                           type: string
 *                           format: date-time
 *                           example: "date-time"
 *                         assignee_last_seen_at:
 *                           type: string
 *                           nullable: true
 *                           example: "string"
 *                     payload:
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
 *                           inbox_id:
 *                             type: integer
 *                             example: "integer"
 *                           conversation_id:
 *                             type: integer
 *                             example: "integer"
 *                           message_type:
 *                             type: integer
 *                             example: "integer"
 *                           content_type:
 *                             type: string
 *                             example: "string"
 *                           status:
 *                             type: string
 *                             example: "string"
 *                           content_attributes:
 *                             type: object
 *                             additionalProperties: true
 *                           created_at:
 *                             type: integer
 *                             example: "integer"
 *                           private:
 *                             type: boolean
 *                             example: "boolean"
 *                           source_id:
 *                             type: string
 *                             nullable: true
 *                             example: "string"
 *                           sender:
 *                             type: object
 *                             properties:
 *                               additional_attributes:
 *                                 type: object
 *                                 additionalProperties: true
 *                               custom_attributes:
 *                                 type: object
 *                                 additionalProperties: true
 *                               email:
 *                                 type: string
 *                                 example: "string"
 *                               id:
 *                                 type: integer
 *                                 example: "integer"
 *                               identifier:
 *                                 type: string
 *                                 nullable: true
 *                                 example: "string"
 *                               name:
 *                                 type: string
 *                                 example: "string"
 *                               phone_number:
 *                                 type: string
 *                                 example: "string"
 *                               thumbnail:
 *                                 type: string
 *                                 example: "string"
 *                               blocked:
 *                                 type: boolean
 *                                 example: "boolean"
 *                               type:
 *                                 type: string
 *                                 example: "string"
 *       400:
 *         description: Invalid contactId or conversationId
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
 *                   example: Invalid parameters
 *       404:
 *         description: Conversation not found or no messages available
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
 *                   example: Not found
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
 *                   example: Unexpected server error
 *       503:
 *         description: Service unavailable
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
 *                   example: Service temporarily unavailable
 */


router.get("/",
    isParamContactIdCorrect,
    isParamConversationIdCorrect,
    handleValidationErrors,
    getAllMessage);


    /**
 * @swagger
 * /contact/{contactId}/conversation/{conversationId}/message:
 *   post:
 *     summary: Send a message with optional file attachments (max 3 files, total ≤ 20MB)
 *     tags:
 *       - Message
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
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The text content of the message
 *               filesPath:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 3
 *                 description: Up to 3 file attachments, total size ≤ 20MB
 *     responses:
 *       200:
 *         description: Message sent successfully
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
 *                     content:
 *                       type: string
 *                       example: "string"
 *                     message_type:
 *                       type: integer
 *                       example: "integer"
 *                     content_type:
 *                       type: string
 *                       example: "string"
 *                     content_attributes:
 *                       type: object
 *                     created_at:
 *                       type: integer
 *                       example: "integer"
 *                     conversation_id:
 *                       type: integer
 *                       example: "integer"
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: "integer"
 *                           message_id:
 *                             type: integer
 *                             example: "integer"
 *                           file_type:
 *                             type: string
 *                             example: "string"
 *                           account_id:
 *                             type: integer
 *                             example: "integer"
 *                           extension:
 *                             type: string
 *                             nullable: true
 *                           data_url:
 *                             type: string
 *                             example: "string"
 *                           thumb_url:
 *                             type: string
 *                             example: "string"
 *                           file_size:
 *                             type: integer
 *                             example: "integer"
 *                           width:
 *                             type: integer
 *                             nullable: "integer"
 *                           height:
 *                             type: integer
 *                             nullable: "integer"
 *                     sender:
 *                       type: object
 *                       properties:
 *                         additional_attributes:
 *                           type: object
 *                         custom_attributes:
 *                           type: object
 *                         email:
 *                           type: string
 *                           example: "string"
 *                         id:
 *                           type: integer
 *                           example: "integer"
 *                         identifier:
 *                           type: string
 *                           nullable: true
 *                         name:
 *                           type: string
 *                           example: "string"
 *                         phone_number:
 *                           type: string
 *                           example: "string"
 *                         thumbnail:
 *                           type: string
 *                           example: "string"
 *                         blocked:
 *                           type: boolean
 *                           example: "boolean"
 *                         type:
 *                           type: string
 *                           example: "string"
*       400:
 *         description: Invalid input or validation errors
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
 *                   example: "The 'content' field is required."
 *                 errors:
 *                   type: object
 *                   example:
 *                     content: ["Content field must not be empty."]
 *       413:
 *         description: Payload too large – Total file size exceeds 20MB
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
 *                   example: "Total file size exceeds the 20MB limit."
 *       415:
 *         description: Unsupported media type – Expected multipart/form-data
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
 *                   example: "Unsupported media type. Please use multipart/form-data."
 *       500:
 *         description: Internal server error – Unexpected processing failure
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
 *                   example: "An unexpected error occurred while processing the message."
 */



router.post("/",
    upload.array('filesPath', 3),
    isParamContactIdCorrect,
    isParamConversationIdCorrect,
    multerErrorHandler, // intercepte les erreurs Multer
    handleValidationErrors,
    sendMessage);

// router.patch("/:messageId", updateMessage);


/**
 * @swagger
 * /conversation/{conversationId}/message/{messageId}:
 *   delete:
 *     summary: Delete a message from a conversation
 *     tags:
 *       - Message
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The `id` of the conversation
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The `id` of the message to delete
 *     responses:
 *       200:
 *         description: Message successfully deleted
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
 *                     content:
 *                       type: string
 *                       example: This message was deleted
 *                     inbox_id:
 *                       type: integer
 *                       example: integer
 *                     conversation_id:
 *                       type: integer
 *                       example: integer
 *                     message_type:
 *                       type: integer
 *                       example: integer
 *                     content_type:
 *                       type: string
 *                       example: string
 *                     status:
 *                       type: string
 *                       example: string
 *                     content_attributes:
 *                       type: object
 *                       example:
 *                         deleted: true
 *                     created_at:
 *                       type: integer
 *                       example: integer
 *                     private:
 *                       type: boolean
 *                       example: boolean
 *                     source_id:
 *                       type: string
 *                       nullable: true
 *                       example: string
 *                     sender:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: integer
 *                         name:
 *                           type: string
 *                           example: string
 *                         available_name:
 *                           type: string
 *                           example: string
 *                         avatar_url:
 *                           type: string
 *                           example: string
 *                         type:
 *                           type: string
 *                           example: string
 *                         availability_status:
 *                           type: string
 *                           example: string
 *                         thumbnail:
 *                           type: string
 *                           example: string
 *       400:
 *         description: Bad Request – One or more parameters are missing or invalid
 *         content:
 *           application/json:
 *             example:
 *               status: "error"
 *               message: "Invalid conversationId or messageId"
 *       404:
 *         description: Not Found – The specified message could not be located
 *         content:
 *           application/json:
 *             example:
 *               status: "error"
 *               message: "Message not found"
 *       500:
 *         description: Internal Server Error – The server encountered an unexpected condition
 *         content:
 *           application/json:
 *             example:
 *               status: "error"
 *               message: "An unexpected error occurred while deleting the message"
 */

router.delete("/:messageId",
    isParamConversationIdCorrect,
    isParamMessageIdCorrect,
    handleValidationErrors,
    deleteMessage);



export default router;