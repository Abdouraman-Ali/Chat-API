import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path:  path.join(__dirname, "../.env")  });


import express from 'express';
import ContactRouter from './v1/router/ContactRouter.js';
import ConversationRouter from './v1/router/ConversationRouter.js';
import { swaggerDocs as V1SwaggerDocs } from"./v1/doc/swagger.js";


// console.log("PORT", process.env.PORT)
// console.log("ACCOUNT_ID", process.env.ACCOUNT_ID)
// console.log("API_ACCESS_TOKEN", process.env.API_ACCESS_TOKEN)

const app = express();
const PORT = process.env.PORT || 3000;

app
    .use(express.json())
    .use(express.urlencoded({ extended: true }))

    .use("/api/v1/contact", ContactRouter)
    .use("/api/v1/conversation", ConversationRouter)

    .listen(PORT, () => {
        console.log(`============ API Gateway is open at ${PORT} ============= `);
        V1SwaggerDocs(app, PORT);
    })

