import React from 'react'
import { cleanup, wait } from '@testing-library/react'
import axios from 'axios'

import Status from '../Status'

afterEach(cleanup)

jest.mock('axios')

axios.mockImplementation(() =>
  Promise.resolve({
    data: { email: 'test@test.com', username: 'test' },
  }),
)

const props = {
  isAuthenticated: () => {
    return true
  },
  accessToken: undefined,
  getUserStatus: async () => {
    const options = {
      url: `${process.env.REACT_APP_BACKEND_SERVICE_URL}/auth/status`,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${props.accessToken}`,
      },
    }
    return axios(options)
      .then(res => {
        return res.data
      })
      .catch(error => {
        console.log(error)
        return error
      })
  },
}

test('renders properly when authenticated', async () => {
  const { container, findByTestId } = renderWithRouter(<Status {...props} />)
  await wait(() => {
    expect(axios).toHaveBeenCalledTimes(1)
  })
  expect((await findByTestId('user-email')).innerHTML).toBe('test@test.com')
  expect((await findByTestId('user-username')).innerHTML).toBe('test')
})

test('renders', async () => {
  const { asFragment } = renderWithRouter(<Status {...props} />)
  await wait(() => {
    expect(axios).toHaveBeenCalled()
  })
  expect(asFragment()).toMatchSnapshot()
})
