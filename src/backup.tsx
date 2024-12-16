import { Devvit, useAsync, useState } from "@devvit/public-api"
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

    // Store preloaded subreddit
    const [preloadedSub, setPreloadedSub] = useState<ISubreddit | null>(null)

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

    const handleProgress = async () => {
      console.log('method: "handleProgress"')
      try {
        const { reddit } = context
        const availableSubs = getAvailableSubreddits()
        // Use preloaded subreddit if available
        const newBottomSub =
          preloadedSub || (await fetchRandomSubreddit(reddit, availableSubs))
        setPreloadedSub(null) // Clear the used preloaded subreddit

        if (newBottomSub) {
          setGameState((prevState) => ({
            ...prevState,
            showResults: false,
            topSub: hydrateSubreddit(prevState.bottomSub!),
            bottomSub: hydrateSubreddit(newBottomSub),
          }))
        } else {
          console.error("Failed to fetch new subreddit")
        }
      } catch (error) {
        console.error("Error progressing game:", error)
      }
    }

    // Preload next subreddit whenever the current subreddit is shown
    useAsync(
      async () => {
        console.log("useAsync: Preloading next subreddit")
        if (gameState.showResults || !gameState.bottomSub) return null

        try {
          const { reddit } = context
          const availableSubs = getAvailableSubreddits()
          const nextSub = await fetchRandomSubreddit(reddit, availableSubs)
          if (nextSub) {
            setPreloadedSub(hydrateSubreddit(nextSub))
          }
        } catch (error) {
          console.error("Error preloading next subreddit:", error)
        }
        return null
      },
      {
        depends: gameState,
      }
    )

    const handleGuess = async (guessedHigher: boolean) => {
      console.log('method: "handleGuess"', guessedHigher)
      if (!gameState.topSub || !gameState.bottomSub) return

      const topSubCount = gameState.topSub.subscribers ?? 0
      const bottomSubCount = gameState.bottomSub.subscribers ?? 0

      const isCorrect = guessedHigher
        ? bottomSubCount <= topSubCount
        : bottomSubCount >= topSubCount

      if (isCorrect) {
        console.log("Correct guess!")
        // Use functional update to ensure we have latest state
        setGameState((prevState) => ({
          ...prevState,
          score: prevState.score + 1,
          showResults: true,
        }))
        // Set progress after state update
        await handleProgress()
      } else {
        console.log("Incorrect guess!")
        setGameState((prevState) => ({
          ...prevState,
          showResults: true,
          gameOver: true,
        }))
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
