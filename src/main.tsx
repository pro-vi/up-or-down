import {
  Devvit,
  SubredditInfo,
  useInterval,
  useState,
} from "@devvit/public-api"
import {
  defaultSubreddits,
  fetchRandomSubreddit,
  getUserFrequentedSubreddits,
} from "./api.js"
import { Error } from "./components/error.js"
import { GameOver } from "./components/game-over.js"
import { GamePlay } from "./components/game-play.js"
import { hydrateSubreddit, ISubreddit } from "./utils.js"

type GameState = {
  score: number
  showResults: boolean
  gameOver: boolean
  topSub: ISubreddit | null
  bottomSub: ISubreddit | null
}

Devvit.configure({
  redditAPI: true,
  redis: true,
})

const getHighScoreKey = (userId: string) => `high_score:${userId}`
const getGlobalHighScoreKey = () => `high_score:global`

Devvit.addMenuItem({
  label: "Create Subreddit Higher/Lower Game",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const { reddit, ui } = context
    ui.showToast("Creating your Subreddit Higher/Lower game...")

    const subreddit = await reddit.getCurrentSubreddit()
    const post = await reddit.submitPost({
      title: "Guess Which Subreddit Has More Members!",
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading game...</text>
        </vstack>
      ),
    })
    ui.navigateTo(post)
  },
})

