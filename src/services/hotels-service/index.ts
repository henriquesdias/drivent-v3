import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError, unauthorizedError } from "@/errors";

async function getAllHotels(id: number) {
  const ticket = await ticketRepository.findTicketByTicketTypeAndUserId(id);

  if (!ticket) {
    throw notFoundError();
  }
  if (ticket.status !== "PAID" || !ticket.TicketType.includesHotel || ticket.TicketType.isRemote) {
    throw unauthorizedError();
  }
  return hotelRepository.findMany();
}

const hotelsService = {
  getAllHotels,
};

export default hotelsService;
