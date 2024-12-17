import { SubredditInfo } from "@devvit/public-api"

export type ISubreddit = {
  name: string
  subscribers: number
}

// Convert SubredditInfo to ISubreddit
export const toSubreddit = (subreddit: SubredditInfo): ISubreddit => {
  return {
    name: subreddit.name ?? "",
    subscribers: subreddit.subscribersCount ?? 0,
  }
}

// Potentially, allow visiting subreddits on game over.
export const getSubredditUrl = (subredditName: string): string => {
  const cleanName = subredditName.replace(/^r\//, "")
  return `https://reddit.com/r/${cleanName}`
}
