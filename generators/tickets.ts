import { faker } from "@faker-js/faker";
import { CreateNewTicketRequest, TerminalDetails, TicketDetails, TicketsQueryRequest } from "../interfaces/tickets";
import { writeFileSync } from 'fs'; // Add file system imports
import { TICKET_STATUS } from "../constants";
import { readFileSync } from "jsonfile";
import dayjs from 'dayjs'; // Import dayjs

// Simulate ticket creation logic
/**
 * Simulates the creation of a new ticket in the Epos system.
 * @param {CreateNewTicketRequest} ticketRequest - The request object containing ticket details.
 * @returns {string} The ID of the newly created ticket.
 */
export const createNewTicket = (ticketRequest: CreateNewTicketRequest): string => {
    const terminal = getTerminalById(ticketRequest.terminal);
    const newTicket: TicketDetails = {
        ticket_id: faker.string.uuid(),
        store_id: terminal?.storeID,
        terminal_id: ticketRequest.terminal,
        terminal_City: faker.location.city(),
        ticket_type: ticketRequest.ticketType, // Use ticketType from request
        calltypeid: ticketRequest.ticketType,
        bank: faker.finance.iban(),
        terminal_status: faker.lorem.sentence(),
        ticket_status: faker.helpers.arrayElement(TICKET_STATUS),
        open_date: dayjs().format('DD/MMM/YYYY'), // Set formatted date using dayjs
        close_date: "", // Set close_date as empty
        location: faker.location.city(),
        last_response_remarks: ticketRequest.description,
        terminal_Type: faker.lorem.sentence(),
        cr_number: faker.string.uuid(),
        store_name: faker.company.name(),
        subCalltype: ticketRequest.subTicketType, // Use subTicketType from request
        subCalltypeId: ticketRequest.subTicketType,
    };

    // Read existing tickets
    const tickets: TicketDetails[] = readFileSync('data/tickets.json');

    // Add new ticket to the list
    tickets.push(newTicket);

    // Write updated tickets back to the file
    writeFileSync("data/tickets.json", JSON.stringify(tickets), 'utf8');

    return newTicket.ticket_id; // Return the ID of the newly created ticket
}

// Retrieves a list of tickets based on query parameters
/**
 * Simulates fetching a list of tickets from the Epos system.
 * @param {TicketsQueryRequest} request - The request object containing query parameters.
 * @returns {Object} An object containing the total number of tickets and the filtered ticket details.
 */
export const getTicketsList = (request: TicketsQueryRequest) => {
    const tickets: TicketDetails[] = readFileSync('data/tickets.json');

    // Map ticket status to values
    const statusMap: { [key: string]: number } = {
        "pending": 1,
        "cancelled": 2,
        "done": 3
    };

    // Filter tickets based on request parameters
    const filteredTickets = tickets.filter((ticket: TicketDetails) => {
        return (
            ((request.identifier_Type === 'StoreID' && ticket.store_id === request.identifier_Value) ||
                (request.identifier_Type === 'TerminalID' && ticket.ticket_id === request.identifier_Value)) &&
            // Optional filters
            (!request.fromdate || !request.todate || (ticket.open_date >= request.fromdate && ticket.open_date <= request.todate)) && // Date range filter
            (!request.ticketstatus || request.ticketstatus === 0 || statusMap[ticket.ticket_status] === request.ticketstatus) && // Ticket status filter
            (!request.calltype || ticket.calltypeid === request.calltype) && // Call type filter
            (!request.subcalltype || ticket.subCalltypeId === request.subcalltype) // Sub call type filter
        );
    });
    const totalOfTickets = filteredTickets.length;
    // Implement pagination
    const startIndex = (request.page - 1) * request.numberofpages;
    const paginatedTickets = filteredTickets.slice(startIndex, startIndex + request.numberofpages);

    // Simulate Epos response
    return {
        "Error Code": "EIPAD1000",
        "Description": "None",
        "Merchant Name": null,
        "Total Of Tickets": totalOfTickets,
        "Ticket_details": paginatedTickets.map(ticket => ({
            ...ticket,
            open_date: new Date(ticket.open_date).toLocaleDateString('pt-BR')
        }))
    };
}

// Retrieves terminals for a specific store
/**
 * Simulates retrieving terminal details for a given store in the Epos system.
 * If no terminals are found, a new terminal is created.
 * @param {string} storeId - The ID of the store to retrieve terminals for.
 * @returns {TerminalDetails[]} An array of terminal details for the specified store.
 */
export const getStoreTerminals = (storeId: string): TerminalDetails[] => {
    const terminals: TerminalDetails[] = readFileSync('data/terminals.json');

    const foundTerminals = terminals.filter((terminal: TerminalDetails) => terminal.storeID === storeId);

    // Check if no terminals were found
    if (foundTerminals.length === 0) {
        const newTerminal: TerminalDetails = {
            terminalID: faker.string.alphanumeric(),
            storeID: storeId,
            installationDate: new Date().toISOString(), // Set current date
            storeName: "New Store", // Placeholder for store name
            terminalCity: "Unknown City", // Placeholder for city
            location: "Unknown Location", // Placeholder for location
            terminalSerialNumber: faker.string.alphanumeric(), // Set as null
            terminalTypeModel: "PAX A920", // Default model
            terminalStatus: "INSTALLED", // Default status
            merchantName: "New Merchant", // Placeholder for merchant name
            merchantContactNo: "0000000000", // Placeholder for contact number
            merchantMobile: "0000000000", // Placeholder for mobile number
            merchantTel: "0000000000", // Placeholder for telephone number
            bank: "Default Bank", // Placeholder for bank
            simCarrier: "", // Placeholder for SIM carrier
            cardSchemeSupported: "Mada,Maestro,Amex,Refund", // Default supported schemes
            address: "Default Address", // Placeholder for address
            longitude: "0.00000000", // Placeholder for longitude
            latitude: "0.00000000" // Placeholder for latitude
        };

        // Add the new terminal to the list
        terminals.push(newTerminal);
        foundTerminals.push(newTerminal);
        // Write updated terminals back to the file
        writeFileSync("data/terminals.json", JSON.stringify(terminals), 'utf8');
    }

    return foundTerminals; // Return found terminals or the new one
}

// Retrieves a terminal by its ID
/**
 * Simulates fetching terminal details by terminal ID from the Epos system.
 * @param {string} terminalId - The ID of the terminal to retrieve.
 * @returns {TerminalDetails | null} The terminal details if found, otherwise null.
 */
export const getTerminalById = (terminalId: string): TerminalDetails | null => {
    const terminals = readFileSync('data/terminals.json');

    // Find the terminal by ID
    const foundTerminal = terminals.find((terminal: TerminalDetails) => terminal.terminalID === terminalId);

    return foundTerminal || null; // Return the found terminal or null if not found
}

