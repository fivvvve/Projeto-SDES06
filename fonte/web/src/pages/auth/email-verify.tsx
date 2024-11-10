import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { emailVerify } from '../../api/email-verify'

export function EmailVerify() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const tokenId = searchParams.get('token')

  const { mutateAsync: emailVerifyFn } = useMutation({
    mutationKey: ['email-verify'],
    mutationFn: emailVerify,
    onSuccess: () => {
      navigate('/sign-in?email-verified=true')
    },
    retry: false,
  })

  useEffect(() => {
    if (tokenId) {
      emailVerifyFn({ tokenId })
    }
  }, [tokenId])

  return null
}
