import { api } from '../lib/axios'

interface EmailVerifyBody {
  tokenId: string
}

export async function emailVerify({ tokenId }: EmailVerifyBody) {
  await api.get('/ativacao', {
    params: {
      token: tokenId,
    },
  })
}
