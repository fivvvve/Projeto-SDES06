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
  console.log('Executando tarefa agendada todos os dias à meia-noite');
});

app.listen(PORT, () => {
  console.log(`Server running on port: http://localhost:${PORT}`)
})
