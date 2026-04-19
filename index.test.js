const { processFileMetadata } = require('./index');

// Pruebas unitarias para la función processFileMetadata
describe('Pruebas Unitarias - Cloud Function GCS Metadata', () => {
  
    // Mocking de console para evitar logs durante las pruebas y facilitar la verificación de llamadas
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Restaurar los mocks después de cada prueba para evitar interferencias entre pruebas
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Prueba para validar el flujo exitoso de la función con un evento de ejemplo
  test('Flujo Exitoso: Debería extraer metadatos correctamente', () => {
  const mockEvent = {
    data: {
      name: 'documento_importante.pdf',
      size: '5000',
      contentType: 'application/pdf',
      bucket: 'mi-bucket-de-datos'
    }
  };

  test('Manejo de errores: Debería fallar si el archivo no es un PDF', () => {
  const mockEvent = {
    data: {
      name: 'imagen.jpg',
      size: '3000',
      contentType: 'image/jpeg',
      bucket: 'mi-bucket'
    }
  };

  processFileMetadata(mockEvent);

  expect(console.error).toHaveBeenCalled();
});

  // Ejecutamos la función con el evento simulado
  processFileMetadata(mockEvent);

  // Verificamos que los logs se hayan llamado con la información correcta
  expect(console.info).toHaveBeenCalled();

  // Verificación de que se haya registrado el nombre del archivo correctamente
  expect(console.info).toHaveBeenCalledWith(
    expect.stringContaining('Archivo: documento_importante.pdf')
  );

  // Verificación de que se haya registrado la ubicación del archivo correctamente
  expect(console.info).toHaveBeenCalledWith(
    expect.stringContaining('Finalización del procesamiento')
  );
});
});