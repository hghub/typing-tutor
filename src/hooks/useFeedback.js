import { useState } from 'react'

export function useFeedback() {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackName, setFeedbackName] = useState('')
  const [feedbackEmail, setFeedbackEmail] = useState('')
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const resetFeedback = () => {
    setFeedbackName('')
    setFeedbackEmail('')
    setFeedbackType('suggestion')
    setFeedbackMessage('')
  }

  return {
    showFeedback, setShowFeedback,
    feedbackName, setFeedbackName,
    feedbackEmail, setFeedbackEmail,
    feedbackType, setFeedbackType,
    feedbackMessage, setFeedbackMessage,
    resetFeedback,
  }
}
