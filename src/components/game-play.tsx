import { Devvit } from "@devvit/public-api"
import { ISubreddit } from "../utils.js"
import { SubredditCard } from "./subreddit-card.js"

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
  onLower 
}: GamePlayProps) => (
  <vstack
    height="100%"
    width="100%"
    gap="large"
    padding="medium"
    backgroundColor="#1A1A1B"
    alignment="top center"
  >
    <text size="xlarge" alignment="center" color="white" weight="bold">
      Score: {score}
    </text>

    <vstack gap="large" alignment="middle center" width="100%">
      <hstack gap="medium" alignment="middle start" width="100%">
        {topSub && <SubredditCard subreddit={topSub} showSubscribers />}
      </hstack>

      <hstack width="80%" alignment="middle center">
        <text size="xxlarge" color="white" weight="bold">
          VS
        </text>
      </hstack>

      <hstack gap="small" alignment="middle start" width="100%">
        {!showResults && (
          <vstack gap="medium" alignment="middle center">
            <icon
              name="up-arrow-fill"
              size="large"
              onPress={onLower}
              lightColor="#FF4500"
              darkColor="#FF4500"
            />
            <icon
              name="down-arrow-fill"
              size="large"
              onPress={onHigher}
              lightColor="#7193FF"
              darkColor="#7193FF"
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
