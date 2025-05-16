import WebSocket from "ws"; 
import service from "../database/service.js";

const { saveQueueToFile, loadQueueFromFile } = service


// ws client pour se connecter à Server2 (Chatwoot)
const chatwootServerUrl = "wss://app.chatwoot.com/cable"; 

// ws client pour se connecter à Server1 (localServer)
const localServerUrl = "ws://localhost:8081/bridge"; 
let localServerClient;
let retryCountLocal = 0;
const maxRetriesLocal = 10;


let chatwootConnections = new Map(); // Stocker les connexions par pubsub_token

let isReconnecting = false; // Verrou global pour éviter les tentatives multiples
let hasReachedMaxRetries = false; // Drapeau pour arrêter les tentatives après maxRetriesLocal

let messageQueue = loadQueueFromFile();
// console.log("messageQueue",messageQueue)

// Initialiser le pont
initializeBridge();
    

async function connectToLocalServer() {

    if (hasReachedMaxRetries) {
        console.warn("No more reconnection attempts will be made. Maximum retries reached.");
        return; // Arrêter toute nouvelle tentative
    }

    if (retryCountLocal >= maxRetriesLocal) {
        console.error("Maximum retry attempts reached for local server.");
        hasReachedMaxRetries = true; // Activer le drapeau pour arrêter les tentatives
        return;
        
    }

    if (isReconnecting) {
        console.warn("Reconnection already in progress. Skipping this attempt.");
        return; // Éviter les tentatives multiples
    }

    isReconnecting = true; // Activer le verrou

    const retryDelay = Math.min(5000 * Math.pow(2, retryCountLocal), 30000); // Délai progressif jusqu'à 60 secondes
    console.log(`Attempting to connect to the local server at ${localServerUrl}...`);
    retryCountLocal++;

    try {

        localServerClient = new WebSocket(localServerUrl);

        await new Promise((resolve, reject) => {

            localServerClient.on("open", () => {
                console.log("Connection to local server successful.");
                retryCountLocal = 0; // Réinitialiser le compteur en cas de succès
                isReconnecting = false; // Libérer le verrou
                hasReachedMaxRetries = false; // Réinitialiser le drapeau

                // console.log("Nombre d'object dans la file d'attente : ",messageQueue.length);

                while (messageQueue.length > 0) 
                {
                    const message = messageQueue.shift(); // Récupérer le premier message de la file d'attente

                    const success = sendToLocalServer(message);
                    if (!success) {
                        console.error("Failed to send message from queue. Re-adding to queue:", message);
                        messageQueue.push(message);         // Réajouter à la file d'attente si l'envoi échoue
                    } else {
                        console.log("Message sent successfully.");
                    } 
                    
                    saveQueueToFile(messageQueue); // Sauvegarder la file d'attente après avoir retiré un message

                }
                resolve();
            });


            localServerClient.on("message", async (message) =>  {

                try {
                    
                    let payload;
                    try {
                      payload = JSON.parse(message);
                    } catch (err) {
                      console.error("JSON.parse erreurs:", err, "| event:", message);
                      return;
                    }

                    console.log(payload);

                    switch (payload.event_type) {

                        case "validate_token":
                        {
                            const pubsub_token = payload.pubsub_token;
                            console.log("Received token validation request from server:", pubsub_token);

                            // Valider le token avec Chatwoot
                            const isValid = await validateWithTimeout(pubsub_token);
                            // const isValid = await validateTokenWithChatwoot(pubsub_token);
                            
                            console.log("isValid response from chatwoot" , isValid);
                            // Envoyer la réponse au serveur
                            localServerClient.send(
                                JSON.stringify({
                                    event_type: "validate_token_response",
                                    data:{
                                        pubsub_token,
                                        isValid,
                                    }
                                })
                            );

                            break;
                        }
                        case "connection" : 
                        {
                            console.log(payload.message);
                            break;
                        }
                        default:
                        {
                            console.log("Unknown event receive from LocalHostServer", payload);
                            break;
                        }
                            

                    }

                   
                } catch (error) {
                    console.error("Error processing message from server:", error.message);
                }

            });

            localServerClient.on("error", (err) => {
                console.error("Error connecting to local server:", err.message);
                isReconnecting = false; // Libérer le verrou en cas d'erreur
                reject(err);
            });

            localServerClient.on("close", (code, reason) => {
                console.warn(`Connection to the local server closed. Code: ${code}, Reason: ${reason}`);
                isReconnecting = false; // Libérer le verrou en cas de fermeture
                setTimeout(() => {
                    console.log("Retrying connection to the local server...");
                    connectToLocalServer().catch((err) => {
                        console.error("Retry failed:", err.message);
                    });
                }, retryDelay); // Reconnexion après 5 secondes
                // disconnectFromChatwootServer(); // Fermer le serveur distant si le serveur local est fermé
            });

            // localServerClient.on("close", (code, reason) => {
            //     console.warn(`Connection to the local server closed. Code: ${code}, Reason: ${reason}`);
            //     disconnectFromChatwootServer(); // Fermer le serveur distant si le serveur local est fermé

            // });
        });
    } catch (err) {
        console.error("Retrying connection to the local server in 5 seconds...");
        isReconnecting = false; // Libérer le verrou en cas d'échec
        await delay(5000); // Attendre 5 secondes avant de réessayer
        return connectToLocalServer();
    }
}


