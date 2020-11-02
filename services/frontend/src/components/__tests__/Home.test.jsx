import React from 'react'
import { cleanup, wait } from '@testing-library/react'

import Home from '../Home'

afterEach(cleanup)

describe('renders', () => {
  test('snapshot', () => {
    const { asFragment } = renderWithRouter(<Home />)
    expect(asFragment()).toMatchSnapshot()
  })
})
