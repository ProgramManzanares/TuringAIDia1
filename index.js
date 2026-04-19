//Primero exportamos el paquete necesario para poder trabajar con google cloud functions
const functions = require('@google-cloud/functions-framework');

//Creamos la funcion que se va a ejecutar cada vez que se suba un archivo a nuestro bucket de google cloud storage, 
// esta función recibe un evento como parámetro, el cual contiene toda la información del archivo subido
const processFileMetadata = (cloudEvent) => {
  console.info(`Evento recibido: ID ${cloudEvent.id}`);

  // Validación básica para asegurar que el evento contiene los datos necesarios
  try {
    const file = cloudEvent.data;

    // Validación para asegurar que el evento contiene datos del archivo
    if (!file || Object.keys(file).length === 0) {
      throw new Error("El evento no contiene datos válidos del archivo.");
    }

    //Fragmento de prueba para validar el correcto manejo de errores en la consola de logging de google
    /*if (!file.contentType || !file.contentType.includes('pdf')){
        throw new Error (`Tipo de archivo no permitido: ${file.contentType}`)
    }*/

    // Convertir tamaño correctamente
    const sizeBytes = file.size ? parseInt(file.size, 10) : 0;

    // Construcción del objeto de metadatos con validaciones adicionales
    const metadata = {
      nombre: file.name || 'Sin nombre',
      bucket: file.bucket || 'Desconocido',
      tamano: `${sizeBytes} bytes`,
      tipoMime: file.contentType || 'application/octet-stream',
      fechaCreacion: file.timeCreated || 'No disponible',
      metageneration: file.metageneration || 'N/A'
    };

    // Log detallado de los metadatos del archivo
    console.log("--- Metadatos del Archivo Detectado ---");
    console.info(`Archivo: ${metadata.nombre}`);
    console.info(`Ubicación: gs://${metadata.bucket}/${metadata.nombre}`);
    console.info(`Detalles Técnicos: [Tipo: ${metadata.tipoMime}] [Tamaño: ${metadata.tamano}]`);
    
    console.debug("Payload completo del evento:", JSON.stringify(file));

  } catch (error) {

     // Log detallado del error para facilitar la depuración
    console.error("Fallo al procesar el archivo de Storage.");
    console.error(`Mensaje del error: ${error.message}`);
    console.error(`Stack trace: ${error.stack || 'No disponible'}`);
    throw error; 
  }
 // Log de finalización para confirmar que la función ha terminado su ejecución
  console.info("Finalización del procesamiento del evento.");
};
 
// Registramos la función para que se ejecute cada vez que se suba un archivo a nuestro bucket de google cloud storage
//Parte importante de todo el desarrollo por que aqui digamos que conectamos esta logica con el evento de google cloud storage, 
// es decir, cada vez que se suba un archivo a nuestro bucket, esta función se va a ejecutar y va a procesar los metadatos del archivo subido
functions.cloudEvent('processFileMetadata', processFileMetadata);

//Este fragmento de aqui se usa para la exportacion de la funcion para poder realizar pruebas unitarias.
module.exports = { processFileMetadata };