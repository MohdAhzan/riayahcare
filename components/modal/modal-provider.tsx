"use client"
import { createContext, useContext, useState } from "react"

type ModalType =
  | "schedule"
  | "whatsapp"
  | "email"
  | null

const ModalContext = createContext<any>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<{ type: ModalType; data?: any }>({
    type: null,
  })

  return (
    <ModalContext.Provider value={{ modal, setModal }}>
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => useContext(ModalContext)

