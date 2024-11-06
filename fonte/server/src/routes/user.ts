import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { env } from 'node:process';
import { prisma } from '../lib/prisma';
import { server } from '../lib/server'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export default server;