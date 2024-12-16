import { Devvit, useInterval, useState } from "@devvit/public-api"

interface TypewriterTextProps {
  text: string
  delay?: number
}

export const TypewriterText: Devvit.BlockComponent<TypewriterTextProps> = ({
  text,
  delay = 100,
}) => {
  const [counter, setCounter] = useState(1)
  const [prevText, setPrevText] = useState(text)

  // Reset counter when text changes
  if (text !== prevText) {
    setCounter(1)
    setPrevText(text)
  }

  const progressInterval = useInterval(() => {
    if (counter < text.length) {
      setCounter((c) => c + 1)
    }
  }, delay)

  // Start typing animation
  progressInterval.start()

  return (
    <text
      size="xxlarge"
      alignment="start"
      color="white"
      weight="bold"
      width="100%"
      wrap
    >
      {text.slice(0, counter)}
    </text>
  )
}
