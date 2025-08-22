import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import { BrandMark } from './BrandMark'

expect.extend(matchers)

describe('BrandMark', () => {
  it('renders byline', () => {
    render(<BrandMark />)
    expect(screen.getByText(/by BLAiZE IT🔥/i)).toBeInTheDocument()
  })
})
