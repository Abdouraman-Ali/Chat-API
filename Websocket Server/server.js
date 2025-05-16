import { WebSocketServer } from "ws";
// import WebSocket from "ws"; // Pour agir comme un client WebSocket

import apiCall from "./services/apiCall.js";
import service from "./database/service.js";
// import fs from "fs";

const webSocketServer = new WebSocketServer({ port: 8081 });


let clientConnections = service.loadClientConnectionsFromFile(); // Charger les connexions au démarrage
let clientMessageQueue = service.loadClientMessageQueueFromFile(); // Charger les messages en attente au démarrage

// console.log("clientConnections : ", clientConnections);
// console.log("clientMessageQueue : ", clientMessageQueue);

let activeConnections = 0;


webSocketServer.on("connection", (ws, req) => {

  const path = req.url; // Récupérer le chemin de la requête

  const welcome = {
    event_type: 'connection',
    message: 'Connection established'

  }

  if (path === "/bridge") 
  {
    console.log("Bridge client connected.");
    ws.isBridge = true; // Marquer cette connexion comme étant le bridge
    ws.send(JSON.stringify(welcome));
    handleBridgeMessages(ws);

    // Réauthentifier tous les clients réguliers encore connectés
    reauthenticateRegularClients();

  } else {
    console.log("Regular client connected.");
    activeConnections++;
    console.log(`Active connections: ${activeConnections}`);
    ws.send(JSON.stringify(welcome));
    handleRegularClientMessages(ws);
  }




  ws.on("close", () => {

    if(!ws.isBridge)
    {
      if (ws.pubsub_token) 
      {
        // clientConnections.delete(ws.pubsub_token);
        // service.saveClientConnectionsToFile(clientConnections); // Sauvegarder les connexions mises à jour
        console.log(`Client with pubsub_token ${ws.pubsub_token} disconnected.`);
        activeConnections--;
        console.log(`Active connections: ${activeConnections}`);
        // console.log("Client has disconnected!");
      }
  
    }
    else
    {
      console.log("Bridge client disconnected.");
    }
    
    // clients.delete(clientIP); // Supprimer la connexion lorsqu'elle est fermée
  });


  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
  });


});


console.log("Websocket Server running on PORT 8181 ");


