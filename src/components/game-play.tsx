import { Devvit } from "@devvit/public-api"
import { ISubreddit } from "../utils.js"
import { SubredditCard } from "./subreddit-card.js"
import { Tutorial } from "./tutorial.js"

interface GamePlayProps {
  score: number
  topSub: ISubreddit | null
  bottomSub: ISubreddit | null
  showResults: boolean
  onHigher: () => void
  onLower: () => void
}

export const GamePlay = ({
  score,
  topSub,
  bottomSub,
  showResults,
  onHigher,
  onLower,
}: GamePlayProps) => (
  <vstack
    height="100%"
    width="100%"
    gap="large"
    padding="large"
    backgroundColor="#1A1A1B"
    alignment="top center"
  >
    <text size="xlarge" alignment="center" color="white" weight="bold">
      Score: {score}
    </text>

    <vstack alignment="middle center" width="100%" grow>
      <hstack gap="medium" alignment="middle start" width="100%">
        {topSub && <SubredditCard subreddit={topSub} showSubscribers />}
      </hstack>

      <hstack height="100%" grow alignment="middle center">
        {score === 0 ? (
          <Tutorial />
        ) : (
          <text size="xxlarge" color="#B8C5C9" weight="bold">
            VS
          </text>
        )}
      </hstack>

      <hstack gap="medium" alignment="middle start" width="100%">
        {!showResults && (
          <vstack gap="medium" alignment="middle center">
            <icon
              name="up-arrow-fill"
              size="large"
              onPress={onLower}
              color="#FF4500"
            />
            <icon
              name="down-arrow-fill"
              size="large"
              onPress={onHigher}
              color="#7193FF"
            />
          </vstack>
        )}
        {bottomSub && (
          <SubredditCard
            subreddit={bottomSub}
            showSubscribers={showResults}
            animate
          />
        )}
      </hstack>
    </vstack>
  </vstack>
)
