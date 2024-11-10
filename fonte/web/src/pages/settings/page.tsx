import { IoTrashOutline as Trash } from 'react-icons/io5'
import { TbLockCog as Lock } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../components/button'

export function Settings() {
  const navigate = useNavigate()

  function handleNavigateToExcludeAccount() {
    navigate('exclude-account')
  }

  function handleNavigateToChangePassword() {
    navigate('change-password')
  }

  return (
    <div className="mt-6 flex gap-10">
      <Button
        onClick={handleNavigateToExcludeAccount}
        variant="danger"
        className="flex items-center gap-2 px-20 py-2.5"
      >
        <Trash className="h-5 w-5" />
        Excluir Conta
      </Button>
      <Button
        onClick={handleNavigateToChangePassword}
        className="flex items-center gap-2 px-20 py-2.5"
      >
        <Lock className="h-5 w-5" />
        Alterar Senha
      </Button>
    </div>
  )
}
