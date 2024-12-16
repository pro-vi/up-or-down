import { Devvit, useInterval, useState } from "@devvit/public-api"
import { SubredditCard } from "./components/subreddit-card.js"
import {
  defaultSubreddits,
  fetchRandomSubreddit,
  getUserFrequentedSubreddits,
} from "./subreddit-pool.js"
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
})

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
    // Keep track of game state
    const [gameState, setGameState] = useState<GameState>({
      score: 0,
      showResults: false,
      gameOver: false,
      topSub: null,
      bottomSub: null,
    })

    // Fetch user's frequented subreddits once
    const [userSubreddits] = useState<string[]>(async () => {
      console.log("useState: Fetching user subreddits")
      const { reddit, userId } = context
      if (!userId) return []
      const user = await reddit.getUserById(userId)
      if (!user) return []
      return await getUserFrequentedSubreddits(reddit, user)
    })

    // Get available subreddits
    const getAvailableSubreddits = () => {
      if (!userSubreddits?.length) {
        return defaultSubreddits
      }
      return [...new Set([...defaultSubreddits, ...userSubreddits])]
    }

    // Initialize game with first subreddits
    useState<GameState | null>(async () => {
      console.log("useState: Initializing game state")
      try {
        const { reddit } = context
        const availableSubs = getAvailableSubreddits()
        const [topSub, bottomSub] = await Promise.all([
          fetchRandomSubreddit(reddit, availableSubs),
          fetchRandomSubreddit(reddit, availableSubs),
        ])

        if (topSub?.name && bottomSub?.name) {
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
      console.log('method: "handleProgress"')
      try {
        const { reddit } = context
        const availableSubs = getAvailableSubreddits()
        const newBottomSub = await fetchRandomSubreddit(reddit, availableSubs)

        if (newBottomSub) {
          setGameState((prevState) => ({
            ...prevState,
            showResults: false,
            topSub: prevState.bottomSub!,
            bottomSub: hydrateSubreddit(newBottomSub),
          }))

          console.log("I just fcking set the game state")
        } else {
          console.error("Failed to fetch new subreddit")
        }
      } catch (error) {
        console.error("Error progressing game:", error)
      }
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

    const resetGame = async () => {
      console.log('method: "resetGame"')
      const availableSubs = getAvailableSubreddits()
      const [newTopSub, newBottomSub] = await Promise.all([
        fetchRandomSubreddit(context.reddit, availableSubs),
        fetchRandomSubreddit(context.reddit, availableSubs),
      ])
      if (newTopSub && newBottomSub) {
        setGameState({
          score: 0,
          showResults: false,
          gameOver: false,
          topSub: hydrateSubreddit(newTopSub),
          bottomSub: hydrateSubreddit(newBottomSub),
        })
      }
    }

    if (!gameState.topSub || !gameState.bottomSub) {
      return (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large" color="red">
            Error loading subreddits. Please try again!
          </text>
        </vstack>
      )
    }

    if (gameState.gameOver) {
      console.log("rendering game over")

      return (
        <vstack
          height="100%"
          width="100%"
          gap="large"
          padding="medium"
          backgroundColor="#1A1A1B"
          alignment="top center"
        >
          <text size="xlarge" alignment="center" color="white" weight="bold">
            Game Over! Final Score: {gameState.score}
          </text>

          <vstack gap="large" alignment="middle center" width="100%">
            <hstack gap="medium" alignment="middle start" width="100%">
              <SubredditCard subreddit={gameState.topSub} showSubscribers />
            </hstack>

            <hstack width="80%" alignment="middle center">
              <button onPress={resetGame} size="large" width="100%">
                Play Again
              </button>
            </hstack>

            <hstack gap="medium" alignment="middle start" width="100%">
              <SubredditCard
                subreddit={gameState.bottomSub}
                showSubscribers={true}
              />
            </hstack>
          </vstack>
        </vstack>
      )
    }

    return (
      <vstack
        height="100%"
        width="100%"
        gap="large"
        padding="medium"
        backgroundColor="#1A1A1B"
        alignment="top center"
      >
        <text size="xlarge" alignment="center" color="white" weight="bold">
          Score: {gameState.score}
        </text>

        <vstack gap="large" alignment="middle center" width="100%">
          <hstack gap="medium" alignment="middle start" width="100%">
            <SubredditCard subreddit={gameState.topSub} showSubscribers />
          </hstack>

          <hstack width="80%" alignment="middle center">
            <text size="xxlarge" color="white" weight="bold">
              VS
            </text>
          </hstack>

          <hstack gap="small" alignment="middle start" width="100%">
            {!gameState.showResults && (
              <vstack gap="medium" alignment="middle center">
                <icon
                  name="up-arrow-fill"
                  size="large"
                  onPress={() => handleGuess(false)}
                  lightColor="#FF4500"
                  darkColor="#FF4500"
                />
                <icon
                  name="down-arrow-fill"
                  size="large"
                  onPress={() => handleGuess(true)}
                  lightColor="#7193FF"
                  darkColor="#7193FF"
                />
              </vstack>
            )}
            <SubredditCard
              subreddit={gameState.bottomSub}
              showSubscribers={gameState.showResults}
              animate
            />
          </hstack>
        </vstack>
      </vstack>
    )
  },
})

export default Devvit
