
/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - status
 *         - data
 *       properties:
 *         status:
 *           type: string
 *           description: Status of the API response
 *           example: "OK"
 *         data:
 *           type: object
 *           description: Contact details object
 *           properties:
 *             source_id:
 *               type: string
 *               format: uuid
 *               description: Unique identifier (source_id) of the contact
 *               example: "1e6eef01-1ad5-49c4-bc35-c671c4a34c24"
 *             pubsub_token:
 *               type: string
 *               description: PubSub token associated with the contact
 *               example: "swcuJero6AVfUganMePZTL2S"
 *             id:
 *               type: integer
 *               description: Internal numeric ID of the contact
 *               example: 321244984
 *             name:
 *               type: string
 *               description: Name of the contact
 *               example: "Jhone Alexis"
 *             email:
 *               type: string
 *               format: email
 *               description: Email address of the contact
 *               example: "Jhone01@gmail.com"
 *             phone_number:
 *               type: string
 *               description: Contact's phone number
 *               example: "+237666778801"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ContactInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phone_number
 *       properties:
 *         name:
 *           type: string
 *           description: The full name of the contact.
 *           example: Sabrine
 *         email:
 *           type: string
 *           format: email
 *           description: A valid email address.
 *           example: sabrine1@gmail.com
 *         phone_number:
 *           type: string
 *           description: Phone number in E.164 format.
 *           example: "+23566778801"
 */
