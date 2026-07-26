export const STORAGE_PORT = Symbol('STORAGE_PORT');

export interface StoragePort {
  /**
   * Sube un archivo al almacenamiento en la nube y retorna la URL pública (si aplica) o el path.
   * @param fileName Nombre del archivo incluyendo extensión (ej: 'factura_123.xml')
   * @param fileBuffer Buffer del archivo a subir
   * @param contentType Mime type del archivo (ej: 'application/xml', 'application/json')
   */
  uploadFile(fileName: string, fileBuffer: Buffer, contentType: string): Promise<string>;
}
