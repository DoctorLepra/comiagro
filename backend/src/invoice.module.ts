import { Module } from '@nestjs/common';
import { InvoiceController } from './presentation/controllers/invoice.controller';
import { ParseInvoiceXmlUseCase } from './application/use-cases/parse-invoice-xml.use-case';
import { FastXmlParserAdapter } from './infrastructure/adapters/fast-xml-parser.adapter';
import { XML_PARSER_PORT } from './domain/ports/xml-parser.port';
import { CloudflareR2Adapter } from './infrastructure/adapters/cloudflare-r2.adapter';
import { STORAGE_PORT } from './domain/ports/storage.port';

@Module({
  controllers: [InvoiceController],
  providers: [
    ParseInvoiceXmlUseCase,
    {
      provide: XML_PARSER_PORT,
      useClass: FastXmlParserAdapter,
    },
    {
      provide: STORAGE_PORT,
      useClass: CloudflareR2Adapter,
    },
  ],
})
export class InvoiceModule {}