// Fonction pour initialiser les deux connexions
async function initializeBridge() {
    try {
        console.log("Initializing bridge...");

        // Démarrer la connexion au serveur local
        await connectToLocalServer();

        // console.log("Bridge between the two servers established");
    } catch (error) {
        console.error("Error initializing the bridge:", error.message);
        // disconnectFromChatwootServer(); // Fermer le serveur distant en cas d'erreur critique
    }
}


function handleChatwootEvent(ws, pubsub_token, resolve, reject)
{

    if(ws.listenerCount("message") === 0)
    {
        ws.on("message", (event) => {
        
            try {
        
                //  Parsing sécurisé  
                
                let payload;
                try {
                  payload = JSON.parse(event);
                } catch (err) {
                  console.error("JSON.parse erreurs:", err, "| event:", event);
                  return;
                }
        
                switch (payload.type) {
                    case "ping":
                        // console.log("Ping received from Server2.");
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({ type: "pong" }));
                        } else {
                            console.warn("WebSocket is not open. Cannot send message.");
                        }
                        // chatwootSocket.send(JSON.stringify({ type: "pong" }));
                        return;
                    case "welcome":
                        console.log("Welcome message from Chatwoot Server", payload);
                        return;
                    case "confirm_subscription":
                        console.info(`🎉 Subscription confirmed for token: ${pubsub_token}`);
                        chatwootConnections.set(pubsub_token, ws); // Stocker la connexion
                        // console.log("chatwootConnections : ", chatwootConnections)
                        if (resolve) resolve(true); // Résoudre la promesse si nécessaire
                        return;
                    case "reject_subscription":
                        console.error(`🚫 Subscription rejected for token: ${pubsub_token}`);
                        ws.close();
                        if (reject) reject(false); // Rejeter la promesse si nécessaire
                        return;
                    case "disconnect":
                        console.log("Disconnected from Chatwoot Server:", payload);
                        return;
                }
        
                // Vérifier si le message contient un événement
                if (!payload.message || !payload.message.event) {
                    console.error("Invalid message format:", payload);
                    return;
                }
                const eventIdentifier = JSON.parse(payload.identifier);
                const eventName = payload.message.event;
                const eventData = payload.message.data;
    
                
        
        
                switch (eventName) {  
                    
                   
                    case "conversation.created":
                    {
                        const object = {
                            event_source: "bridge",
                            event_type : "conversation_created",
                            pubsub_token: eventIdentifier.pubsub_token,
                            data: {
                                conversation_id : eventData.id,
                                can_reply : eventData.can_reply,
                                channel : eventData.channel,
                                contact_inbox : 
                                {
                                    id: eventData.contact_inbox.id,
                                    contact_id: eventData.contact_inbox.contact_id,
                                    inbox_id: eventData.contact_inbox.inbox_id,
                                    source_id: eventData.contact_inbox.source_id,
                                    pubsub_token: eventData.contact_inbox.pubsub_token
                                },
                                meta:{
                                    sender:{
                                        id: eventData.meta.sender.id,
                                        name: eventData.meta.sender.name,
                                        email: eventData.meta.sender.email,
                                        phone_number: eventData.meta.sender.phone_number,
                                    }
                                },
                                status: eventData.status,
                            }
                        }
        
                        const success = sendToLocalServer(object);

                        if (!success) {
                            console.log("Adding 'conversation.status_changed' event to the queue.");
                            messageQueue.push(object); // Ajouter à la file d'attente
                            saveQueueToFile(messageQueue); // Sauvegarder la file d'attente
                        }
    
                        if (!eventData.id) {
                            console.error("Missing 'id' in eventData:", eventData);
                            return;
                        }

                        break;

                    }
                    case "conversation.updated":{
        
                        const object = {
                            event_source: "bridge",
                            event_type : "conversation_updated",
                            pubsub_token: eventIdentifier.pubsub_token,
                            data: {
                               conversation_id : eventData.id,
                               message:{
                                id: eventData.message.id,
                                content: eventData.message.content,
                                message_type: eventData.message.message_type,
                                status: eventData.message.status,
                                content_type: eventData.message.content_type,
                               },
                               status: eventData.status,
                            }
                        }
        
                        const success = sendToLocalServer(object);
    
                        if (!success) {
                            // Rechercher et remplacer l'événement dans la file d'attente
                            const index = messageQueue.findIndex(
                                (conversation) =>
                                conversation.event_type === "message_updated" &&
                                conversation.data.conversation_id === object.data.conversation_id
                            );
    
                            if (index !== -1) {
                                console.log("Replacing existing 'message.updated' event in the queue.");
                                messageQueue[index] = object; // Remplacer l'événement existant
                            } else {
                                console.log("Adding new 'message.updated' event to the queue.");
                                messageQueue.push(object); // Ajouter l'événement s'il n'existe pas
                            }
    
                            saveQueueToFile(messageQueue); // Sauvegarder la file d'attente
                        }
    
                        if (!eventData.id) {
                            console.error("Missing 'id' in eventData:", eventData);
                            return;
                        }
                        break;
                    }
                    case "conversation.status_changed":
                    {
        
                        const object = {
                            event_source: "bridge",
                            event_type : "conversation_status_changed",
                            pubsub_token: eventIdentifier.pubsub_token,
                            data: {
                                conversation_id : eventData.id,
                                status: eventData.status,
                            }
                        }
        
                        const success = sendToLocalServer(object);
                        if(!success)
                        {
                            messageQueue.push(object)     // ajouter a la file d'attente
                            saveQueueToFile(messageQueue); // Sauvegarder la file d'attente
                            console.log("Message add to the queue ");
    
                        }
    
                        if (!eventData.id) {
                            console.error("Missing 'id' in eventData:", eventData);
                            return;
                        }
                        break;
                    }
                    case "message.created":
                    {
        
        
                        const object = {
                            event_source: "bridge",
                            event_type : "message_created",
                            pubsub_token: eventIdentifier.pubsub_token,
                            data: {
                                id : eventData.id,
                                content : eventData.content,
                                conversation_id : eventData.conversation_id,
                                message_type : eventData.message_type,
                                status : eventData.status,
                                content_type : eventData.content_type,
                                sender_type : eventData.sender_type,
                                attachments: eventData.attachments,
                                sender:{
                                    name: eventData.sender.name,
                                    availability_status: eventData.sender.availability_status,
                                }
                            }
                        }

                        // console.log("Message Created with medias : ", payload)
        
                        const success = sendToLocalServer(object);
    
                        if (!success) {
                            console.log("Adding 'message.created' event to the queue.");
                            messageQueue.push(object); // Ajouter à la file d'attente
                            saveQueueToFile(messageQueue); // Sauvegarder la file d'attente
                        }
    
                        if (!eventData.id) {
                            console.error("Missing 'id' in eventData:", eventData);
                            return;
                        }
    
                        break;
                    }
                    case "message.updated":
                    {
                        const object = {
                            event_source: "bridge",
                            event_type : "message_updated",
                            pubsub_token: eventIdentifier.pubsub_token,
                            data: {
                                conversation_id : eventData.conversation_id,
                                message_id : eventData.id,
                                content_attributes : eventData.content_attributes,
                                content_type : eventData.content_type,
                                message_type : eventData.message_type,
                                account_id : eventData.account_id,
                                inbox_id : eventData.inbox_id,
                                private : eventData.private,
                                status : eventData.status,
                                sender:{
                                    name: eventData.sender.name,
                                    availability_status: eventData.sender.availability_status,
                                },
                                previous_changes:{
                                    content: eventData.previous_changes.content,
                                }
        
                            }
        
                        }
        
                        const success = sendToLocalServer(object);
    
                        if (!success) {
                            // Rechercher et remplacer l'événement dans la file d'attente
                            const index = messageQueue.findIndex(
                                (msg) =>
                                    msg.event_type === "message_updated" &&
                                    msg.data.message_id === object.data.message_id
                            );
    
                            if (index !== -1) {
                                console.log("Replacing existing 'message.updated' event in the queue.");
                                messageQueue[index] = object; // Remplacer l'événement existant
                            } else {
                                console.log("Adding new 'message.updated' event to the queue.");
                                messageQueue.push(object); // Ajouter l'événement s'il n'existe pas
                            }
    
                            saveQueueToFile(messageQueue); // Sauvegarder la file d'attente
                        }
    
                        if (!eventData.id) {
                            console.error("Missing 'id' in eventData:", eventData);
                            return;
                        }
                        break;
    
                    }
                    case "conversation.typing_on":
                    {
                        const object = {
                            event_source: "bridge",
                            event_type : "typing_on",
                            pubsub_token: eventIdentifier.pubsub_token,
                            data: {
                                can_reply : eventData.conversation.can_reply,
                                conversation_id : eventData.conversation.id,
                                status : eventData.conversation.status,
                                is_private : eventData.is_private,
                                performer:{
                                    name: eventData.performer.name,
                                    availability_status: eventData.performer.availability_status,
                                }
                            }
                        }
        
                        const success = sendToLocalServer(object);
                        break;
                    }
                    case "conversation.typing_off":
                    {
                        const object = {
                            event_source: "bridge",
                            event_type : "typing_off",
                            pubsub_token: eventIdentifier.pubsub_token,
                            data: {
                                can_reply : eventData.conversation.can_reply,
                                conversation_id : eventData.conversation.id,
                                status : eventData.conversation.status,
                                is_private : eventData.is_private,
                                performer :{
                                    name: eventData.performer.name,
                                    availability_status: eventData.performer.availability_status,
                                }
                            }
                        }
        
                        const success = sendToLocalServer(object);
                        break;
                    }
                    case "presence.update":
                    {
                        const object = {
                            event_source: "bridge",
                            pubsub_token: eventIdentifier.pubsub_token,
                            event_type : "presence_Update",
                            data: eventData.users
                        };
                        
                        console.log(object)
                        const success = sendToLocalServer(object);
    
                        break;
                    }
                    default:
                    {
                        console.log("Unknown event type:", payload.message.event);
                        break;
                    }
                }
        
            } catch (error) {
                console.error(`Error processing message for token ${pubsub_token}:`, error.message);
                if (reject) reject(error); // Rejeter la promesse en cas d'erreur
            }
        
        })
    }
   
     // Gestion de la fermeture de la connexion
    if(ws.listenerCount("close") === 0)
    {
        ws.on("close", () => {
            console.log(`Chatwoot connection closed for token: ${pubsub_token}`);
            // chatwootConnections.delete(pubsub_token); // Supprimer la connexion
            reauthenticateDisconnectedTokens(pubsub_token); // Réauthentifier les tokens déconnectés
        });
    }
   
    // Gestion des erreurs
    if(ws.listenerCount("error") === 0)
    {
        ws.on("error", (err) => {
            console.error(`Error on Chatwoot connection for token ${pubsub_token}:`, err.message);
            if (reject) reject(err); // Rejeter la promesse en cas d'erreur
        });
    }
    

}


