import { FastXmlParserAdapter } from './fast-xml-parser.adapter';

describe('FastXmlParserAdapter', () => {
  let adapter: FastXmlParserAdapter;

  beforeEach(() => {
    adapter = new FastXmlParserAdapter();
  });

  it('should parse a simple valid DIAN UBL 2.1 XML structure', async () => {
    const mockXml = `
      <Invoice xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2">
        <cbc:UUID>CUFE-12345-ABCDE</cbc:UUID>
        <cbc:IssueDate>2023-10-01</cbc:IssueDate>
        <cac:AccountingSupplierParty>
          <cac:Party>
            <cac:PartyName>
              <cbc:Name>Empresa Agro S.A.</cbc:Name>
            </cac:PartyName>
            <cac:PartyIdentification>
              <cbc:ID>900123456</cbc:ID>
            </cac:PartyIdentification>
          </cac:Party>
        </cac:AccountingSupplierParty>
        <cac:LegalMonetaryTotal>
          <cbc:PayableAmount>150000.50</cbc:PayableAmount>
        </cac:LegalMonetaryTotal>
        <cac:TaxTotal>
          <cbc:TaxAmount>28500.00</cbc:TaxAmount>
        </cac:TaxTotal>
        <cac:InvoiceLine>
          <cbc:InvoicedQuantity>10</cbc:InvoicedQuantity>
          <cbc:LineExtensionAmount>150000.50</cbc:LineExtensionAmount>
          <cac:Price>
            <cbc:PriceAmount>15000.05</cbc:PriceAmount>
          </cac:Price>
          <cac:Item>
            <cbc:Description>Fertilizante Orgánico</cbc:Description>
          </cac:Item>
        </cac:InvoiceLine>
      </Invoice>
    `;

    const result = await adapter.parseInvoice(mockXml);

    expect(result).toBeDefined();
    expect(result.cufe).toBe('CUFE-12345-ABCDE');
    expect(result.issueDate).toBe('2023-10-01');
    expect(result.totalAmount).toBe(150000.50);
    expect(result.taxAmount).toBe(28500.00);
    expect(result.companyName).toBe('Empresa Agro S.A.');
    expect(result.companyNit).toBe('900123456');
    expect(result.items.length).toBe(1);
    expect(result.items[0].description).toBe('Fertilizante Orgánico');
    expect(result.items[0].quantity).toBe(10);
    expect(result.items[0].unitPrice).toBe(15000.05);
    expect(result.items[0].totalPrice).toBe(150000.50);
  });

  it('should handle XML with missing fields gracefully', async () => {
    const mockXml = `
      <Invoice>
        <cbc:IssueDate>2023-10-02</cbc:IssueDate>
      </Invoice>
    `;

    const result = await adapter.parseInvoice(mockXml);

    expect(result).toBeDefined();
    expect(result.cufe).toBe('CUFE_NO_ENCONTRADO');
    expect(result.issueDate).toBe('2023-10-02');
    expect(result.totalAmount).toBe(0);
    expect(result.companyNit).toBe('000000000');
  });

  it('should throw an error for completely invalid XML', async () => {
    const invalidXml = `<<Invoice>This is not valid`;

    await expect(adapter.parseInvoice(invalidXml)).rejects.toThrow('Formato XML inválido o ilegible.');
  });
});
