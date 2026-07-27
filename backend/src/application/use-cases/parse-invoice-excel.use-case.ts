import { Injectable, Inject } from '@nestjs/common';
import { XlsxParserAdapter } from '../../infrastructure/adapters/xlsx-parser.adapter';
import { STORAGE_PORT, type StoragePort } from '../../domain/ports/storage.port';
import { InvoiceData } from '../../domain/models/invoice-data.model';

@Injectable()
export class ParseInvoiceExcelUseCase {
  constructor(
    private readonly xlsxParser: XlsxParserAdapter,
    @Inject(STORAGE_PORT)
    private readonly storage: StoragePort,
  ) {}

  async execute(fileBuffer: Buffer): Promise<{ isExcel: boolean; dataList: { invoiceData: InvoiceData; jsonUrl?: string }[]; fileUrl?: string }> {
    // 1. Parsear el archivo Excel a un arreglo de InvoiceData
    const parsedDataList = this.xlsxParser.parseExcel(fileBuffer);

    const timestamp = Date.now();
    // 2. Subir el archivo original Excel a R2
    const excelFileName = `invoices/excel/${timestamp}.xlsx`;
    let fileUrl = '';
    try {
      fileUrl = await this.storage.uploadFile(excelFileName, fileBuffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } catch (e) {
      // Si falla almacenamiento R2, continuar con datos parseados
    }

    // 3. Subir el JSON compilado de la plantilla Excel
    const dataList = await Promise.all(
      parsedDataList.map(async (invoiceData, idx) => {
        const identifier = invoiceData.cufe !== 'CUFE_NO_ENCONTRADO' ? invoiceData.cufe : `${timestamp}_${idx}`;
        const jsonFileName = `invoices/json/excel_${identifier}.json`;
        const jsonBuffer = Buffer.from(JSON.stringify(invoiceData, null, 2), 'utf-8');
        let jsonUrl = '';
        try {
          jsonUrl = await this.storage.uploadFile(jsonFileName, jsonBuffer, 'application/json');
        } catch (e) {}

        return {
          invoiceData,
          jsonUrl,
        };
      })
    );

    return {
      isExcel: true,
      dataList,
      fileUrl,
    };
  }
}
