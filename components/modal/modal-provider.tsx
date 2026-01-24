
// components/modal/modal-provider.tsx
"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type ModalType = "schedule" | "whatsapp" | "email" | null

interface ModalContextType {
  modal: { type: ModalType; data: any } | null
  setModal: (modal: { type: ModalType; data: any } | null) => void
}

const ModalContext = createContext<ModalContextType>({
  modal: null,
  setModal: () => {},
})

export function useModal() {
  return useContext(ModalContext)
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<{ type: ModalType; data: any } | null>(null)

  return (
    <ModalContext.Provider value={{ modal, setModal }}>
      {children}
    </ModalContext.Provider>
  )
}



//
//"use client"
//import { createContext, useContext, useState } from "react"
//
//type ModalType =
//  | "schedule"
//  | "whatsapp"
//  | "email"
//  | null
//
//const ModalContext = createContext<any>(null)
//
//export function ModalProvider({ children }: { children: React.ReactNode }) {
//  const [modal, setModal] = useState<{ type: ModalType; data?: any }>({
//    type: null,
//  })
//
//  return (
//    <ModalContext.Provider value={{ modal, setModal }}>
//      {children}
//    </ModalContext.Provider>
//  )
//}
//
//export const useModal = () => useContext(ModalContext)
//
