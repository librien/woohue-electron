import React from 'react'

export interface Settings {
  team: any
  language: any
  bridge: any
  configName: any
}

const useValue = () => {
    const [settings, setSettings] = React.useState<Settings>()

    return {
        settings,
        setSettings
    }
}

export const SettingsContext = React.createContext({} as ReturnType<typeof useValue>)
interface SettingsContextProps {
  children: React.ReactNode
}
export const SettingsContextProvider: React.FC<SettingsContextProps> = ({children}) => {
    return (
        <SettingsContext.Provider value={useValue()}>
            {children}
        </SettingsContext.Provider>
    )
}
