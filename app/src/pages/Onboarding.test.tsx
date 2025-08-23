import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import Onboarding from './Onboarding'
import useOnboardingStore from './Onboarding/useOnboardingStore'

expect.extend(matchers)

describe('Onboarding', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset()
    localStorage.clear()
  })

  it('completes flow and redirects to dashboard', async () => {
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.input(screen.getByLabelText(/baseline income/i), {
      target: { value: '5000' },
    })
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    await screen.findByLabelText(/debts/i)
    fireEvent.input(screen.getByLabelText(/debts/i), {
      target: { value: '1000' },
    })
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    await screen.findByLabelText(/target/i)
    fireEvent.input(screen.getByLabelText(/target/i), {
      target: { value: '2000' },
    })
    fireEvent.click(screen.getByRole('button', { name: /finish/i }))

    expect(await screen.findByText(/dashboard page/i)).toBeInTheDocument()
  })
})
