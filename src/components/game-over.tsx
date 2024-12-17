import { Devvit } from "@devvit/public-api"
import { ISubreddit } from "../utils.js"
import { SubredditCard } from "./subreddit-card.js"

interface GameOverProps {
  score: number
  topSub: ISubreddit | null
  bottomSub: ISubreddit | null
  onPlayAgain: () => void
}

export const GameOver = ({ score, topSub, bottomSub, onPlayAgain }: GameOverProps) => (
  <vstack
    height="100%"
    width="100%"
    gap="large"
    padding="medium"
    backgroundColor="#1A1A1B"
    alignment="top center"
  >
    <text size="xlarge" alignment="center" color="white" weight="bold">
      Game Over! Final Score: {score}
    </text>

    <vstack gap="large" alignment="middle center" width="100%">
      <hstack gap="medium" alignment="middle start" width="100%">
        {topSub && <SubredditCard subreddit={topSub} showSubscribers />}
      </hstack>

      <hstack width="80%" alignment="middle center">
        <button onPress={onPlayAgain} size="large" width="100%">
          Play Again
        </button>
      </hstack>

      <hstack gap="medium" alignment="middle start" width="100%">
        {bottomSub && (
          <SubredditCard
            subreddit={bottomSub}
            showSubscribers={true}
          />
        )}
      </hstack>
    </vstack>
  </vstack>
)
