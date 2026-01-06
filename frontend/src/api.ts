/**
 * API client for communicating with the backend
 */

import axios from 'axios';
import { Ticket, TicketInput, QueueStats, TeamQueue } from './types';

const API_BASE = '/api';

export const api = {
  // Tickets
  async createTicket(input: TicketInput): Promise<Ticket> {
    const response = await axios.post(`${API_BASE}/tickets`, input);
    return response.data.ticket;
  },

  async getTickets(filter?: {
    status?: string;
    queue?: string;
    customerType?: string;
  }): Promise<Ticket[]> {
    const response = await axios.get(`${API_BASE}/tickets`, { params: filter });
    return response.data.tickets;
  },

  async getTicket(id: string): Promise<Ticket> {
    const response = await axios.get(`${API_BASE}/tickets/${id}`);
    return response.data.ticket;
  },

  async overrideRouting(
    ticketId: string,
    newQueue: TeamQueue,
    reason: string,
    overriddenBy: string
  ): Promise<Ticket> {
    const response = await axios.post(`${API_BASE}/tickets/${ticketId}/override`, {
      newQueue,
      reason,
      overriddenBy
    });
    return response.data.ticket;
  },

  // Queues
  async getQueues(): Promise<QueueStats[]> {
    const response = await axios.get(`${API_BASE}/queues`);
    return response.data.queues;
  },

  async getQueueTickets(queueName: TeamQueue): Promise<Ticket[]> {
    const response = await axios.get(`${API_BASE}/queues/${queueName}`);
    return response.data.tickets;
  },

  // System
  async getHealth(): Promise<any> {
    const response = await axios.get(`${API_BASE}/system/health`);
    return response.data;
  },

  async getStats(): Promise<any> {
    const response = await axios.get(`${API_BASE}/system/stats`);
    return response.data;
  }
};

