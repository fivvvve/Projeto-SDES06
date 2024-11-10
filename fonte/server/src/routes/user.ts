import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { env } from 'node:process';
import { prisma } from '../lib/prisma';
import { server } from '../lib/server'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

function sendEmail(email: string, text: string, texthtml: string) {
    const transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: `"IZZY Atividades" <${env.EMAIL_USER}>`,
        to: email,
        subject: `IZZY - Confirme seu email`,
        text: text,
        ... (texthtml && {
            html: texthtml
        })
    };

    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Não foi possível enviar o email');
        }
    });

    return;
}

//Cadastrar usuário
server.post("/user/create", async (req: Request, res: Response) => {

    //Dados do usuário a ser criado
    const { nome, email, senha } = req.body;

    try {

        const emailInUse = await prisma.user.count({
            where: {
                email: email
            }
        });

        if(emailInUse > 0) {
            res.status(409).send('Email já cadastrado');
            return;
        }

        const user = await prisma.cadastro.create({
            data: {
                email: email,
                nome: nome,
                senha: senha
            }
        });

        const text = `Acesse o link abaixo para ativar sua conta:\n\nhttp://localhost:5173/email-verify?token=${user.id}`
        const texthtml = `<h1>Acesse o link abaixo para ativar sua conta:</h1><br><a href='http://localhost:5173/email-verify?token=${user.id}'>http://localhost:5173/email-verify?token=${user.id}</a>`

        sendEmail(email, text, texthtml);

        res.status(200).send('Usuário cadastrado. Acesse seu email para confirmar seu cadastro');
        return;

    } catch (error: any) {

        res.status(400).send('Desculpe, não foi possível cadastrar o usuário. Tente novamente mais tarde');
        return;

    }
});

server.get("/ativacao", async (req: Request, res: Response) => {
    const { token } = req.query;

    try {
        
        const user = await prisma.cadastro.findFirstOrThrow({
            where: {
                id: String(token)
            }
        });

        await prisma.$transaction([
            prisma.user.create({
                data: {
                    email: user.email,
                    nome: user.nome,
                    senha: user.senha
                }
            }),
            
            prisma.cadastro.deleteMany({
                where: {
                    email: user.email
                }
            })
        ])

        res.status(200).send('Email confirmado');
        return;

    } catch (error: any) {

        if(error instanceof PrismaClientKnownRequestError) {
          if(error.code === 'P2025') {
            res.status(404).send('Token de usuário não encontrado');
            return;
          }
        }

        res.status(400).send('Desculpe, não foi possível confirmar o email. Tente novamente mais tarde');
        return;

    }
});

//Realizar login
server.post("/user/login", async (req: Request, res: Response) => {

    const { email, senha } = req.body;

    try {
        const user = await prisma.user.findFirstOrThrow({
            where: {
                email: email,
                senha: senha
            },
            select: {
                id: true,
                nome: true
            }
        });

        res.status(200).send({ id: user.id, name: user.nome });
        return;

    } catch (error){
            
        res.status(404).send('Email ou senha incorretos');
        return;

    }
});


//Atualizar usuário
server.patch("/user", async (req: Request, res: Response) => {

    const { id, nome, email, senha, novasenha } = req.body;

    try {
        await prisma.user.update({
            where: novasenha ? ({ 
                    id: id,
                    senha: senha
                }) : ({
                    id
                }),
            data: {
                ...(novasenha ? ({
                    nome,
                    senha: novasenha,
                }) : ({
                    nome,
                }))
            }
        });

        res.status(200).send({ nome });
        return;

    } catch (error) {

        if(error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            res.status(404).send('Senha inválida');
            return;
          }
          if (error.code === 'P2002') {
              res.status(409).send('Email já cadastrado');
              return;
          }
        }

        res.status(400).send('Desculpe, não foi possível alterar o usuário. Tente novamente mais tarde');
        return;
    }
});

//Deletar usuário
server.delete("/user", async (req: Request, res: Response) => {

    const { id, senha } = req.query;

    try {

        const user = await prisma.user.findFirstOrThrow({
            where: {
                id: String(id),
                senha: String(senha)
            }
        });

        const izzys = await prisma.user_izzy.findMany({
            where: {
                user_id: user.id,
                saiu: false
            },
            include: {
                izzy: true
            }
        });

        if (izzys) {
            for(let izzy of izzys) {
                const count = await prisma.user_izzy.count({
                    where: {
                        izzy_id: izzy.izzy_id,
                        saiu: false
                    }
                });


                if(count === 1) {
                    await prisma.izzy.delete({
                        where: {
                            id: izzy.izzy_id
                        }
                    });

                } else {
                    
                    let count_resp = await prisma.user_izzy.count({
                        where: {
                            izzy_id: izzy.izzy_id,
                            saiu: false,
                            responsavel: true
                        }
                    });

                    if(izzy.responsavel === true) {
                        count_resp -= 1;
                    }

                    if(count_resp === 0) {
                        const new_resp = await prisma.user_izzy.findFirstOrThrow({
                            where: {
                                NOT: {
                                    user_id: izzy.user_id,
                                },
                                saiu: false
                            }
                        });

                        await prisma.user_izzy.update({
                            where: {
                                user_id_izzy_id: {
                                    izzy_id: izzy.izzy_id,
                                    user_id: new_resp.user_id
                                }
                            },
                            data: {
                                responsavel: true
                            }
                        });
                    }

                    await prisma.user_izzy.update({
                        where: {
                            user_id_izzy_id: {
                                izzy_id: izzy.izzy_id,
                                user_id: izzy.user_id
                            }
                        },
                        data: {
                            saiu: true,
                            responsavel: false
                        }
                    });

                }
            }
        }

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                excluido: true
            }
        });

        res.status(200).send("Usuário excluido");
        return;

    } catch (error) {
        if(error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            res.status(404).send("Senha inválida");
            return;
          }
        }

        res.status(400).send('Desculpe, não foi possível remover o usuário. Tente novamente mais tarde');
        return;
    }
});

//Recuperar dados de um usuário
server.post("/user/data", async (req: Request, res: Response) => {

    //Filtros para busca de dados de um usuário
    const { id } = req.body;

    try {
        const user = await prisma.user.findFirstOrThrow({
            where: {
                id: String(id)
            },
            select: {
                nome: true,
                email: true
            }
        });

        res.status(200).send(user);
        return;

    } catch (error) {
        if(error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            res.status(404).send('Usuário inexistente');
            return;
          }
        }

        res.status(400).send('Desculpe, não foi possível buscar os dados do usuário. Tente novamente mais tarde');
        return;
    }
});

export default server;