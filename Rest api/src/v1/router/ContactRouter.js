import express from 'express';
import Middleware from '../../middleware/middleware.js';
import Controller from '../../controller/ContactController.js'
import ConversationRouter from '../../v1/router/ConversationRouter.js'

const router = express.Router({ mergeParams: true });
const {isBodyCreateContactCorrect, isParamContactIdCorrect, handleValidationErrors} = Middleware;

console.log("📘 Swagger chargé pour ContactRouter");


// documentaion swagger


/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Endpoints for managing contacts
 */


/**
 * @swagger
 * /contact/{contactId}:
 *   get:
 *     summary: Retrieve a specific contact by ID
 *     tags: [Contact]
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description:  This is the value of the `source_id` obtained when creating the contact
 *     responses:
 *       200:
 *         description: Successful retrieval of the contact information
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
 *                     source_id:
 *                       type: string
 *                       example: "uuid"
 *                     pubsub_token:
 *                       type: string
 *                       example: "string"
 *                     id:
 *                       type: integer
 *                       example: "integer"
 *                     name:
 *                       type: string
 *                       example: "string"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "string"
 *                     phone_number:
 *                       type: string
 *                       example: "string"
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "FAILED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: integer
 *                           example: 404
 *                         error:
 *                           type: string
 *                           example: "Not Found"
 */


router.get("/:contactId",
    isParamContactIdCorrect, 
    handleValidationErrors, 
    Controller.getContact)      //contactId = source_id of the contact obtained on contact create




/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Create a new contact
 *     tags: [Contact]
 *     requestBody:
 *       required:  true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone_number
 *             properties:
 *               name:
 *                 type: string
 *                 description: The full name of the contact (required).
 *                 example: Jone Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: A valid email address for the contact (required).
 *                 example: JoneDoe01@gmail.com
 *               phone_number:
 *                 type: string
 *                 description: Contact's phone number in E.164 format (required).
 *                 example: "+237696778801"
 *
 *     responses:
 *       201:
 *         description: Contact created successfully
 *         content:
 *           application/json:
 *             example:
 *               status: OK
 *               data:
 *                 source_id: "uuid"
 *                 pubsub_token: "string"
 *                 id: "integer"
 *                 name: "string"
 *                 email: "string"
 *                 phone_number: "string"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             example:
 *               status: FAILED
 *               data:
 *                 error:
 *                   status: 400
 *                   error: Bad Request
 */


router.post("/", 
    isBodyCreateContactCorrect, 
    handleValidationErrors, 
    Controller.createContact);


/**
 * @swagger
 * /contact/{contactId}:
 *   patch:
 *     summary: Update an existing contact
 *     tags:
 *       - Contact
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: This is the value of the `source_id` obtained when creating the contact
*     requestBody:
 *       required:  true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone_number
 *             properties:
 *               name:
 *                 type: string
 *                 description: The full name of the contact (required).
 *                 example: Jone Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: A valid email address for the contact (required).
 *                 example: JoneDoe01@gmail.com
 *               phone_number:
 *                 type: string
 *                 description: Contact's phone number in E.164 format (required).
 *                 example: "+237696778801"
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *         content:
 *           application/json:
 *             example:
 *               status: OK
 *               data:
 *                 source_id: "uuid"
 *                 pubsub_token: "string"
 *                 id: "integer"
 *                 name: "Jone Doe"
 *                 email: "JoneDoe01@gmail.com"
 *                 phone_number: "+237696778801"
 *       400:
 *         description: Bad Request – Validation error
 *         content:
 *           application/json:
 *             example:
 *               status: FAILED
 *               data:
 *                 error:
 *                   status: 400
 *                   error: Invalid input data
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             example:
 *               status: FAILED
 *               data:
 *                 error:
 *                   status: 404
 *                   error: Not Found
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 */


router.patch("/:contactId", 
    isParamContactIdCorrect, 
    isBodyCreateContactCorrect, 
    handleValidationErrors, 
    Controller.updateContact );


/**
 * @swagger
 * /contact/{contactId}:
 *   delete:
 *     summary: Delete an existing contact
 *     tags:
 *       - Contact
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The `id` value obtained when the contact was created
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               status: OK
 *               data:
 *                 message: Contact deleted
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             example:
 *               status: FAILED
 *               data:
 *                 error:
 *                   status: 404
 *                   error: Not Found
 *       400:
 *         description: Invalid `contactId` parameter
 *         content:
 *           application/json:
 *             example:
 *               status: FAILED
 *               data:
 *                 error:
 *                   status: 400
 *                   error: Invalid contactId
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 */



router.delete("/:contactId",
    isParamContactIdCorrect,
    handleValidationErrors,
    Controller.deleteContact);    // contactId = id of the contact obtained on contact create


router.use("/:contactId/conversation", ConversationRouter);



export default router;