Devvit.addCustomPostType({
  name: "Subreddit Comparison Game",
  height: "tall",
  render: (context) => {
    const [usedSubreddits, setUsedSubreddits] = useState<string[]>([])
    const [highScore, setHighScore] = useState(0)
    const [globalHighScore, setGlobalHighScore] = useState(0)

    // Keep track of game state
    const [gameState, setGameState] = useState<GameState>({
      score: 0,
      gameOver: false,
      showResults: false,
      topSub: null,
      bottomSub: null,
    })

    // Fetch high scores on mount
    useState(async () => {
      const { redis, userId } = context
      if (!userId) return null

      // Get user's high score
      const userHighScore = await redis.get(getHighScoreKey(userId))
      if (userHighScore) {
        setHighScore(parseInt(userHighScore))
      }

      // Get global high score
      const globalScore = await redis.get(getGlobalHighScoreKey())
      if (globalScore) {
        setGlobalHighScore(parseInt(globalScore))
      }
      return null
    })

    // Fetch user's frequented subreddits on mount
    const [userSubreddits] = useState<string[]>(async () => {
      const { reddit, userId } = context
      if (!userId) return []
      const user = await reddit.getUserById(userId)
      if (!user) return []
      return await getUserFrequentedSubreddits(reddit, user)
    })

    // Get available subreddits
    const getAvailableSubreddits = () => {
      // Start with default subreddits
      const availableSubs = [...defaultSubreddits]

      // Add user's subreddits if available
      if (userSubreddits) {
        availableSubs.push(...userSubreddits)
      }

      // Filter out used subreddits
      return availableSubs.filter((sub) => !usedSubreddits.includes(sub))
    }

    // Initialize game with first subreddits
    useState(async () => {
      try {
        const availableSubs = getAvailableSubreddits()

        // Try to get a user subreddit first for topSub
        let topSub: SubredditInfo | null = null
        if (userSubreddits && userSubreddits.length > 0) {
          // Get a random user subreddit
          const randomUserSub =
            userSubreddits[Math.floor(Math.random() * userSubreddits.length)]
          topSub = await fetchRandomSubreddit(context.reddit, [randomUserSub])
        }

        // If no user subreddit was found, get a random one from available subs
        if (!topSub) {
          topSub = await fetchRandomSubreddit(context.reddit, availableSubs)
        }

        // Get bottom subreddit from remaining available subs, excluding the top one
        const remainingSubs = availableSubs.filter(
          (sub) => sub !== topSub?.name
        )
        const bottomSub = await fetchRandomSubreddit(
          context.reddit,
          remainingSubs
        )

        if (topSub?.name && bottomSub?.name) {
          setUsedSubreddits((prev) => [...prev, topSub.name!, bottomSub.name!])

          setGameState({
            score: 0,
            showResults: false,
            gameOver: false,
            topSub: hydrateSubreddit(topSub),
            bottomSub: hydrateSubreddit(bottomSub),
          })
        }
        return null
      } catch (error) {
        console.error("Error initializing game:", error)
        return null
      }
    })

    const [shouldProgress, setShouldProgress] = useState(false)

    const progressInterval = useInterval(async () => {
      if (shouldProgress) {
        await handleProgress()
        setShouldProgress(false)
      }
    }, 2000)

    const handleProgress = async () => {
      try {
        const { reddit } = context
        const availableSubs = getAvailableSubreddits()
        const newBottomSub = await fetchRandomSubreddit(reddit, availableSubs)

        if (newBottomSub) {
          const bottomSub = hydrateSubreddit(newBottomSub)

          // Add new subreddit to used set
          setUsedSubreddits((prev) => [...prev, bottomSub.name])

          setGameState((prevState) => ({
            ...prevState,
            showResults: false,
            topSub: prevState.bottomSub!,
            bottomSub,
          }))
        } else {
          console.error("Failed to fetch new subreddit")
        }
      } catch (error) {
        console.error("Error progressing game:", error)
      }
    }

    const updateHighScores = async (score: number) => {
      const { redis, userId } = context
      if (!userId) return

      // Update user's high score if current score is higher
      const userKey = getHighScoreKey(userId)
      const currentHighScore = parseInt((await redis.get(userKey)) || "0")
      if (score > currentHighScore) {
        await redis.set(userKey, score.toString())
        setHighScore(score)
      }

      // Update global high score if current score is higher
      const globalKey = getGlobalHighScoreKey()
      const currentGlobalHighScore = parseInt(
        (await redis.get(globalKey)) || "0"
      )
      if (score > currentGlobalHighScore) {
        await redis.set(globalKey, score.toString())
        setGlobalHighScore(score)
      }
    }

    const resetGame = async () => {
      const availableSubs = getAvailableSubreddits()
      const [newTopSub, newBottomSub] = await Promise.all([
        fetchRandomSubreddit(context.reddit, availableSubs),
        fetchRandomSubreddit(context.reddit, availableSubs),
      ])

      if (!newTopSub || !newBottomSub) {
        console.error("Failed to fetch initial subreddits")
        return
      }

      const topSub = hydrateSubreddit(newTopSub)
      const bottomSub = hydrateSubreddit(newBottomSub)

      // Reset used subreddits and add new ones
      setUsedSubreddits([topSub.name, bottomSub.name])

      // Update high scores from previous game before resetting
      await updateHighScores(gameState.score)

      setGameState({
        score: 0,
        gameOver: false,
        showResults: false,
        topSub,
        bottomSub,
      })
    }

    const handleGuess = async (guessedHigher: boolean) => {
      if (!gameState.topSub || !gameState.bottomSub) return

      const isCorrect = guessedHigher
        ? gameState.bottomSub.subscribers < gameState.topSub.subscribers
        : gameState.bottomSub.subscribers > gameState.topSub.subscribers

      setGameState((prevState) => ({
        ...prevState,
        showResults: true,
        score: isCorrect ? prevState.score + 1 : prevState.score,
        gameOver: !isCorrect,
      }))

      if (isCorrect) {
        setShouldProgress(true)
        progressInterval.start()
      }
    }

    if (!gameState.topSub || !gameState.bottomSub) {
      return <Error message="Error loading subreddits. Please try again!" />
    }

    if (gameState.gameOver) {
      return (
        <GameOver
          score={gameState.score}
          topSub={gameState.topSub}
          bottomSub={gameState.bottomSub}
          onPlayAgain={resetGame}
          highScore={highScore}
          globalHighScore={globalHighScore}
        />
      )
    }

    return (
      <GamePlay
        score={gameState.score}
        topSub={gameState.topSub}
        bottomSub={gameState.bottomSub}
        showResults={gameState.showResults}
        onHigher={() => handleGuess(true)}
        onLower={() => handleGuess(false)}
      />
    )
  },
})

export default Devvit
