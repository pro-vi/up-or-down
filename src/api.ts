import { RedditAPIClient, SubredditInfo, User } from "@devvit/public-api"
import subredditsData from "./data/subreddits.json"

const POST_WEIGHT = 2
const POST_COUNT = 20
const COMMENT_WEIGHT = 1
const COMMENT_COUNT = 200
const MAX_USER_SUBREDDITS = 10

const defaultSubredditsSet = new Set(subredditsData.defaultSubreddits)

// Keep array for ordered access
export const defaultSubreddits = Array.from(defaultSubredditsSet)

/**
 * Derive a list of user's most frequented subreddits from their posts and comments.
 */
export const getUserFrequentedSubreddits = async (
  reddit: RedditAPIClient,
  user: User
): Promise<string[]> => {
  try {
    // Fetch posts and comments in parallel
    const [posts, comments] = await Promise.all([
      reddit.getPostsByUser(user).get(POST_COUNT),
      reddit.getCommentsByUser(user).get(COMMENT_COUNT),
    ])

    // Process posts and comments in parallel
    const weightedSubreddits = [
      ...posts.map((post) => ({
        name: post.subredditName,
        weight: POST_WEIGHT,
      })),
      ...comments.map((comment) => ({
        name: comment.subredditName,
        weight: COMMENT_WEIGHT,
      })),
    ]

    // Count weighted occurrences of each subreddit
    const subredditCounts = weightedSubreddits.reduce(
      (acc, { name, weight }) => {
        if (!name) return acc
        acc[name] = (acc[name] || 0) + weight
        return acc
      },
      {} as Record<string, number>
    )

    // Sort by weight and take top N
    return Object.entries(subredditCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, MAX_USER_SUBREDDITS)
      .map(([name]) => name)
  } catch (error) {
    console.error("Error in getUserFrequentedSubreddits:", error)
    return []
  }
}

/**
 * Fetch a random subreddit from the available pool that hasn't been used yet.
 */
export const fetchRandomSubreddit = async (
  reddit: RedditAPIClient,
  availableSubreddits: string[]
): Promise<SubredditInfo | null> => {
  if (availableSubreddits.length === 0) return null

  try {
    // Get a random subreddit from the list
    const randomIndex = Math.floor(Math.random() * availableSubreddits.length)
    const randomSubName = availableSubreddits[randomIndex]
    return await reddit.getSubredditInfoByName(randomSubName)
  } catch (error) {
    console.error("Error in fetchRandomSubreddit:", error)
    return null
  }
}
