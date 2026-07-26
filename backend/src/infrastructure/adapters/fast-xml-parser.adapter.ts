import { Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import { XmlParserPort } from '../../domain/ports/xml-parser.port';
import { InvoiceData, InvoiceItemData } from '../../domain/models/invoice-data.model';

@Injectable()
export class FastXmlParserAdapter implements XmlParserPort {
  private readonly logger = new Logger(FastXmlParserAdapter.name);
  private parser: XMLParser;
  private rawParser: XMLParser;

  constructor() {
    // Parser utilitario para extraer datos básicos sin lidiar con los namespaces
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: true,
      removeNSPrefix: true, 
    });

    // Parser exacto: Mantiene la estructura y los prefijos (cbc, cac, ext) tal cual el XML original
    this.rawParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: true,
      removeNSPrefix: false, // NO eliminamos los namespaces para mantener fidelidad 100%
      cdataPropName: '#cdata', // Aseguramos que el CDATA se trate correctamente si viene separado
    });
  }

  async parseInvoice(xmlContent: string): Promise<InvoiceData> {
    try {
      // 1. Extraer los datos "core" utilizando el parser simplificado
      const jsonObj = this.parser.parse(xmlContent);
      
      if (!jsonObj || Object.keys(jsonObj).length === 0 || typeof jsonObj === 'string') {
        throw new Error('Formato XML inválido o ilegible.');
      }

      let invoiceNode = jsonObj.Invoice;
      let rawJsonExact = this.rawParser.parse(xmlContent); // Parseo fiel al XML

      // Procesar el Contenedor DIAN (AttachedDocument)
      if (!invoiceNode && jsonObj.AttachedDocument) {
        const attachedDoc = jsonObj.AttachedDocument;
        const descriptionCdata = attachedDoc.Attachment?.ExternalReference?.Description;

        // Si existe una factura anidada en el CDATA, la extraemos para los datos "core"
        if (descriptionCdata && typeof descriptionCdata === 'string' && descriptionCdata.includes('<Invoice')) {
          const nestedJson = this.parser.parse(descriptionCdata);
          invoiceNode = nestedJson.Invoice;

          // Hacemos lo mismo para el rawJsonExact: Reemplazamos el string gigante por el árbol JSON real respetando namespaces
          const nestedRawJson = this.rawParser.parse(descriptionCdata);
          
          // Navegamos por el rawJsonExact para encontrar dónde inyectarlo (cuidando los prefijos)
          if (rawJsonExact.AttachedDocument) {
             const extRef = rawJsonExact.AttachedDocument['cac:Attachment']?.['cac:ExternalReference'];
             if (extRef && extRef['cbc:Description']) {
               extRef['cbc:Description'] = nestedRawJson; // Inyectamos el árbol exacto
             }
          }
        }

        if (!invoiceNode) {
          invoiceNode = attachedDoc;
        }
      }

      if (!invoiceNode) {
        throw new Error('Formato XML inválido o ilegible.');
      }

      const rawCufe = invoiceNode.UUID?.['#text'] || invoiceNode.UUID || 'CUFE_NO_ENCONTRADO';
      const cufe = typeof rawCufe === 'string' ? rawCufe : 'CUFE_NO_ENCONTRADO';
      
      const rawDate = invoiceNode.IssueDate?.['#text'] || invoiceNode.IssueDate || new Date().toISOString();
      const issueDate = typeof rawDate === 'string' ? rawDate : new Date().toISOString();
      
      const legalMonetaryTotal = invoiceNode.LegalMonetaryTotal || {};
      const totalAmount = parseFloat(legalMonetaryTotal.PayableAmount?.['#text'] || legalMonetaryTotal.PayableAmount || '0');
      
      const taxTotal = invoiceNode.TaxTotal || {};
      const taxAmount = parseFloat(taxTotal.TaxAmount?.['#text'] || taxTotal.TaxAmount || '0');

      const supplierParty = invoiceNode.AccountingSupplierParty?.Party || {};
      const rawCompanyName = 
        supplierParty.PartyName?.Name || 
        supplierParty.PartyTaxScheme?.RegistrationName || 
        supplierParty.PartyLegalEntity?.RegistrationName || 
        'Desconocido';

      const companyName = typeof rawCompanyName === 'object' ? (rawCompanyName?.['#text'] || rawCompanyName?.['#cdata'] || 'Desconocido') : String(rawCompanyName);

      const companyIdNode = 
        supplierParty.PartyTaxScheme?.CompanyID || 
        supplierParty.PartyLegalEntity?.CompanyID || 
        supplierParty.PartyIdentification?.ID;

      const rawNit = typeof companyIdNode === 'object' ? (companyIdNode?.['#text'] || companyIdNode?.['#cdata'] || '') : companyIdNode;
      const companyNit = rawNit ? String(rawNit).trim() : '000000000';

      // Datos del Cliente / Adquirente (AccountingCustomerParty)
      const customerParty = invoiceNode.AccountingCustomerParty?.Party || {};
      const rawCustomerName = 
        customerParty.PartyName?.Name || 
        customerParty.PartyTaxScheme?.RegistrationName || 
        customerParty.PartyLegalEntity?.RegistrationName || 
        'Consumidor Final / Desconocido';

      const customerName = typeof rawCustomerName === 'object' ? (rawCustomerName?.['#text'] || rawCustomerName?.['#cdata'] || 'Consumidor Final / Desconocido') : String(rawCustomerName);

      const customerIdNode = 
        customerParty.PartyTaxScheme?.CompanyID || 
        customerParty.PartyLegalEntity?.CompanyID || 
        customerParty.PartyIdentification?.ID;

      const rawCustomerNit = typeof customerIdNode === 'object' ? (customerIdNode?.['#text'] || customerIdNode?.['#cdata'] || '') : customerIdNode;
      const customerNit = rawCustomerNit ? String(rawCustomerNit).trim() : '222222222222';

      let invoiceLines = invoiceNode.InvoiceLine || [];
      if (!Array.isArray(invoiceLines)) {
        invoiceLines = [invoiceLines];
      }

      const items: InvoiceItemData[] = invoiceLines.map((line: any) => {
        const item = line.Item || {};
        const price = line.Price || {};
        
        return {
          description: item.Description || 'Sin descripción',
          quantity: parseFloat(line.InvoicedQuantity?.['#text'] || line.InvoicedQuantity || '0'),
          unitPrice: parseFloat(price.PriceAmount?.['#text'] || price.PriceAmount || '0'),
          totalPrice: parseFloat(line.LineExtensionAmount?.['#text'] || line.LineExtensionAmount || '0'),
        };
      });

      return {
        cufe,
        issueDate,
        totalAmount,
        taxAmount,
        companyNit,
        companyName,
        customerNit,
        customerName,
        items,
        rawJson: rawJsonExact,
      };
    } catch (error: any) {
      this.logger.error('Error parseando el archivo XML', error);
      throw new Error(error.message === 'Formato XML inválido o ilegible.' ? error.message : 'Formato XML inválido o ilegible.');
    }
  }
}
