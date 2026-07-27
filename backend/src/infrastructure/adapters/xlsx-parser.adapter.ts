import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { InvoiceData, InvoiceItemData } from '../../domain/models/invoice-data.model';

@Injectable()
export class XlsxParserAdapter {
  private readonly logger = new Logger(XlsxParserAdapter.name);

  parseExcel(fileBuffer: Buffer): InvoiceData[] {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rawRows || rawRows.length === 0) {
        throw new Error('El archivo Excel está vacío o no contiene filas de datos.');
      }

      const results: InvoiceData[] = rawRows.map((row) => {
        // Mapeo flexible de encabezados (ignora mayúsculas/minúsculas y espacios extra)
        const getCol = (...keys: string[]): string => {
          for (const key of keys) {
            const foundKey = Object.keys(row).find(
              (k) => k.trim().toLowerCase() === key.trim().toLowerCase()
            );
            if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
              return String(row[foundKey]).trim();
            }
          }
          return '';
        };

        const getNumber = (...keys: string[]): number => {
          const valStr = getCol(...keys);
          if (!valStr) return 0;
          // Limpiar formato de moneda ($ 150.000,50 o 150000.50)
          const cleanStr = valStr.replace(/[^0-9.,-]/g, '').replace(',', '.');
          const num = parseFloat(cleanStr);
          return isNaN(num) ? 0 : num;
        };

        // Mapeo de Tipo de Documento
        const rawDocType = getCol('Tipo de documento', 'Tipo Documento', 'TipoDoc');
        let documentType: 'FACTURA_ELECTRONICA' | 'NOTA_DEBITO' | 'NOTA_CREDITO' = 'FACTURA_ELECTRONICA';
        if (rawDocType.toLowerCase().includes('débito') || rawDocType.toLowerCase().includes('debito')) {
          documentType = 'NOTA_DEBITO';
        } else if (rawDocType.toLowerCase().includes('crédito') || rawDocType.toLowerCase().includes('credito')) {
          documentType = 'NOTA_CREDITO';
        }

        const cufe = getCol('CUFE/CUDE', 'CUFE', 'CUDE') || 'CUFE_NO_ENCONTRADO';
        const issueDate = getCol('Fecha Emisión', 'Fecha Emision', 'Fecha') || new Date().toISOString().split('T')[0];
        const companyNit = getCol('NIT Emisor', 'Nit Emisor') || '000000000';
        const companyName = getCol('Nombre Emisor', 'Emisor') || 'Desconocido';
        const customerNit = getCol('NIT Receptor', 'Nit Receptor', 'NIT Adquirente') || '222222222222';
        const customerName = getCol('Nombre Receptor', 'Receptor', 'Nombre Adquirente') || 'Consumidor Final';

        const totalAmount = getNumber('Total', 'Valor Total', 'PayableAmount');
        const taxAmount = getNumber('IVA', 'Valor IVA');

        const items: InvoiceItemData[] = [
          {
            description: `Registro Excel - Folio: ${getCol('Folio') || 'S/N'} Prefijo: ${getCol('Prefijo') || 'S/P'}`,
            quantity: 1,
            unitPrice: totalAmount - taxAmount,
            totalPrice: totalAmount,
          },
        ];

        return {
          cufe,
          issueDate,
          totalAmount,
          taxAmount,
          companyNit,
          companyName,
          customerNit,
          customerName,
          documentType,
          items,
          rawJson: row, // Conservamos las 32 columnas de la fila original en rawJson
        };
      });

      return results;
    } catch (error: any) {
      this.logger.error('Error parseando archivo Excel', error);
      throw new Error(error.message || 'Error procesando la plantilla Excel.');
    }
  }
}