function sendToLocalServer(object) {
    if (localServerClient && localServerClient.readyState === WebSocket.OPEN) {
        try {
            console.log("Sending data to local server : ", object);
            localServerClient.send(JSON.stringify(object));
            return true; // Envoi réussi
        } catch (error) {
            console.error("Error sending data to local server:", error.message);
            return false; // Envoi échoué
        }
    } else {
        console.warn("Connection to localServer is not open.");
        return false; // Envoi échoué
    }
}


function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function validateTokenWithChatwoot(pubSubToken) {
    return new Promise((resolve, reject) => {
        // Vérifier si une connexion existe déjà pour ce token
        if (chatwootConnections.has(pubSubToken)) {
            console.log(`Connection already exists for token: ${pubSubToken}`);

            const existingSocket = chatwootConnections.get(pubSubToken);

            // Attacher les gestionnaires d'événements à la connexion existante
            handleChatwootEvent(existingSocket, pubSubToken, resolve, reject);

            resolve(true);
            return;
        }

        // Créer une nouvelle connexion pour ce token
        const chatwootSocket = new WebSocket(chatwootServerUrl);

        // Ajouter immédiatement la connexion à la Map
        // chatwootConnections.set(pubSubToken, chatwootSocket);

        chatwootSocket.on("open", () => {
            console.log(`Connected to Chatwoot for token: ${pubSubToken}`);

            const Identifier = JSON.stringify({
                channel: "RoomChannel",
                pubsub_token: pubSubToken,
            });

            const subscribeMsg = {
                command: "subscribe",
                identifier: Identifier,
            };

            chatwootSocket.send(JSON.stringify(subscribeMsg));
        });

        // console.log("Chatwoot connexion", chatwootConnections);

        // Utiliser handleChatwootEvent pour gérer les événements
        handleChatwootEvent(chatwootSocket, pubSubToken, resolve, reject);

        
    });
}

// Fonction pour réauthentifier les tokens déconnectés
async function reauthenticateDisconnectedTokens(pubSubToken) {  
    if (chatwootConnections.has(pubSubToken)) {
        const chatwootSocket = chatwootConnections.get(pubSubToken);
        if (chatwootSocket.readyState === WebSocket.CLOSED) {
            console.log(`Reauthenticating token: ${pubSubToken}`);
            await validateTokenWithChatwoot(pubSubToken);
        }
    } else {
        console.warn(`No connection found for token: ${pubSubToken}`);
    }
}


function timeoutPromise(ms) {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(`⏱️ Timeout après ${ms}ms sans réponse de Chatwoot.`));
        }, ms);
    });
}

async function validateWithTimeout(pubsub_token) {
    try {
        const isValid = await Promise.race([
            validateTokenWithChatwoot(pubsub_token),
            timeoutPromise(5000) // ⏱️ Timeout après 5 secondes
        ]);

        // Si la réponse est reçue à temps
        return isValid;
    } catch (err) {
        console.error("❌ Erreur de validation (ou timeout) :", err.message);
        // ⚠️ Action à effectuer en cas d'absence de réponse
        return false;
    }
}






