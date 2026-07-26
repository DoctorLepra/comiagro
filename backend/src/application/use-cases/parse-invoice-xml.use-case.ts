import { Injectable, Inject } from '@nestjs/common';
import { XML_PARSER_PORT, type XmlParserPort } from '../../domain/ports/xml-parser.port';
import { STORAGE_PORT, type StoragePort } from '../../domain/ports/storage.port';
import { InvoiceData } from '../../domain/models/invoice-data.model';

@Injectable()
export class ParseInvoiceXmlUseCase {
  constructor(
    @Inject(XML_PARSER_PORT)
    private readonly xmlParser: XmlParserPort,
    @Inject(STORAGE_PORT)
    private readonly storage: StoragePort,
  ) {}

  async execute(fileBuffer: Buffer): Promise<{ invoiceData: InvoiceData, xmlUrl: string, jsonUrl: string }> {
    const xmlContent = fileBuffer.toString('utf-8');
    
    // 1. Parsear el XML
    const parsedData = await this.xmlParser.parseInvoice(xmlContent);
    
    // Usaremos el CUFE como identificador único para los archivos, o un timestamp si no hay CUFE
    const identifier = parsedData.cufe !== 'CUFE_NO_ENCONTRADO' ? parsedData.cufe : Date.now().toString();

    // 2. Subir el XML original a Cloudflare R2
    const xmlFileName = `invoices/xml/${identifier}.xml`;
    const xmlUrl = await this.storage.uploadFile(xmlFileName, fileBuffer, 'application/xml');

    // 3. Subir el JSON resultante a Cloudflare R2
    const jsonFileName = `invoices/json/${identifier}.json`;
    const jsonBuffer = Buffer.from(JSON.stringify(parsedData, null, 2), 'utf-8');
    const jsonUrl = await this.storage.uploadFile(jsonFileName, jsonBuffer, 'application/json');

    return {
      invoiceData: parsedData,
      xmlUrl,
      jsonUrl
    };
  }
}
