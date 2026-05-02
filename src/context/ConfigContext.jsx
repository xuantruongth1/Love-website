import { createContext, useContext, useState, useEffect } from 'react'
import { config as staticConfig } from '@/data/config'
import * as api from '@/services/api'

const ConfigContext = createContext({ ...staticConfig, configLoaded: false })

export function ConfigProvider({ children }) {
  const [cfg, setCfg] = useState({ ...staticConfig, configLoaded: false })

  useEffect(() => {
    api.getConfig()
      .then(data => {
        setCfg(prev => ({
          ...prev,
          ...(data && Object.keys(data).length > 0 ? data : {}),
          configLoaded: true,
        }))
      })
      .catch(() => {
        setCfg(prev => ({ ...prev, configLoaded: true }))
      })
  }, [])

  return <ConfigContext.Provider value={cfg}>{children}</ConfigContext.Provider>
}

export function useConfig() {
  return useContext(ConfigContext)
}
