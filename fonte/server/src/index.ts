import express from 'express'
import cors from 'cors'
import user from './routes/user'
import izzy from './routes/izzy'
import atividade from './routes/atividade'
import { prisma } from './lib/prisma'
import { env } from 'node:process'
import cron from "node-cron"

const PORT = env.PORT || 5000
const app = express()

// const whitelist = [env.ALLOWED_LINKS]

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) {
//         callback(new Error('Origin not defined'))
//       }

//       if (whitelist.includes(String(origin))) {
//         callback(null, origin)
//       } else {
//         callback(new Error('Origin not allowed'))
//       }
//     },
//   }),
// )

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(user)
app.use(izzy)
app.use(atividade)

// Agendando uma tarefa para ser executada diariamente à meia-noite
cron.schedule('0 0 * * *', async () => {

  try {

    console.log('Executando tarefa agendada todos os dias à meia-noite');
    const diaAnterior = new Date();
    diaAnterior.setUTCDate(diaAnterior.getUTCDate()-1);
    diaAnterior.setUTCHours(0, 0, 0, 0);

    const dias_semana_int = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];

    const dataAtual = new Date();
    dataAtual.setUTCHours(0, 0, 0, 0);
    
    const dataLimite = new Date(dataAtual);
    dataLimite.setUTCDate(dataLimite.getUTCDate()+6);
    const diaLimite = dias_semana_int[dataLimite.getUTCDay()];

    await prisma.atividade_user.updateMany({
        where: {
            data_limite: diaAnterior,
            status: "Pendente"
        },
        data: {
            status: "Atrasada"
        }
    });

    const atividades = await prisma.atividade.findMany({
      where: {
        tipo: "Iterativa",
        data_inicio: {
          lt: dataAtual
        },
        OR: [
          {
            data_final: null
          },
          {
            data_final: {
              gte: dataLimite
            }
          }
        ]
      },
      include: {
        users: true,
        dias_semana: true,
        criador: true,
        izzy: true
      }
    });

    const atividadesInsert: { user_id: string; atividade_id: string; data_limite: Date }[] = [];
    atividades.forEach( async atividade => {
      if(atividade.dias_semana.some(dia => dia.dia === diaLimite)) {
        atividade.users.forEach(user => {
          atividadesInsert.push({
            user_id: user.user_id,
            atividade_id: atividade.id,
            data_limite: dataLimite
          })
        })
      }
    });

    await prisma.atividade_user.createMany({
      data: atividadesInsert
    })

  } catch (error) {
    console.log(error);
  }

}, {
  timezone: "America/Sao_Paulo"
});

app.listen(PORT, () => {
  console.log(`Server running on port: http://localhost:${PORT}`)
})
