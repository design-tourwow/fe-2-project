import { useEffect } from 'react'
import { useLoading } from '../contexts/LoadingContext'

interface UsePageLoadingOptions {
  loadingMessage?: string
  delay?: number // milliseconds to show loading
}

export const usePageLoading = (
  isDataLoading: boolean, 
  options: UsePageLoadingOptions = {}
) => {
  const { showLoading, hideLoading } = useLoading()
  const { loadingMessage, delay = 500 } = options

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    if (isDataLoading) {
      showLoading(loadingMessage)
    } else {
      // Add a small delay to prevent flashing
      timeoutId = setTimeout(() => {
        hideLoading()
      }, delay)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      hideLoading()
    }
  }, [isDataLoading, loadingMessage, delay, showLoading, hideLoading])
}

// Hook สำหรับ navigation loading
export const useNavigationLoading = () => {
  const { showLoading, hideLoading } = useLoading()

  const startNavigation = (message?: string) => {
    showLoading(message || "กำลังนำท่านไปสู่การเปลี่ยนแปลง")
  }

  const finishNavigation = () => {
    setTimeout(() => {
      hideLoading()
    }, 300) // Small delay for smooth transition
  }

  return { startNavigation, finishNavigation }
}