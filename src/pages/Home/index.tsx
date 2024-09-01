import { useEffect, useState } from 'react'
import { AddressLike, ZeroAddress } from 'ethers'
import { useAccount } from 'wagmi'

// import BackgroundAudio from '@/components/BackGroundSound';
import FormPlayers from '@/components/FormPlayers'
import NotAccount from '@/components/shared/NotAccount'
import CyberpunkBentoTicTacToe from '@/components/TicTacToe'
import { chainTicTacAvaxCrossAddress } from '@/enums/chain-contracts-addresses.enum'
import { chainNames } from '@/enums/chain-names.enum'
import { chains } from '@/enums/chains.enum'
import {
	convertBoardToSerializable,
	getChainEnum,
	getChainValue,
	getDestinationChain,
	getDestinationTicTacAvaxCrossAddress,
	timestampToFormatedDate
} from '@/helpers'
import { getContracts } from '@/helpers/contracts'

import Loading from '../../components/shared/Loading/index'

export default function Home(): JSX.Element {
	const [chainValue, setChainValue] = useState<number>(0)
	const [gameCount, setGameCount] = useState<number>(0)
	const [isGameOver, setIsGameOver] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [isStartGame, setIsStartGame] = useState<boolean>(false)
	const [lastMoveTimestamp, setLastMoveTimestamp] = useState<string>('')
	const [lastWinner, setLastWinner] = useState<string>(ZeroAddress)
	const [playerOne, setPlayerTwo] = useState<string>(ZeroAddress)
	const [playerTwo, setPlayerOne] = useState<string>(ZeroAddress)
	const [roundCount, setRoundCount] = useState<number>(0)
	const [winner, setWinner] = useState<string>(ZeroAddress)

	const [board, setBoard] = useState<number[][]>([
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0]
	])

	const [connectedCurrentPositionPlayer, setConnectedCurrentPositionPlayer] =
		useState<number>(0)

	const [otherChainCurrentPositionPlayer, setOtherChainCurrentPositionPlayer] =
		useState<number>(0)

	const [destinationChain, setDestinationChain] = useState<
		chainNames | undefined
	>(undefined)

	const [destinationAddress, setDestinationAddress] = useState<
		string | undefined
	>(undefined)

	const { address, isConnected, chainId } = useAccount()

	if (chainId === undefined) {
		return <Loading />
	}

	const chainEnum: chains | undefined = getChainEnum(chainId)

	const { ticTacAvaxCross: connectedTicTacAvax } = getContracts(
		chainEnum as chains
	)

	const { ticTacAvaxCross: otherChainTicTacAvax } = getContracts(
		(chainEnum as chains) === chains.CELO_ALFAJORES
			? chains.AVALANCHE_FUJI
			: chains.CELO_ALFAJORES
	)

	// eslint-disable-next-line react-hooks/rules-of-hooks
	useEffect(() => {
		if (address) {
			fetchData()
		}
	}, [address])

	const startGame = () => {
		setIsStartGame(true)
	}
	const resetBoard = () => {
		setBoard([
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		])
	}

	const fetchData = async () => {
		// get game status
		setIsGameOver(await ticTacAvax.gameOver())

		// get current player
		const positionPlayer: number = Number(await ticTacAvax.currentPlayer())
		setCurrentPlayer(await ticTacAvax.players(positionPlayer))

		// get players
		setPlayerOne(await ticTacAvax.players(0))
		setPlayerTwo(await ticTacAvax.players(1))

		// get board
		setBoard(convertBoardToSerializable(await ticTacAvax.getBoard()))

		// get round count
		setRoundCount(Number(await ticTacAvax.roundCount()))

		// get last move time
		const currentLastMove: string = timestampToFormatedDate(
			await ticTacAvax.lastMoveTimestamp()
		)

		setLastMoveTimestamp(currentLastMove)

		// get current winner
		setWinner(await ticTacAvax.winner())

		// get last winner
		setLastWinner(await ticTacAvax.lastRoundWinner())

		setOtherChainCurrentPositionPlayer(
			Number(currentOtherChainCurrentPositionPlayer)
		)

		const currentConnectedBoard: [
			[bigint, bigint, bigint],
			[bigint, bigint, bigint],
			[bigint, bigint, bigint]
		] = await connectedTicTacAvax.getBoard()

		setBoard(convertBoardToSerializable(currentConnectedBoard))

		const currentRoundCount: bigint = await connectedTicTacAvax.roundCount()
		setRoundCount(Number(currentRoundCount))

		const currentLastMoveTimestamp: bigint =
			await connectedTicTacAvax.lastMoveTimestamp()

		const formatedCurrentLastMoveTimestamp: string = timestampToFormatedDate(
			currentLastMoveTimestamp
		)

		setLastMoveTimestamp(formatedCurrentLastMoveTimestamp)

		const currentWinner: string = await connectedTicTacAvax.winner()
		setWinner(currentWinner)

		const currentLastWinner: string =
			await connectedTicTacAvax.lastRoundWinner()

		setLastWinner(currentLastWinner)

		const currentGameCount: bigint = await connectedTicTacAvax.gameCount()
		setGameCount(Number(currentGameCount))

		const destinationChainEnum =
			(chainEnum as chains) === chains.CELO_ALFAJORES
				? chains.AVALANCHE_FUJI
				: chains.CELO_ALFAJORES

		const destinationChainName = getDestinationChain(
			destinationChainEnum === chains.CELO_ALFAJORES
				? chainNames.AVALANCHE_FUJI
				: chainNames.CELO_ALFAJORES
		)

		setDestinationChain(destinationChainName)

		// const destinationTicTacAvaxAddress = getDestinationTicTacAvaxAddress(
		// 	(chainEnum as chains) === chains.CELO_ALFAJORES
		// 		? chainTicTacAvaxAddress.AVALANCHE_FUJI
		// 		: chainTicTacAvaxAddress.CELO_ALFAJORES
		// )

		const destinationTicTacAvaxAddress = getDestinationTicTacAvaxCrossAddress(
			(chainEnum as chains) === chains.CELO_ALFAJORES
				? chainTicTacAvaxCrossAddress.AVALANCHE_FUJI
				: chainTicTacAvaxCrossAddress.CELO_ALFAJORES
		)

		setDestinationAddress(destinationTicTacAvaxAddress)

		const chainValue: number = getChainValue(
			(chainEnum as chains) === chains.CELO_ALFAJORES
				? chains.AVALANCHE_FUJI
				: chains.CELO_ALFAJORES
		)

		setChainValue(chainValue)

		setIsLoading(false)
	}

	const onStartGame = async () => {
		try {
			setIsLoading(true)

			const startGameTx = await connectedTicTacAvax.startGame(
				destinationChain as string,
				destinationAddress as string,
				address as AddressLike,
				playerTwo as AddressLike,
				{
					value: chainValue
				}
			)

			await startGameTx.wait()
		} catch (error) {
			console.error(error)
			// TODO: toast error
		} finally {
			await fetchData()
		}
	}

	const onMakeMove = async (row: number, column: number) => {
		try {
			setIsLoading(true)

			const makeMoveTx = await connectedTicTacAvax.makeMove(
				destinationChain as string,
				destinationAddress as string,
				row,
				column,
				{
					value: chainValue
				}
			)

			await makeMoveTx.wait()
		} catch (error) {
			console.error(error)
			// TODO: toast error
		} finally {
			await fetchData()
		}
	}

	const resetGame = async () => {
		try {
			setIsLoading(true)

			const resetGameTx = await connectedTicTacAvax.resetGame(
				destinationChain as string,
				destinationAddress as string
			)

			await resetGameTx.wait()
		} catch (error) {
			console.error(error)
			// TODO: toast error
		} finally {
			await fetchData()
		}
	}

	const onMakeMove = async (row: number, column: number) => {
		try {
			if (!address) {
				return
			}
			setIsLoadingBoard(true)

			const lowerCaseAddress = address.toLowerCase()
			const lowerCaseCurrentPlayer = currentPlayer.toLowerCase()

			if (lowerCaseAddress !== lowerCaseCurrentPlayer) {
				// TODO: toast error
				return
			}

			const web3Signer = await getFrontendSigner()

			const makeMoveTx = await ticTacAvax
				.connect(web3Signer)
				.makeMove(row, column, {
					gasLimit: GAS_LIMIT
				})
			await makeMoveTx.wait()
		} catch (error) {
			setIsLoadingBoard(false)
			toast.error('Error making move')
		} finally {
			setIsLoadingBoard(false)
			fetchData()
		}
	}

	const onResetGame = async () => {
		try {
			if (!isGameOver) {
				// TODO: toast error
				return
			}

			setIsLoading(true)

			const web3Signer = await getFrontendSigner()

			const resetGameTx = await ticTacAvax.connect(web3Signer).resetGame({
				gasLimit: GAS_LIMIT
			})

			await resetGameTx.wait()
		} catch (error) {
			console.error(error)
			// TODO: toast error
		} finally {
			fetchData()
		}
	}

	if (!isConnected) {
		return (
			<div className='flex justify-center items-center flex-col min-h-lvh'>
				<NotAccount />
			</div>
		)
	}
	return (
		<div className='flex justify-center items-center flex-col min-h-lvh'>
			{isLoading ? (
				<Loading />
			) : (
				<>
					<div className=''>
						{(isConnected && isGameOver && winner !== ZeroAddress) ||
						(!isGameOver && lastWinner !== ZeroAddress) ? (
							<CyberpunkBentoTicTacToe
								board={board}
								setBoard={setBoard}
								resetBoard={onResetGame}
								currentRoundCount={gameCount}
								players={[playerOne, playerTwo]}
								winnerContract={winner}
								sendMovent={onMakeMove}
								isLoadingBoard={isLoadingBoard}
							/>
						) : (
							<FormPlayers startGame={onStartGame} />
						)}
					</div>

					{/* <BackgroundAudio audioSrc='src/assets/sounds/menuSound.mp3' /> */}
					{/* <h1 className='text-white font-bold'>CyberpunkBentoTicTacToe</h1> */}

					{/* <CyberpunkBentoTicTacToe /> */}
				</>
			)}
		</div>
	)
}
