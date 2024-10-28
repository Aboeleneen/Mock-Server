export interface CreateNewTicketRequest {
    terminal: string;
    ticketType: string;
    subTicketType: string;
    description: string;
    channel: string;
    images: string[];
}

export interface TicketsQueryRequest {
    identifier_Type: string;
    identifier_Value: string;
    page: number;
    fromdate: string;
    todate: string;
    calltype: string;
    subcalltype: string;
    ticketstatus: number;
    numberofpages: number;
}

export interface TicketDetails {
    ticket_id: string;
    store_id?: string;
    terminal_id: string;
    terminal_City: string;
    ticket_type: string;
    calltypeid: string;
    bank: string;
    terminal_status: string;
    ticket_status: string;
    open_date: string;
    close_date: string;
    location: string;
    last_response_remarks: string;
    terminal_Type: string;
    cr_number: string;
    store_name: string;
    subCalltype: string;
    subCalltypeId: string;
}

export interface TerminalDetails {
    terminalID: string;
    storeID: string;
    installationDate: string;
    storeName: string;
    terminalCity: string;
    location: string;
    terminalSerialNumber: string | null;
    terminalTypeModel: string;
    terminalStatus: string;
    merchantName: string;
    merchantContactNo: string;
    merchantMobile: string;
    merchantTel: string;
    bank: string;
    simCarrier: string | null;
    cardSchemeSupported: string;
    address: string;
    longitude: string;
    latitude: string;
}