// fonction pour gerer les messages recu par le bridge
function handleRegularClientMessages(ws){

  let isAuthenticated = false; // État d'authentification du client

  ws.on("message", async (message) => {

    try {

      let rawMessage = message;

      if (Buffer.isBuffer(message)) {
        rawMessage = message.toString('utf-8');
      }

      if (typeof rawMessage !== "string" || rawMessage.trim() === "") {
        // console.error("Message non valide ou vide :", message);
        ws.send(JSON.stringify({
          type: "error",
          message: "Invalid message format. Message must be a non-empty string."
        }));
        return;
      }

      let payload;

      try {
        payload = JSON.parse(rawMessage);
      } catch (err) {

        console.error("JSON.parse erreurs:", err, "| event:", rawMessage);
        ws.send(JSON.stringify({
          event_type: "error",
          message: "Invalid JSON format"
        }));
        return;
      }

      // Validation de la structure minimale attendue
      if (!payload || typeof payload !== "object" || payload === null || payload === undefined) 
      {
        console.warn("Payload invalide :", payload);
        ws.send(JSON.stringify({
            type: "error",
            message: "Invalid payload structure. Payload must be a non-null object."
        }));
        return;
      }


      console.log("isAuthen... : ", isAuthenticated);

      if (!isAuthenticated) {
        
        
        // Gérer uniquement l'authentification
        if (payload.event_type === "authenticate" && payload.data && typeof payload.data === "object" && payload.data.pubsub_token && typeof payload.data.pubsub_token === "string") 
        {

          console.log("Received pubsub_token from client:", payload.data.pubsub_token);

          
          // Envoyer le token au bridge pour validation
          const bridgeMessage = {
            event_type: "validate_token",
            pubsub_token: payload.data.pubsub_token,
          };

          const isValid = await sendMessageToBridgeAndWaitForResponse(bridgeMessage);

          console.log("isValid", isValid)

          if (isValid) 
            {
              isAuthenticated = true; // Marquer le client comme authentifié
              
              // Associer la connexion WebSocket au pubsub_token
              ws.pubsub_token = payload.data.pubsub_token;

              // Ajouter le client à la Map
              clientConnections.set(payload.data.pubsub_token, ws);
              
              // Sauvegarder les connexions mises à jour
              service.saveClientConnectionsToFile(clientConnections); // Sauvegarder les connexions mises à jour

               // Envoyer la confirmation de validation au client
              ws.send(JSON.stringify({ event_type: "auth_success", data: {message: "Authentication successful" }}));


              // Envoyer les messages en attente au client
              if (clientMessageQueue.has(ws.pubsub_token)) 
              {

                const messages = clientMessageQueue.get(ws.pubsub_token);
                messages.forEach((msg) => {
                  console.log(`Message sent to ${ws.pubsub_token} from queue after authentication`);
                  ws.send(JSON.stringify(msg));
                });
              
                // Supprimer les messages envoyés de la file d'attente
                console.log(`Deleting messages for pubsub_token: ${ws.pubsub_token}`);
                clientMessageQueue.delete(ws.pubsub_token);
                service.overwriteClientMessageQueueFile(clientMessageQueue);

              }

              // Gérer la déconnexion pour supprimer la connexion de la Map
              ws.on("close", () => {
                if (ws.pubsub_token) 
                {
                  // clientConnections.delete(ws.pubsub_token);
                  // service.saveClientConnectionsToFile(clientConnections); // Sauvegarder les connexions mises à jour
                  console.log(`Client with pubsub_token ${ws.pubsub_token} disconnected.`);
                } else {
                  console.warn("No pubsub_token found for this connection.");
                }
              });

              
            } else {

              console.log("Token validation failed.");
              ws.send(JSON.stringify({ event_type: "auth_failed", data: {message: "Invalid token" }}));
              ws.close(1008, "Invalid token"); // Code 1008 : Policy Violation

            }
        } else {

            console.log("Invalid authentication payload received.");
            ws.send(JSON.stringify({ event_type: "auth_failed", message: "Invalid authentication payload" }));
            ws.close(1008, "Invalid authentication payload");

        }
        
      } else {
  
        try {

          switch (payload.event_type) {

          case "authenticate":
          {
            ws.send(JSON.stringify({
              event_type: "already exist",
              data:{
                message: "This token is already authenticated"
              }
            }))

            return
          }
          case "contactInfo":
          {
            const { header } = payload.data;
            const response =  await apiCall.getContactInfo(header)

            ws.send(JSON.stringify(
              {
                event_type: 'InfoContact',
                data: response
              }
            ))

            return;
          }
          case "updateContact":
          {
            const { header , body} = payload.data;
            const response =  await apiCall.updateContact(header, body)

            ws.send(JSON.stringify(
              {
                event_type: 'contactUpdate',
                data: response
              }
            ))
          
            return;
          }
          case "deleteContact":
          {
            const { header } = payload.data;
            const response =  await apiCall.deleteContact(header)

            ws.send(JSON.stringify(
              {
                event_type: 'contactDeleted',
                data: response
              }
            ))
            console.log("deleting contact with pubsub_token", ws.pubsub_token)
            clientConnections.delete(ws.pubsub_token);

            return;
          }
          case "getMessageAfter" :
          {
            const { header } = payload.data;
            const response =  await apiCall.getMessageAfter(header)
            ws.send(JSON.stringify(
                {
                  event_type: 'allMessageAfter',
                  data: response
                }
            ))
           
            return
          }
          case "getMessageBefore" :
          {
            const { header } = payload.data;
            const response =  await apiCall.getMessageBefore(header)
            
            ws.send(JSON.stringify(
                {
                  event_type: 'allMessageBefore',
                  data: response
                }
            ))
           
            return
          }
          case "getAllMessage" :
          {
            const { header } = payload.data;
            const response =  await apiCall.getAllMessage(header)
            
            ws.send(JSON.stringify(
                {
                  event_type: 'allMessage',
                  data: response
                }
            ))
           
            return
          }
          case 'createMessage':
          {
            const {header, body} = payload.data;
            const response = await apiCall.newMessage(header, body);
           
            ws.send(JSON.stringify(
                {
                  event_type: 'messageCreated',
                  data: response
                }
            ))

            break;

          }
          case 'messageRead':
          {

            const { header } = payload.data;
            const response = await apiCall.updateLastSeen(header);

            ws.send(JSON.stringify(
                {
                  event_type: 'lastSeenUpdate',
                  data: response
                }
              ))
           
            break;

          }
          case 'deleteMessage' :
          {

            const { header } = payload.data;
            const response = await apiCall.deleteMessage(header);
            
            ws.send(JSON.stringify(
                {
                  event_type: 'messageDeleted',
                  data: response
                }
            ))

            break;
          }
          case 'typingOn':
          {
            const { header } = payload.data;
            const response = await apiCall.typingStatus(header, 'on');

            ws.send(JSON.stringify(
              {
                event_type: 'typingStatusUpdate',
                data: response
              }
            ))

            break;
          }
          case 'typingOff':
          {
            const { header } = payload.data;
            const response = await apiCall.typingStatus(header, 'off');

            ws.send(JSON.stringify(
                {
                  event_type: 'typingStatusUpdate',
                  data: response
                }
              ))
           
            break;
          }
          default:
          {
            ws.send(JSON.stringify({
              event_type: 'error',
              data: {
                error_code: 400,
                message: `Unknown event_type: ${event_type}`,
                origin: 'WebSocket_Server',
              }
            }));
          }
          
          console.log(`An unknown event happened : ${payload.event_type}`)
          break;

          }
          
        } catch (error) {

          if (error.response) {
            
            ws.send(JSON.stringify({
              event_type: 'error',
              data: {
                error_code: error.response.status,
                message: error.response.data?.message || 'Unknown error from API',
                origin: 'REST_API',
                context: {
                  event: event_type
                }
              }
            }));

          } else {

            ws.send(JSON.stringify({
              event_type: 'error',
              data: {
                error_code: 500,
                message: error.message || 'Unexpected server error',
                origin: 'WebSocket_Server',
                context: {
                  event: event_type
                }
              }
            }));

          }
        }
      }
      
    } catch (error) {
      console.log("Error processing message from regular client:", error.message);
    }

  })

}

