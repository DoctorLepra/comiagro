import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseInvoiceXmlUseCase } from '../../application/use-cases/parse-invoice-xml.use-case';
import { ParseInvoiceExcelUseCase } from '../../application/use-cases/parse-invoice-excel.use-case';

@Controller('invoices')
export class InvoiceController {
  constructor(
    private readonly parseInvoiceXmlUseCase: ParseInvoiceXmlUseCase,
    private readonly parseInvoiceExcelUseCase: ParseInvoiceExcelUseCase,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadXml(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Ningún archivo fue subido');
    }

    const fileName = (file.originalname || '').toLowerCase();
    const isXml = file.mimetype === 'text/xml' || file.mimetype === 'application/xml' || fileName.endsWith('.xml');
    const isExcel = file.mimetype.includes('spreadsheetml') || file.mimetype.includes('excel') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isXml && !isExcel) {
      throw new BadRequestException('El archivo debe ser un XML (.xml) o una plantilla Excel (.xlsx / .xls)');
    }

    try {
      if (isExcel) {
        const excelResult = await this.parseInvoiceExcelUseCase.execute(file.buffer);
        return {
          message: 'Excel procesado exitosamente',
          ...excelResult,
        };
      }

      const parsedData = await this.parseInvoiceXmlUseCase.execute(file.buffer);

      return {
        message: 'XML procesado exitosamente',
        data: parsedData,
      };
    } catch (error: any) {
      console.error("Error en InvoiceController:", error);
      throw new BadRequestException(error.message || 'Error interno procesando el archivo');
    }
  }
}
