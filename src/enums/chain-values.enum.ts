import { ethers } from 'ethers'

export enum chainValues {
	ARBITRUM_SEPOLIA = Number(ethers.parseEther('0.001')),
	AVALANCHE_FUJI = Number(ethers.parseEther('0.001')),
	BASE_SEPOLIA = Number(ethers.parseEther('0.001')),
	CELO_ALFAJORES = Number(ethers.parseEther('1')),
	DEFAULT = 'default'
}