// fonction pour gerer les messages recu par le bridge
function handleBridgeMessages(ws) {
  ws.on("message", (message) => {

    try {

      let payload;
      try {
        payload = JSON.parse(message);
      } catch (err) {
        console.error("JSON.parse erreurs:", err, "| event:", message);
        return;
      }

      const event_type = payload.event_type, data = payload.data;
      
      const object = {
        event_type,
        data
      }

      
      switch (payload.event_type) {
    
        case "conversation_created":
          {
            const success = sendMessageToClientByPubSub(payload.pubsub_token, object)

            if (!success) {
              console.warn(`Échec de l'envoi à ${payload.pubsub_token}, mise en file d'attente...`);
            
              // Vérifier si le token existe dans la Map
              if (!clientMessageQueue.has(payload.pubsub_token)) {
                clientMessageQueue.set(payload.pubsub_token, []);
              }
            
              // Copie défensive pour éviter les références partagées
              const copy = JSON.parse(JSON.stringify(object));
              console.log("copie :", copy);
            
              // Ajouter le message à la file d'attente du token
              clientMessageQueue.get(payload.pubsub_token).push(copy);
            
              // Sauvegarde sur disque
              service.appendToClientMessageQueueFile(clientMessageQueue);
            }
            return
          }
        case "conversation_updated":
          {
            const success = sendMessageToClientByPubSub(payload.pubsub_token, object)

            // Si l'envoi échoue, ajouter le message à la file d'attente
            if (!success) {
              console.warn(`Échec de l'envoi à ${payload.pubsub_token}, mise en file d'attente...`);
            
              // Vérifier si le token existe dans la Map
              if (!clientMessageQueue.has(payload.pubsub_token)) {
                clientMessageQueue.set(payload.pubsub_token, []);
              }
            
              // Copie défensive pour éviter les références partagées
              const copy = JSON.parse(JSON.stringify(object));
              console.log("copie :", copy);
            
              // Ajouter le message à la file d'attente du token
              clientMessageQueue.get(payload.pubsub_token).push(copy);
            
              // Sauvegarde sur disque
              service.appendToClientMessageQueueFile(clientMessageQueue);
            }
            return
          }
        case "conversation_status_changed":
          {
            const success = sendMessageToClientByPubSub(payload.pubsub_token, object)

            // Si l'envoi échoue, ajouter le message à la file d'attente
            if (!success) {
              console.warn(`Échec de l'envoi à ${payload.pubsub_token}, mise en file d'attente...`);
            
              // Vérifier si le token existe dans la Map
              if (!clientMessageQueue.has(payload.pubsub_token)) {
                clientMessageQueue.set(payload.pubsub_token, []);
              }
            
              // Copie défensive pour éviter les références partagées
              const copy = JSON.parse(JSON.stringify(object));
              console.log("copie :", copy);
            
              // Ajouter le message à la file d'attente du token
              clientMessageQueue.get(payload.pubsub_token).push(copy);
            
              // Sauvegarde sur disque
              service.appendToClientMessageQueueFile(clientMessageQueue);
            }
            return
          }
        case "message_created":
          {
            const success = sendMessageToClientByPubSub(payload.pubsub_token, object)

            console.log(object)
          

            if (!success) {
              console.warn(`Échec de l'envoi à ${payload.pubsub_token}, mise en file d'attente...`);
            
              // Vérifier si le token existe dans la Map
              if (!clientMessageQueue.has(payload.pubsub_token)) {
                clientMessageQueue.set(payload.pubsub_token, []);
              }
            
              // Copie défensive pour éviter les références partagées
              const copy = JSON.parse(JSON.stringify(object));
              console.log("copie :", copy);
            
              // Ajouter le message à la file d'attente du token
              clientMessageQueue.get(payload.pubsub_token).push(copy);
            
              // Sauvegarde sur disque
              service.appendToClientMessageQueueFile(clientMessageQueue);
            }

            return

          }
        case "message_updated":
          {
            const success = sendMessageToClientByPubSub(payload.pubsub_token, object)

            // Si l'envoi échoue, ajouter le message à la file d'attente
            if (!success) {
              console.warn(`Échec de l'envoi à ${payload.pubsub_token}, mise en file d'attente...`);
            
              // Vérifier si le token existe dans la Map
              if (!clientMessageQueue.has(payload.pubsub_token)) {
                clientMessageQueue.set(payload.pubsub_token, []);
              }
            
              // Copie défensive pour éviter les références partagées
              const copy = JSON.parse(JSON.stringify(object));
              console.log("copie :", copy);
            
              // Ajouter le message à la file d'attente du token
              clientMessageQueue.get(payload.pubsub_token).push(copy);
            
              // Sauvegarde sur disque
              service.appendToClientMessageQueueFile(clientMessageQueue);
            }
            return
          }
        case "typing_on":
          {
            const success = sendMessageToClientByPubSub(payload.pubsub_token, object)

            // Si l'envoi échoue, on ne fait rien
            if (!success) {
              return;
            }
            return;
          }
        case "typing_off":
          {
            const success = sendMessageToClientByPubSub(payload.pubsub_token, object)

            // Si l'envoi échoue, on ne fait rien
            if (!success) {
              return;
            }
            return;
          }
        case "presence_Update":
          {
            const success = sendMessageToClientByPubSub(payload.pubsub_token, object)

            // Si l'envoi échoue, on ne fait rien
            if (!success) {
              return;
            }
            return;

          }
        case "validate_token_response":
          {
            if(payload.data.isValid)
            {
              console.log("client authentifier avec succes")
            }else{
              console.log("authentification echouer pour le pubsub_token : ", payload.data.pubsub_token)
            }
            return
          }
        default:{
          console.log("Unknown event recieve from the bridge ", payload)
          return
        }

      }
      
    } catch (error) {

      console.log("Error processing message from bridge:", error.message);
      
    }
  })

}

