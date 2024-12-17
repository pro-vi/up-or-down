import { SubredditInfo } from "@devvit/public-api"

export type ISubreddit = {
  name: string
  subscribers: number
}

export const hydrateSubreddit = (subreddit: SubredditInfo): ISubreddit => {
  console.log("hydrateSubreddit", subreddit.name)
  return {
    name: subreddit.name ?? "",
    subscribers: subreddit.subscribersCount ?? 0,
  }
}

export const getSubredditUrl = (subredditName: string): string => {
  // Remove the 'r/' prefix if it exists
  const cleanName = subredditName.replace(/^r\//, "")
  return `https://reddit.com/r/${cleanName}`
}
