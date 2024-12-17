import { Devvit } from "@devvit/public-api"

interface ErrorProps {
  message: string
}

export const Error = ({ message }: ErrorProps) => {
  return (
    <vstack height="100%" width="100%" alignment="middle center">
      <text size="large" color="red">
        {message}
      </text>
    </vstack>
  )
}
