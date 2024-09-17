'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useWallet } from '@/app/context/WalletContext'
import { useRouter } from 'next/navigation'
import { logoutAction } from '@/app/actions/logoutAction'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

interface UserProfileDropdownProps {
  email: string
}

export function UserProfileDropdown({ email }: UserProfileDropdownProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { isWalletConnected, getBSVBalance } = useWallet()
  const [balanceChange, setBalanceChange] = useState<'increase' | 'decrease' | null>(null)
  const prevBalanceRef = useRef<number | null>(null)

  const handleLogout = async () => {
    await logoutAction()
    router.push('/auth')
    setOpen(false)
  }

  const bsvBalance = isWalletConnected ? getBSVBalance() : null
  const formattedBalance = bsvBalance
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
        .format(bsvBalance.fiatEquivalent.units)
    : null

    useEffect(() => {
        if (bsvBalance) {
          const currentBalance = bsvBalance.fiatEquivalent.units
          const previousBalance = prevBalanceRef.current
      
          if (previousBalance !== null) {
            if (currentBalance > previousBalance) {
              setBalanceChange('increase')
            } else if (currentBalance < previousBalance) {
              setBalanceChange('decrease')
            }
          }
      
          // Update prevBalanceRef.current after comparison
          prevBalanceRef.current = currentBalance
      
          // Reset the balance change indicator after 1 second
          const timer = setTimeout(() => setBalanceChange(null), 1000)
          return () => clearTimeout(timer)
        }
      }, [bsvBalance])

  const getBalanceColor = () => {
    if (balanceChange === 'increase') return 'text-green-500'
    if (balanceChange === 'decrease') return 'text-red-500'
    return 'text-muted-foreground'
  }

  return (
    <div className="flex items-center space-x-4">
      {isWalletConnected && formattedBalance && (
        <div className="flex items-center space-x-1">
          <span className={`text-sm font-medium transition-colors duration-500 ${getBalanceColor()}`}>
            Balance: {formattedBalance}
          </span>
          {balanceChange && (
            <span className={`transition-opacity duration-500 ${balanceChange === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
              {balanceChange === 'increase' ? (
                <ArrowUpIcon className="h-4 w-4 animate-bounce" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 animate-bounce" />
              )}
            </span>
          )}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="flex flex-col space-y-4">
            <p className="text-sm font-medium leading-none">{email}</p>
            {isWalletConnected && formattedBalance && (
              <p className={`text-xs ${getBalanceColor()}`}>
                Balance: {formattedBalance}
              </p>
            )}
            <Button onClick={handleLogout} variant="outline">
              Log out
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}