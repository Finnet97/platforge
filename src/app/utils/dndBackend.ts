import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'

export function getDndBackend(isMobile: boolean) {
  return isMobile ? TouchBackend : HTML5Backend
}

export function getDndOptions(isMobile: boolean) {
  return isMobile ? { delay: 200 } : undefined
}
