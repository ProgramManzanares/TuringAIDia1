# Cloud Storage MetaData Logger

Esta funcion principalmente se centra en la validacion y en la lectura de los archivos para extraer la metadata de dichos archivos.

El flujo de como es que funciona es el siguiente.

El usuario sube un archivo de cualquier tipo.
Este codigo vive dentro de Google Cloud, se puede tomar este codigo de un repositorio, si, pero como objeto rapido de prueba
el codigo lo cree en el editor google proporciona.

Entonces cuando un usuario sube un archivo pasan varias cosas.

EL usuario sube el archivo, Cloud Storage detecta el evento, El disparador se activa, Cloud Funcition ejecuta el codigo y depsues se muestra como almacenamiento

Eso cubre digamos que todo el proceso desde que se sube un archivo a la nube, hasta que un desarrollador o un arquitecto en la nube puede estar observando el comportamiento
de dicho archivo por medio de las request que se hagan.

Justificacion de codigo

Por que se decidio trabajar el codigo de esta forma.
La parte mas importante de entender aqui es como se conecta la logica de la lectura de los archivos y las funciones cloud
Por lo que se manejo un objeto dentro del codigo

 const metadata = {
      nombre: file.name || 'Sin nombre',
      bucket: file.bucket || 'Desconocido',
      tamano: `${sizeBytes} bytes`,
      tipoMime: file.contentType || 'application/octet-stream',
      fechaCreacion: file.timeCreated || 'No disponible',
      metageneration: file.metageneration || 'N/A'
    };

para manejar los metadatos correspondientes de cada archivo y despues mostrar los logs necesarios para que se puedieran mostrar dentro de la consola de Logging de Google Cloud

// Log detallado de los metadatos del archivo
    console.log("--- Metadatos del Archivo Detectado ---");
    console.info(`Archivo: ${metadata.nombre}`);
    console.info(`Ubicación: gs://${metadata.bucket}/${metadata.nombre}`);
    console.info(`Detalles Técnicos: [Tipo: ${metadata.tipoMime}] [Tamaño: ${metadata.tamano}]`);

Ademas de validaciones extras en caso de hubiera un error dentro de la subida de los archivos

Para correr este archivo solo es necesario instalar npm jest para ejecutar las pruebas y despues ejecutar npm test para correrlas

Si en caso no se pueden ejecutar, solo se debe copiar el archivo package.json para que lea el script