import fs from 'fs';
import path from 'path';
import { Ticket, ManualOverride } from '../models/ticket.model';
import { seedTickets } from '../seed-data';

class StorageService {
  private tickets: Map<string, Ticket> = new Map();
  private storageFile: string;
  private autoSave: boolean;

  constructor(storageFile = 'data/tickets.json', autoSave = true) {
    this.storageFile = path.join(process.cwd(), storageFile);
    this.autoSave = autoSave;
    this.loadFromDisk();
    this.loadSeedDataIfEmpty();
  }
  
  private loadSeedDataIfEmpty(): void {
    if (this.tickets.size === 0) {
      console.log('Loading seed data...');
      seedTickets.forEach(ticket => {
        this.tickets.set(ticket.id, ticket);
      });
      console.log(`Loaded ${seedTickets.length} seed tickets`);
    }
  }

  async saveTicket(ticket: Ticket): Promise<Ticket> {
    ticket.updatedAt = new Date();
    this.tickets.set(ticket.id, ticket);
    
    if (this.autoSave) {
      await this.persistToDisk();
    }
    
    return ticket;
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    return this.tickets.get(id) || null;
  }

  async getAllTickets(filter?: {
    status?: string;
    queue?: string;
    customerType?: string;
  }): Promise<Ticket[]> {
    let tickets = Array.from(this.tickets.values());

    if (filter) {
      if (filter.status) {
        tickets = tickets.filter(t => t.status === filter.status);
      }
      if (filter.queue) {
        tickets = tickets.filter(t => t.routingDecision?.targetQueue === filter.queue);
      }
      if (filter.customerType) {
        tickets = tickets.filter(t => t.input.customerType === filter.customerType);
      }
    }

    return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async addOverride(ticketId: string, override: ManualOverride): Promise<Ticket | null> {
    const ticket = await this.getTicketById(ticketId);
    if (!ticket) {
      return null;
    }

    ticket.overrideHistory.push(override);
    ticket.updatedAt = new Date();
    
    return await this.saveTicket(ticket);
  }

  async getTicketsByQueue(queue: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values())
      .filter(t => t.routingDecision?.targetQueue === queue);
  }

  private async persistToDisk(): Promise<void> {
    try {
      const dir = path.dirname(this.storageFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const data = Array.from(this.tickets.values());
      fs.writeFileSync(this.storageFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to persist to disk:', error);
    }
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.storageFile)) {
        const data = fs.readFileSync(this.storageFile, 'utf-8');
        const tickets: Ticket[] = JSON.parse(data);
        
        tickets.forEach(ticket => {
          ticket.createdAt = new Date(ticket.createdAt);
          ticket.updatedAt = new Date(ticket.updatedAt);
          if (ticket.aiAnalysis) {
            ticket.aiAnalysis.timestamp = new Date(ticket.aiAnalysis.timestamp);
          }
          if (ticket.routingDecision) {
            ticket.routingDecision.timestamp = new Date(ticket.routingDecision.timestamp);
          }
          ticket.overrideHistory.forEach(override => {
            override.timestamp = new Date(override.timestamp);
          });
          
          this.tickets.set(ticket.id, ticket);
        });

        console.log(`Loaded ${tickets.length} tickets from disk`);
      }
    } catch (error) {
      console.error('Failed to load from disk:', error);
    }
  }

  async clear(): Promise<void> {
    this.tickets.clear();
    if (this.autoSave) {
      await this.persistToDisk();
    }
  }

  async getStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byQueue: Record<string, number>;
  }> {
    const tickets = Array.from(this.tickets.values());
    
    const byStatus: Record<string, number> = {};
    const byQueue: Record<string, number> = {};

    tickets.forEach(ticket => {
      byStatus[ticket.status] = (byStatus[ticket.status] || 0) + 1;
      
      if (ticket.routingDecision) {
        const queue = ticket.routingDecision.targetQueue;
        byQueue[queue] = (byQueue[queue] || 0) + 1;
      }
    });

    return {
      total: tickets.length,
      byStatus,
      byQueue
    };
  }
}

export const storageService = new StorageService();

