import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => new PrismaClient();
const prisma = global.prisma ?? prismaClientSingleton();
global.prisma = prisma;

export default prisma;
