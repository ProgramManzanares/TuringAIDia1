const functions = require('@google-cloud/functions-framework');

const processFileMetadata = (cloudEvent) => {
  console.info(`Evento recibido: ID ${cloudEvent.id}`);

  try {
    const file = cloudEvent.data;

    if (!file || Object.keys(file).length === 0) {
      throw new Error("El evento no contiene datos válidos del archivo.");
    }

    const metadata = {
      nombre: file.name || 'Sin nombre',
      bucket: file.bucket || 'Desconocido',
      tamaño: parseInt(file.size || 0) || `${metadata.size} bytes`,
      tipoMime: file.contentType || 'application/octet-stream',
      fechaCreacion: file.timeCreated || 'No disponible',
      metageneration: file.metageneration || 'N/A'
    };

    console.log("--- Metadatos del Archivo Detectado ---");
    console.info(`Archivo: ${metadata.nombre}`);
    console.info(`Ubicación: gs://${metadata.bucket}/${metadata.nombre}`);
    console.info(`Detalles Técnicos: [Tipo: ${metadata.tipoMime}] [Tamaño: ${metadata.tamaño}]`);
    
    console.debug("Payload completo del evento:", JSON.stringify(file));

  } catch (error) {
    console.error("Fallo al procesar el archivo de Storage.");
    console.error(`Mensaje del error: ${error.message}`);
    console.error(`Stack trace: ${error.stack || 'No disponible'}`);
    console.error(error);
    throw new error;
  }

  console.info("Finalización del procesamiento del evento.");
};

functions.cloudEvent('processFileMetadata', processFileMetadata);

module.exports = { processFileMetadata };