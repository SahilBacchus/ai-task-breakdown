'use client'

import { useState } from 'react'
import { Sparkles, ArrowRight, Lightbulb, LayoutGrid, MessageSquare } from 'lucide-react'
import styles from './project-input.module.css'

interface ProjectInputProps {
  onSubmit: (title: string, description: string) => void
}

const exampleProjects = [
  {
    title: 'E-commerce Platform',
    description: 'Build an online store with product catalog, shopping cart, and checkout',
    fullDescription: 'Build an e-commerce platform with a product catalog featuring categories and search functionality. Include a shopping cart system, user authentication, checkout process with payment integration, and an admin dashboard for inventory management.',
  },
  {
    title: 'Task Management App',
    description: 'Create a collaborative task tracker with teams and deadlines',
    fullDescription: 'Create a task management application with user workspaces, project organization, task assignment, due dates, priority levels, and progress tracking. Include team collaboration features and notification system.',
  },
  {
    title: 'Blog Platform',
    description: 'Develop a content management system with posts and comments',
    fullDescription: 'Develop a blog platform with a rich text editor, post scheduling, categories and tags, comment system with moderation, user profiles, and SEO optimization features.',
  },
  {
    title: 'Fitness Tracker',
    description: 'Design a health app with workout logging and progress charts',
    fullDescription: 'Design a fitness tracking application with workout logging, exercise library, progress charts and statistics, goal setting, meal planning integration, and social features for workout sharing.',
  },
]

export function ProjectInput({ onSubmit }: ProjectInputProps) {
  const [projectTitle, setProjectTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (projectTitle.trim() && description.trim().length >= 20) {
      onSubmit(projectTitle.trim(), description.trim())
    }
  }

  const handleExampleClick = (fullDescription: string) => {
    setDescription(fullDescription)
  }

  const isValid = projectTitle.trim() && description.trim().length >= 20

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.iconWrapper}>
            <Sparkles className={styles.icon} />
          </div>
          <h1 className={styles.title}>AI Task Breakdown</h1>
          <p className={styles.subtitle}>
            Transform your project ideas into actionable tasks
          </p>
        </header>

        <div className={styles.card}>
          <div className={styles.inputGroup}>
            <label htmlFor="project-title" className={styles.label}>
              Project Title
            </label>
            <input
              id="project-title"
              type="text"
              className={styles.input}
              placeholder="e.g., My E-commerce App"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="project-description" className={styles.label}>
              Project Description
            </label>
            <textarea
              id="project-description"
              className={styles.textarea}
              placeholder="Describe your project in detail. Include features, functionality, and any specific requirements you have in mind..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
            />
            <span className={styles.charCount}>
              {description.length} / 2000 characters (minimum 20)
            </span>
          </div>

          <div className={styles.buttonWrapper}>
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={!isValid}
            >
              Generate Tasks
              <ArrowRight className={styles.buttonIcon} />
            </button>
          </div>
        </div>

        <section className={styles.examplesSection}>
          <h2 className={styles.examplesTitle}>Try an example</h2>
          <div className={styles.examplesGrid}>
            {exampleProjects.map((example) => (
              <button
                key={example.title}
                className={styles.exampleButton}
                onClick={() => {
                  setProjectTitle(example.title)
                  handleExampleClick(example.fullDescription)
                }}
              >
                <Lightbulb className={styles.exampleIcon} />
                <div className={styles.exampleContent}>
                  <span className={styles.exampleTitle}>{example.title}</span>
                  <span className={styles.exampleDescription}>
                    {example.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}