const { processFileMetadata } = require('./index');

describe('Pruebas Unitarias - Cloud Function GCS Metadata', () => {
  
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Flujo Exitoso: Debería extraer metadatos correctamente', () => {
  const mockEvent = {
    data: {
      name: 'documento_importante.pdf',
      size: '5000',
      contentType: 'application/pdf',
      bucket: 'mi-bucket-de-datos'
    }
  };

  processFileMetadata(mockEvent);

  expect(console.info).toHaveBeenCalled();

  expect(console.info).toHaveBeenCalledWith(
    expect.stringContaining('Archivo: documento_importante.pdf')
  );

  expect(console.info).toHaveBeenCalledWith(
    expect.stringContaining('Finalización del procesamiento')
  );
});
});