// Importamos paquetes necesarios
const functions = require('@google-cloud/functions-framework');
const { GoogleAuth } = require('google-auth-library');

// URL del Apps Script Web App
const ScriptURL = 'https://script.google.com/macros/s/AKfycbzKIYAY7nhM8PCCBBF6U4J_LOvC05Hng_VJejd31GHak9huE-egfv1_pW0f2pUsa52q9w/exec';

// Autenticación Google
const auth = new GoogleAuth();


// Aqui se obtiene el token OAuth para autenticarse con el Apps Script Web App
const getTokenOAuth = async () => {

  // Obtenemos un cliente de autenticación y luego solicitamos un token de ID para el URL del Apps Script Web App
  const client = await auth.getIdTokenClient(ScriptURL);
  const token = await client.idTokenProvider.fetchIdToken(ScriptURL);

  // Validamos que se haya obtenido un token antes de continuar, lanzando un error si no se pudo obtener
  if (!token) {
    throw new Error("No se pudo obtener el token OAuth");
  }

  //
  return token;
};


// Enviar datos al Apps Script
const sendAppsScript = async (metadata, token) => {

    // Logging del token para verificar que se ha obtenido correctamente antes de enviarlo al Apps Script
    console.log("TOKEN:", token);
    console.log("TIPO TOKEN:", typeof token);
    
    // Enviamos los metadatos del archivo junto con el token OAuth al Apps Script Web App utilizando una solicitud POST
  const response = await fetch(ScriptURL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...metadata,
      token
    }),

    signal: AbortSignal.timeout(5000) 
  });

  // Validamos que la respuesta del Apps Script Web App sea exitosa antes de intentar procesar la respuesta, lanzando un error si se recibe un código de error
  if (!response.ok) {
    throw new Error(`Codigo de error enviado por Apps Script: ${response.status}`);
  }

  // Procesamos la respuesta del Apps Script Web App y la registramos en los logs para verificar que se ha recibido correctamente
  const result = await response.json();

  // Logging de la respuesta del Apps Script Web App para verificar que se ha recibido correctamente y facilitar la depuración en caso de problemas
  console.info('Respuesta de Apps Script:', JSON.stringify(result));

  return result;
};

// Función principal que se ejecuta cuando se detecta un evento de Cloud Storage, encargada de procesar los metadatos del archivo y enviarlos al Apps Script Web App
const processFileMetadata = async (cloudEvent) => {

  // Logging del ID del evento recibido para facilitar el seguimiento y la depuración de eventos específicos en los logs
  console.info(`Evento recibido: ID ${cloudEvent.id}`);

  // Validación para asegurar que el evento contiene datos antes de intentar procesarlos, lanzando un error si no se encuentran datos válidos
  try {

    // Extraemos los metadatos del archivo del evento recibido, asegurándonos de que el objeto de datos esté presente y contenga información válida antes de continuar con el procesamiento
    const file = cloudEvent.data;

    // Validación para asegurar que el objeto de datos del evento contiene información válida del archivo antes de intentar acceder a sus propiedades, lanzando un error si no se encuentra información válida
    if (!file || Object.keys(file).length === 0) {
      throw new Error("El evento no contiene datos válidos del archivo.");
    }

    // Convertimos el tamaño del archivo a bytes, asegurándonos de manejar casos donde el tamaño no esté definido o no sea un número válido, asignando un valor predeterminado de 0 bytes en esos casos
    const sizeBytes = file.size ? parseInt(file.size, 10) : 0;

    // Creamos un objeto de metadatos con la información relevante del archivo, utilizando valores predeterminados para campos que puedan estar ausentes o no definidos en el evento
    const metadata = {
      nombre: file.name || 'Sin nombre',
      bucket: file.bucket || 'Desconocido',
      tamano: `${sizeBytes} bytes`,
      tipoMime: file.contentType || 'application/octet-stream',
      fechaCreacion: file.timeCreated || 'No disponible',
      metageneration: file.metageneration || 'N/A',
      eventId: cloudEvent.id 
    };

    //constante para definir los tipos MIME permitidos
    const tiposPermitidos = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
    ]
    //Constante para limitar el tamaño máximo del archivo a 10 MB
    const tamanoMaximo = 10 * 1024 * 1024; 

    const nombreValido = /^[a-zA-Z0-9_\-\.]+$/;
    
    // Validaciones para asegurar que el archivo cumple con los requisitos antes de procesar
    if (!tiposPermitidos.includes(file.contentType)) {
      console.log('Tipo no permitido');
      return;
    }

    // Validación del tamaño del archivo para evitar procesar archivos demasiado grandes
    if (sizeBytes > tamanoMaximo) {
      console.log('Tamaño del archivo excede el límite permitido');
      return;
    }

    // Validación para asegurar que el contentType esté definido antes de continuar con el procesamiento
    if (!file.contentType) {
      console.log('Archivo sin contentType definido');
      return;
    }

    if (!nombreValido.test(file.name)) {
      console.log('Nombre de archivo contiene caracteres no permitidos');
      return;
    }
    
    //Logging detallado de los metadatos del archivo para facilitar la depuración y el monitoreo
    console.log("--- Metadatos del Archivo Detectado ---");
    console.info(`Archivo: ${metadata.nombre}`);
    console.info(`Ubicación: gs://${metadata.bucket}/${metadata.nombre}`);
    console.info(`Detalles Técnicos: [Tipo: ${metadata.tipoMime}] [Tamaño: ${metadata.tamano}]`);

    console.debug("Payload completo del evento:", JSON.stringify(file));

  // Obtener el token OAuth y enviar los metadatos al Apps Script Web App
    const token = await getTokenOAuth();
    // Logging del token para verificar que se ha obtenido correctamente antes de enviarlo al Apps Script
    await sendAppsScript(metadata, token);

  } catch (error) {

     // Logging detallado del error para facilitar la identificación de problemas durante el procesamiento del evento
    console.error("Fallo al procesar el archivo de Storage.");
    console.error(`Mensaje del error: ${error.message}`);
    console.error(`Stack trace: ${error.stack || 'No disponible'}`);

    throw error;
  }
   // Logging para indicar que el procesamiento del evento ha finalizado, lo que ayuda a marcar el final del ciclo de vida del evento en los logs
  console.info("Finalización del procesamiento del evento.");
};

// Registramos la función como un manejador de eventos para Cloud Storage utilizando el framework de funciones de Google Cloud
functions.cloudEvent('processFileMetadata', processFileMetadata);


module.exports = { processFileMetadata };