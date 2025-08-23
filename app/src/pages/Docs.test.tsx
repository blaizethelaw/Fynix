import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import Docs from './Docs'

expect.extend(matchers)

describe('Docs', () => {
  it('renders default docs page', () => {
    render(
      <MemoryRouter initialEntries={['/docs']}>
        <Routes>
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /docs/i })).toBeInTheDocument()
  })

  it('renders docs with slug', () => {
    render(
      <MemoryRouter initialEntries={['/docs/some-guide']}>
        <Routes>
          <Route path="/docs/:slug" element={<Docs />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /docs: some-guide/i })).toBeInTheDocument()
  })
})
