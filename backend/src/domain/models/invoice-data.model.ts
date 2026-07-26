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
  items: InvoiceItemData[];
  rawJson?: any; // Contiene toda la información cruda del XML
}
