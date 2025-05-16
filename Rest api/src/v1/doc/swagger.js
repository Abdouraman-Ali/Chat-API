import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basic Meta Informations about our API
const options = {
  definition: {
    openapi: "3.0.0",
     info: {
      title: "Instant Messaging API",
      version: "1.0.0",
      description: "Messaging REST API Documentation",
    },
    
    servers: [{
      url:"http://localhost:4000/api/v1"
    }],

  },

  apis: [
    path.join(__dirname, "../router/*.js"),          
    path.join(__dirname, "../../chatwoot/*.js")
  ],
};

// Docs in JSON format
const swaggerSpec = swaggerJSDoc(options);



// console.log("📄 Contenu SwaggerSpec généré :");
// console.dir(swaggerSpec.paths, { depth: null });

// console.log("✅ SwaggerSpec généré avec les routes suivantes :");
// Object.keys(swaggerSpec.paths).forEach((path) => {
//   console.log(`- ${path}`);
// });



// Function to setup our docs

const swaggerDocs = (app, port) => {

  // Route-Handler to visit our docs
  app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Make our docs in JSON format available
  app.get("/api/v1/docs.json", (req, res) => {

    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);

  });

  console.log( `Version 1 Docs 📘 are available on http://localhost:${port}/api/v1/docs` );
};

export {
    swaggerDocs
};