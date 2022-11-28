import app, { init } from "@/app";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import { createUser } from "../factories";
import * as jwt from "jsonwebtoken";
import { prisma } from "@/config";
import { date } from "joi";

beforeAll(async () => {
  await init();
  await cleanDb();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/enrollments").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/enrollments").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 200 and with existing hotels data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await prisma.enrollment.create({
        data: {
          name: "user",
          cpf: "123",
          birthday: faker.date.past(),
          phone: "123456",
          userId: user.id,
        },
      });
      const ticketType = await prisma.ticketType.create({
        data: {
          name: "nice ticket",
          price: 120,
          isRemote: false,
          includesHotel: true,
        },
      });
      const ticket = await prisma.ticket.create({
        data: {
          ticketTypeId: ticketType.id,
          enrollmentId: enrollment.id,
          status: "PAID",
        },
      });

      const hotels = await prisma.hotel.create({
        data: {
          name: "nice hotel",
          image: "nice image",
        },
      });

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([
        {
          id: expect.any(Number),
          name: hotels.name,
          image: hotels.image,
          createdAt: hotels.createdAt.toISOString(),
          updatedAt: hotels.updatedAt.toISOString(),
        },
      ]);
    });

    it("should respond with status 401 if ticket is not paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await prisma.enrollment.create({
        data: {
          name: "user",
          cpf: "123",
          birthday: faker.date.past(),
          phone: "123456",
          userId: user.id,
        },
      });
      const ticketType = await prisma.ticketType.create({
        data: {
          name: "nice ticket",
          price: 120,
          isRemote: false,
          includesHotel: true,
        },
      });
      const ticket = await prisma.ticket.create({
        data: {
          ticketTypeId: ticketType.id,
          enrollmentId: enrollment.id,
          status: "RESERVED",
        },
      });

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    it("should respond with status 404 when user doesnt have an enrollment yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user doesnt have a ticket yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await prisma.enrollment.create({
        data: {
          name: "user",
          cpf: "123",
          birthday: faker.date.past(),
          phone: "123456",
          userId: user.id,
        },
      });

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });
});
