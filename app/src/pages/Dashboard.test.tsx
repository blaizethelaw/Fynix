import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import Dashboard from './Dashboard'

expect.extend(matchers)

describe('Dashboard', () => {
  it('displays resource titles', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(
      screen.getByText(
        /The Phoenix Plan: A Strategic Guide to Financial Recovery/i
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /The Architecture of Financial Transformation/i
      )
    ).toBeInTheDocument()
  })
})
