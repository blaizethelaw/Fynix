import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import Docs from './Docs'

expect.extend(matchers)

describe('Docs', () => {
  it('redirects to first doc when slug is missing', async () => {
    render(
      <MemoryRouter initialEntries={['/docs']}>
        <Routes>
          <Route path="/docs" element={<Docs />} />
          <Route path="/docs/:slug" element={<Docs />} />
        </Routes>
      </MemoryRouter>
    )
    expect(
      await screen.findByRole('heading', {
        name: 'Financial Planning for Difficult Situations'
      })
    ).toBeInTheDocument()
  })

  it('renders doc content for given slug', () => {
    render(
      <MemoryRouter initialEntries={['/docs/financial-recovery-and-credit-rebuilding']}>
        <Routes>
          <Route path="/docs/:slug" element={<Docs />} />
        </Routes>
      </MemoryRouter>
    )
    expect(
      screen.getByRole('heading', {
        name: 'Financial Recovery and Credit Rebuilding'
      })
    ).toBeInTheDocument()
  })
})
