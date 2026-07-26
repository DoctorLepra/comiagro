import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseInvoiceXmlUseCase } from '../../application/use-cases/parse-invoice-xml.use-case';
import { SupabaseAuthGuard } from '../../infrastructure/auth/supabase-auth.guard';

@Controller('invoices')
// @UseGuards(SupabaseAuthGuard) // Descomentar para proteger la ruta en producción
export class InvoiceController {
  constructor(private readonly parseInvoiceXmlUseCase: ParseInvoiceXmlUseCase) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadXml(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Ningún archivo fue subido');
    }

    if (file.mimetype !== 'text/xml' && file.mimetype !== 'application/xml') {
      throw new BadRequestException('El archivo debe ser un XML');
    }

    try {
      const parsedData = await this.parseInvoiceXmlUseCase.execute(file.buffer);

      return {
        message: 'XML procesado exitosamente',
        data: parsedData,
      };
    } catch (error: any) {
      console.error("Error en InvoiceController:", error);
      throw new BadRequestException(error.message || 'Error interno procesando el XML');
    }
  }
}
