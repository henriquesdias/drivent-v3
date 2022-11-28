import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotels, getRooms } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter.get("/", getHotels).get("/:hotelId", getRooms);

export { hotelsRouter };
