import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const queueFilePath = path.join(__dirname, "messageQueue.json");
const clientConnectionsFilePath = path.join(__dirname, "clientConnections.json");
const clientMessageQueueFilePath = path.join(__dirname, "clientMessageQueue.json");

// Sauvegarder la file d'attente dans un fichier (en tant que tableau)
function saveQueueToFile(queue) {
    try {
        if (!Array.isArray(queue)) {
            throw new Error("Invalid data type. Expected an array.");
        }

        fs.writeFileSync(queueFilePath, JSON.stringify(queue, null, 2));
        console.log("Message queue saved to file.");
    } catch (error) {
        console.error("Failed to save message queue to file:", error.message);
    }
}


// Restaurer la file d'attente depuis un fichier (en tant que tableau)
function loadQueueFromFile() {
    try {
        // console.log("loading Queue from ", queueFilePath)
        console.log("loading Queue start .... ")
        if (fs.existsSync(queueFilePath)) {
            const data = fs.readFileSync(queueFilePath, "utf8");
            const restoredQueue = JSON.parse(data);

            if (!Array.isArray(restoredQueue)) {
                console.error("Invalid data format in queue file. Expected an array.");
                return [];
            }

            console.log("Message queue restored.", restoredQueue);
            console.log("loading Queue finish .... ")

            return restoredQueue;
        }
        else
        {
            console.log("File does not exist:", queueFilePath)
        }
    } catch (error) {
        console.error("Failed to load message queue from file:", error.message);
    }
    console.log("loading Queue finish .... ")
    return []; // Retourner un tableau vide si le fichier n'existe pas ou en cas d'erreur

}


// Sauvegarder les connexions des clients réguliers dans un fichier
function saveClientConnectionsToFile(clientConnections) {
    try {
        // const connectionsArray = Array.from(clientConnections.entries());
        fs.writeFileSync(clientConnectionsFilePath, JSON.stringify([...clientConnections.entries()], null, 2));
        console.log("Client connections saved to file.");
    } catch (error) {
        console.error("Failed to save client connections to file:", error.message);
    }
}


// Restaurer les connexions des clients réguliers depuis un fichier
function loadClientConnectionsFromFile() {
    try {
        
        console.log("loading connexion start ....")
        if (fs.existsSync(clientConnectionsFilePath)) {
            const data = fs.readFileSync(clientConnectionsFilePath, "utf8");
            const parsedData = JSON.parse(data);
            const restoredConnections = Array.isArray(parsedData) ? new Map(parsedData) : new Map(Object.entries(parsedData));

            // console.log("Client connections restored from file.", restoredConnections);
            console.log("loading finish ...")

            return restoredConnections;
        }
        else
        {
            console.log("File does not exist:", clientConnectionsFilePath)
        }
    } catch (error) {
        console.error("Failed to load client connections from file:", error.message);
    }

    console.log("loading finish ...")
    return new Map(); // Retourner une Map vide si le fichier n'existe pas ou en cas d'erreur
}

 
function overwriteClientMessageQueueFile(queue) {
    try {
        fs.writeFileSync(clientMessageQueueFilePath, JSON.stringify([...queue.entries()], null, 2));
        console.log("Client message queue overwritten in file successfully.");
    } catch (error) {
        console.error("Failed to overwrite client message queue file:", error.message);
    }
}


function appendToClientMessageQueueFile(newQueue) {
    try {
      let existingQueue = new Map();
  
      // Lire le fichier existant s'il existe
      if (fs.existsSync(clientMessageQueueFilePath)) {
        const rawData = fs.readFileSync(clientMessageQueueFilePath, 'utf8');
        const parsedData = JSON.parse(rawData);
        existingQueue = Array.isArray(parsedData) ? new Map(parsedData) : new Map(Object.entries(parsedData));
      }
  
      // Fusionner les files d’attente pour chaque pubsub_token
      for (const [token, messages] of newQueue) {
        if (!existingQueue.has(token)) {
          existingQueue.set(token, []);
        }
  
        // Ajouter tous les nouveaux messages à la suite
        existingQueue.get(token).push(...messages);
      }
  
      // Écriture finale
      fs.writeFileSync(clientMessageQueueFilePath, JSON.stringify([...existingQueue.entries()], null, 2));
  
      console.log("Client message queue appended to file successfully.");
    } catch (error) {
      console.error("Failed to append client message queue to file:", error.message);
    }
}

 
// Restaurer les messages en attente pour les clients réguliers
function loadClientMessageQueueFromFile() {
    try {
        // console.log("Loading queue from:", clientMessageQueueFilePath);

        console.log("Loading queue start ....");
        if (fs.existsSync(clientMessageQueueFilePath)) {
            const data = fs.readFileSync(clientMessageQueueFilePath, "utf8");
            const parsedData = JSON.parse(data);
            const restoredQueue = Array.isArray(parsedData) ? new Map(parsedData) : new Map(Object.entries(parsedData));
            // console.log("Client message queue restored from file.", restoredQueue);
            console.log("Loading queue finish ....");
            return restoredQueue;
        }
        else
        {
            console.log("File does not exist:", clientMessageQueueFilePath)
        }
    } catch (error) {
        console.error("Failed to load client message queue from file:", error.message);
    }

    console.log("Loading queue finish ....");
    return new Map(); // Retourner une Map vide si le fichier n'existe pas ou en cas d'erreur
}


export default {
    saveQueueToFile,
    loadQueueFromFile,
    saveClientConnectionsToFile,
    loadClientConnectionsFromFile,
    appendToClientMessageQueueFile,
    loadClientMessageQueueFromFile,
    overwriteClientMessageQueueFile
}