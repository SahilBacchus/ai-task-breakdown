// app/main/page.tsx
'use client'

import { ProjectInput } from '@/components/project-input'

export default function MainPage() {
  const handleProjectSubmit = (description: string) => {
    console.log('Project description:', description)
    // Handle the submission
  }

  return <ProjectInput onSubmit={handleProjectSubmit} />
}