// Fonction pour envoyer un message au bridge et attendre une réponse
function sendMessageToBridgeAndWaitForResponse(message) {

  return new Promise((resolve) => {
      webSocketServer.clients.forEach((client) => {
          if (client.isBridge && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(message));

                // Gestionnaire temporaire pour l'événement "message"
                const handleMessage = (response) => {
                  // console.log("Handling response from bridge:", response);
                  try {
                      const parsedResponse = JSON.parse(response);
                      if (parsedResponse.event_type === "validate_token_response") {
                        console.log("validate_token_response received:", parsedResponse);  
                        resolve(parsedResponse.data.isValid);
                        client.off("message", handleMessage); // Supprimer le gestionnaire après traitement
                      }
                  } catch (err) {
                      console.error("Error parsing bridge response:", err.message);
                      resolve(false);
                      client.off("message", handleMessage); // Supprimer le gestionnaire en cas d'erreur
                  }
              };

              client.on("message", handleMessage);
          }
      });
  });
}

// Fonction pour envoyer un message au bridge
function sendMessageToBridge(message) {
  webSocketServer.clients.forEach((client) => {
      if (client.isBridge && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        console.log("Message sent to bridge:", message);
      }
  });
}

// Fonction pour réauthentifier les clients réguliers
function reauthenticateRegularClients() {
  console.log("Reauthenticating of regular clients start....");

  

  clientConnections.forEach((_, pubsub_token) => {
      console.log(`Reauthenticating client with pubsub_token: ${pubsub_token}`);
      
      // Envoyer une demande de validation au bridge
      const bridgeMessage = {
          event_type: "validate_token",
          pubsub_token: pubsub_token,
      };
      sendMessageToBridge(bridgeMessage);
  });


}


function sendMessageToClientByPubSub(pubSubToken, message) {
  console.log("Looking for pubSubToken:", pubSubToken);
  // console.log("Current clientConnections Map:", clientConnections);

  const client = clientConnections.get(pubSubToken);

  if (!client) {
    console.warn(`No client found for pubSubToken: ${pubSubToken},`);
    return false;
  }

  // console.log("Client retrieved from the map:", client);

  if (client && !client.isBridge && client.readyState === WebSocket.OPEN) {
      try {
          client.send(JSON.stringify(message));
          console.log(`Message sent to client with pubsub_token: ${pubSubToken}`, message);
          return true;
      } catch (error) {
          console.error(`Error sending message to client with pubsub_token: ${pubSubToken}`, error.message);
          return false;
      }
  } else {
      console.warn(`No active connection found for pubsub_token: ${pubSubToken}`);
      return false
  }
}





