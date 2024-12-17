import { Devvit } from "@devvit/public-api"
import { ISubreddit } from "../utils.js"
import { SubredditCard } from "./subreddit-card.js"

interface GameOverProps {
  score: number
  topSub: ISubreddit | null
  bottomSub: ISubreddit | null
  onPlayAgain: () => void
}

export const GameOver = ({
  score,
  topSub,
  bottomSub,
  onPlayAgain,
}: GameOverProps) => (
  <vstack
    height="100%"
    width="100%"
    gap="large"
    padding="large"
    backgroundColor="#1A1A1B"
    alignment="top center"
  >
    <text size="xlarge" alignment="center" color="white" weight="bold">
      Game Over! Final Score: {score}
    </text>

    <vstack alignment="middle center" width="100%" grow>
      <hstack gap="medium" alignment="middle start" width="100%">
        {topSub && <SubredditCard subreddit={topSub} showSubscribers />}
      </hstack>

      <hstack width="69%" height="100%" grow alignment="middle center">
        <button onPress={onPlayAgain} size="large" width="100%">
          Retry
        </button>
      </hstack>

      <hstack gap="medium" alignment="middle start" width="100%">
        {bottomSub && <SubredditCard subreddit={bottomSub} showSubscribers />}
      </hstack>
    </vstack>
  </vstack>
)
