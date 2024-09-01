import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { avalancheFuji, celoAlfajores } from 'wagmi/chains'

import {
	darkTheme,
	getDefaultConfig,
	RainbowKitProvider
} from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { RAINBOW_KIT_APP_ID, RAINBOW_KIT_APP_NAME } from './config/commons.ts'
import App from './pages/App/App.tsx'

import 'animate.css'
import '@rainbow-me/rainbowkit/styles.css'
import './index.css'

const config = getDefaultConfig({
	appName: RAINBOW_KIT_APP_NAME,
	projectId: RAINBOW_KIT_APP_ID,
	chains: [avalancheFuji, celoAlfajores],
	ssr: false // If your dApp uses server side rendering (SSR)
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<WagmiProvider config={config}>
				<RainbowKitProvider
					coolMode
					theme={darkTheme({
						accentColor: '#37005B',
						accentColorForeground: '#FFFFFF'
					})}
				>
					<App />
				</RainbowKitProvider>
			</WagmiProvider>
		</QueryClientProvider>
	</React.StrictMode>
)
