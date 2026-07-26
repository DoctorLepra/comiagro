import { InvoiceData } from '../models/invoice-data.model';

export const XML_PARSER_PORT = Symbol('XML_PARSER_PORT');

export interface XmlParserPort {
  parseInvoice(xmlContent: string): Promise<InvoiceData>;
}
