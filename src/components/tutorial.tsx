import { Devvit } from "@devvit/public-api"

export const Tutorial = () => (
  <vstack gap="small" alignment="middle center">
    <text size="large" color="#B8C5C9">
      Does the subreddit below have
    </text>
    <hstack gap="small" alignment="middle center">
      <text size="large" color="#B8C5C9">
        more
      </text>
      <icon name="up-arrow-fill" size="small" color="#FF4500" />
      <text size="large" color="#B8C5C9">
        or fewer
      </text>
      <icon name="down-arrow-fill" size="small" color="#7193FF" />
      <text size="large" color="#B8C5C9">
        members?
      </text>
    </hstack>
  </vstack>
)
