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

  it('should extract NIT from cbc:CompanyID inside PartyTaxScheme', async () => {
    const mockXml = `
      <Invoice xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2">
        <cbc:UUID>CUFE-99999</cbc:UUID>
        <cbc:IssueDate>2026-07-11</cbc:IssueDate>
        <cac:AccountingSupplierParty>
          <cac:Party>
            <cac:PartyTaxScheme>
              <cbc:RegistrationName font-weight="bold">D1 S A S</cbc:RegistrationName>
              <cbc:CompanyID schemeID="1" schemeName="31">900276962</cbc:CompanyID>
            </cac:PartyTaxScheme>
          </cac:Party>
        </cac:AccountingSupplierParty>
      </Invoice>
    `;

    const result = await adapter.parseInvoice(mockXml);

    expect(result.companyName).toBe('D1 S A S');
    expect(result.companyNit).toBe('900276962');
  });

  it('should parse a DebitNote XML structure correctly', async () => {
    const mockDebitNoteXml = `
      <AttachedDocument xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2">
        <cac:Attachment>
          <cac:ExternalReference>
            <cbc:Description><![CDATA[<?xml version="1.0" encoding="UTF-8"?><DebitNote xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2">
              <cbc:ProfileID>DIAN 2.1: Nota Debito de Factura Electrónica de Venta</cbc:ProfileID>
              <cbc:UUID>CUDE-DEBIT-9092</cbc:UUID>
              <cbc:IssueDate>2026-07-15</cbc:IssueDate>
              <cac:AccountingSupplierParty>
                <cac:Party>
                  <cac:PartyTaxScheme>
                    <cbc:RegistrationName>BMC BOLSA MERCANTIL DE COLOMBIA S.A.</cbc:RegistrationName>
                    <cbc:CompanyID>860071250</cbc:CompanyID>
                  </cac:PartyTaxScheme>
                </cac:Party>
              </cac:AccountingSupplierParty>
              <cac:AccountingCustomerParty>
                <cac:Party>
                  <cac:PartyTaxScheme>
                    <cbc:RegistrationName>COMISIONISTAS AGROPECUARIOS SA</cbc:RegistrationName>
                    <cbc:CompanyID>800206442</cbc:CompanyID>
                  </cac:PartyTaxScheme>
                </cac:Party>
              </cac:AccountingCustomerParty>
              <cac:RequestedMonetaryTotal>
                <cbc:PayableAmount>209421.00</cbc:PayableAmount>
              </cac:RequestedMonetaryTotal>
              <cac:TaxTotal>
                <cbc:TaxAmount>33437.00</cbc:TaxAmount>
              </cac:TaxTotal>
              <cac:DebitNoteLine>
                <cbc:DebitedQuantity>1.00</cbc:DebitedQuantity>
                <lineExtensionAmount>175984.00</lineExtensionAmount>
                <cac:Item>
                  <cbc:Description>Ajuste Nota Débito Servicio</cbc:Description>
                </cac:Item>
                <cac:Price>
                  <cbc:PriceAmount>175984.00</cbc:PriceAmount>
                </cac:Price>
              </cac:DebitNoteLine>
            </DebitNote>]]></cbc:Description>
          </cac:ExternalReference>
        </cac:Attachment>
      </AttachedDocument>
    `;

    const result = await adapter.parseInvoice(mockDebitNoteXml);

    expect(result).toBeDefined();
    expect(result.documentType).toBe('NOTA_DEBITO');
    expect(result.companyName).toBe('BMC BOLSA MERCANTIL DE COLOMBIA S.A.');
    expect(result.companyNit).toBe('860071250');
    expect(result.customerName).toBe('COMISIONISTAS AGROPECUARIOS SA');
    expect(result.customerNit).toBe('800206442');
    expect(result.totalAmount).toBe(209421.00);
    expect(result.taxAmount).toBe(33437.00);
    expect(result.items.length).toBe(1);
    expect(result.items[0].description).toBe('Ajuste Nota Débito Servicio');
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
