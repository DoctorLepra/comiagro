import { XlsxParserAdapter } from './xlsx-parser.adapter';
import * as XLSX from 'xlsx';

describe('XlsxParserAdapter', () => {
  let adapter: XlsxParserAdapter;

  beforeEach(() => {
    adapter = new XlsxParserAdapter();
  });

  it('should parse an Excel buffer with 32 DIAN columns correctly', () => {
    // Generar un buffer Excel simulado en memoria
    const data = [
      {
        'Tipo de documento': 'Factura Electrónica de Venta',
        'CUFE/CUDE': 'cufe-excel-123456',
        'Folio': '1001',
        'Prefijo': 'FE',
        'Divisa': 'COP',
        'Forma de Pago': 'Contado',
        'Medio de Pago': 'Efectivo',
        'Fecha Emisión': '2026-07-26',
        'Fecha Recepción': '2026-07-26',
        'NIT Emisor': '900276962',
        'Nombre Emisor': 'D1 S.A.S',
        'NIT Receptor': '800206442',
        'Nombre Receptor': 'COMISIONISTAS AGROPECUARIOS SA',
        'IVA': 19000,
        'ICA': 0,
        'IC': 0,
        'INC': 0,
        'Timbre': 0,
        'INC Bolsas': 0,
        'IN Carbono': 0,
        'IN Combustibles': 0,
        'IC Datos': 0,
        'ICL': 0,
        'INPP': 0,
        'IBUA': 0,
        'ICUI': 0,
        'Rete IVA': 0,
        'Rete Renta': 0,
        'Rete ICA': 0,
        'Total': 119000,
        'Estado': 'Validada',
        'Grupo': 'General',
      },
      {
        'Tipo de documento': 'Nota Débito',
        'CUFE/CUDE': 'cude-debit-999',
        'Folio': '9092',
        'Prefijo': 'ND',
        'Divisa': 'COP',
        'Forma de Pago': 'Crédito',
        'Medio de Pago': 'Transferencia',
        'Fecha Emisión': '2026-07-26',
        'Fecha Recepción': '2026-07-26',
        'NIT Emisor': '860071250',
        'Nombre Emisor': 'BMC BOLSA MERCANTIL DE COLOMBIA S.A.',
        'NIT Receptor': '800206442',
        'Nombre Receptor': 'COMISIONISTAS AGROPECUARIOS SA',
        'IVA': 33437,
        'Total': 209421,
        'Estado': 'Validada',
        'Grupo': 'Bolsa',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Facturas');
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const results = adapter.parseExcel(excelBuffer);

    expect(results).toBeDefined();
    expect(results.length).toBe(2);

    // Primera factura
    expect(results[0].documentType).toBe('FACTURA_ELECTRONICA');
    expect(results[0].cufe).toBe('cufe-excel-123456');
    expect(results[0].companyName).toBe('D1 S.A.S');
    expect(results[0].companyNit).toBe('900276962');
    expect(results[0].customerName).toBe('COMISIONISTAS AGROPECUARIOS SA');
    expect(results[0].customerNit).toBe('800206442');
    expect(results[0].totalAmount).toBe(119000);
    expect(results[0].taxAmount).toBe(19000);

    // Segunda factura (Nota Débito)
    expect(results[1].documentType).toBe('NOTA_DEBITO');
    expect(results[1].cufe).toBe('cude-debit-999');
    expect(results[1].companyName).toBe('BMC BOLSA MERCANTIL DE COLOMBIA S.A.');
    expect(results[1].companyNit).toBe('860071250');
    expect(results[1].totalAmount).toBe(209421);
    expect(results[1].taxAmount).toBe(33437);
  });
});
