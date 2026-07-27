export interface InvoiceItemData {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceData {
  cufe: string;
  issueDate: string;
  totalAmount: number;
  taxAmount: number;
  companyNit: string;
  companyName: string;
  customerNit?: string;
  customerName?: string;
  documentType?: 'FACTURA_ELECTRONICA' | 'NOTA_DEBITO' | 'NOTA_CREDITO';
  items: InvoiceItemData[];
  rawJson?: any; // Contiene toda la información cruda del XML
}
