import { useState } from 'react'

export function useFeedback() {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackName, setFeedbackName] = useState('')
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const resetFeedback = () => {
    setFeedbackName('')
    setFeedbackType('suggestion')
    setFeedbackMessage('')
  }

  return {
    showFeedback, setShowFeedback,
    feedbackName, setFeedbackName,
    feedbackType, setFeedbackType,
    feedbackMessage, setFeedbackMessage,
    resetFeedback,
  }
}
