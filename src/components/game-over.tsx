import { Devvit } from "@devvit/public-api"
import { ISubreddit } from "../utils.js"
import { SubredditCard } from "./subreddit-card.js"

interface GameOverProps {
  score: number
  topSub: ISubreddit | null
  bottomSub: ISubreddit | null
  onPlayAgain: () => void
  highScore: number
  globalHighScore: number
}

// Render game over screen.
export const GameOver = ({
  score,
  topSub,
  bottomSub,
  onPlayAgain,
  highScore,
  globalHighScore,
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

      <hstack width="100%" height="100%" grow alignment="middle center">
        <vstack gap="small" grow alignment="middle center">
          <hstack gap="small">
            <text size="large" color="#B8C5C9">
              Your Best: {Math.max(score, highScore)}
            </text>
            {score > highScore && (
              <text size="medium" color="#FF4500" weight="bold">
                New Best!
              </text>
            )}
          </hstack>

          <hstack gap="small">
            <text size="large" color="#B8C5C9">
              Global Best: {Math.max(score, globalHighScore)}
            </text>
            {score > globalHighScore && (
              <text size="medium" color="#FF4500" weight="bold">
                New Record!
              </text>
            )}
          </hstack>

          <button onPress={onPlayAgain} size="large" width="50%">
            Retry
          </button>
        </vstack>
      </hstack>

      <hstack gap="medium" alignment="middle start" width="100%">
        {bottomSub && <SubredditCard subreddit={bottomSub} showSubscribers />}
      </hstack>
    </vstack>
  </vstack>
)
