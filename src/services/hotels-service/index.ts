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
async function getRoomsFromHotelById(hotelId: number, userId: number) {
  const ticket = await ticketRepository.findTicketByTicketTypeAndUserId(userId);

  if (!ticket) {
    throw notFoundError();
  }
  if (ticket.status !== "PAID" || !ticket.TicketType.includesHotel || ticket.TicketType.isRemote) {
    throw unauthorizedError();
  }
  const rooms = await hotelRepository.findManyRooms(hotelId);
  if (!rooms) throw notFoundError();

  return rooms;
}

const hotelsService = {
  getAllHotels,
  getRoomsFromHotelById,
};

export default hotelsService;
