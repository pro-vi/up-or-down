import { Devvit } from "@devvit/public-api"
import { TypewriterText } from "./typewriter-text.js"

interface SubredditCardProps {
  subreddit: {
    name: string
    subscribers: number
  }
  showSubscribers: boolean
  animate?: boolean
}

export const SubredditCard: Devvit.BlockComponent<SubredditCardProps> = ({
  subreddit,
  showSubscribers,
  animate = false,
}) => {
  return (
    <vstack
      gap="medium"
      alignment="middle start"
      backgroundColor="#2D2D2E"
      padding="large"
      cornerRadius="large"
      grow
      width="100%"
    >
      <hstack width="100%">
        {animate ? (
          <TypewriterText text={`r/${subreddit.name ?? ""}`} />
        ) : (
          <text
            size="xxlarge"
            alignment="start"
            color="white"
            weight="bold"
            wrap
          >
            r/{subreddit.name ?? ""}
          </text>
        )}
      </hstack>
      <hstack gap="small" alignment="bottom">
        <text size="xlarge" color="#FF4500" weight="bold">
          {showSubscribers ? subreddit.subscribers.toLocaleString() : "???"}
        </text>
        <text size="medium" color="#7C7C7C">
          members
        </text>
      </hstack>
    </vstack>
  )
}
