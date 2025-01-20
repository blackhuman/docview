'use client'
import type { NextPage } from "next"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/utils/supabase/client"
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, User } from "@nextui-org/react";
import { useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
}


const Page: NextPage<Props> = (props) => {
  const [user, setUser] = useState<SupabaseUser | null>(null) 

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) {
      console.error('Error signing in:', error.message)
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error.message)
    } else {
      setUser(null)
    }
    router.refresh()
  }

  return (
    <div className={`flex justify-end items-center p-4 ${props.className}`}>
      {user ? (
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <User
              as="button"
              avatarProps={{
                src: user.user_metadata.avatar_url,
                size: "sm",
              }}
              className="transition-transform cursor-pointer"
              name={user.user_metadata.full_name || user.email}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User menu">
            <DropdownItem key="profile" className="h-14 gap-2 font-semibold">
              Signed in as {user.email}
            </DropdownItem>
            <DropdownItem
              key="signout"
              color="danger"
              onPress={handleSignOut}
            >
              Sign Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        <Button 
          color="primary" 
          variant="flat"
          onPress={handleSignIn}
          size="sm"
        >
          Sign in
        </Button>
      )}
    </div>
  );
}

export default Page