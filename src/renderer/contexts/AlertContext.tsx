import React from 'react'

const useValue = () => {
    const [variant, setVariant] = React.useState<string | undefined>(undefined)
    const [message, setMessage] = React.useState<string | undefined>(undefined)
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    return {
      variant, setVariant,
      message, setMessage,
      isOpen, setIsOpen,
    }
}

export const AlertContext = React.createContext({} as ReturnType<typeof useValue>)
interface AlertContextProps {
  children: React.ReactNode
}
export const AlertContextProvider: React.FC<AlertContextProps> = ({children}) => {
    return (
        <AlertContext.Provider value={useValue()}>
            {children}
        </AlertContext.Provider>
    )
}
