import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { message } from 'antd'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Status from './components/Status'
import UserList from './components/UserList'
import HomeLayout from './layouts/HomeLayout'
import UserLayout from './layouts/UserLayout'
import styles from './App.module.scss'
import Image404 from './img/404.svg'
import { UserOutlined } from '@ant-design/icons'
import './App.scss'

const App = () => {
  const [accessToken, setAccessToken] = useState(null)

  const getUsers = async () => {
    return axios
      .get(`${process.env.REACT_APP_BACKEND_SERVICE_URL}/users`)
      .then(res => {
        return res.data
      })
      .catch(err => {
        console.log(err)
        return []
      })
  }

  const getUserStatus = async () => {
    const options = {
      url: `${process.env.REACT_APP_BACKEND_SERVICE_URL}/auth/status`,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
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
  }

  const addUser = async data => {
    const url = `${process.env.REACT_APP_BACKEND_SERVICE_URL}/users`
    return axios
      .post(url, data)
      .then(res => {
        return res
      })
      .catch(err => {
        return err
      })
  }

  const deleteUser = async id => {
    const url = `${process.env.REACT_APP_BACKEND_SERVICE_URL}/users/${id}`
    return axios
      .delete(url)
      .then(res => {
        return res
      })
      .catch(err => {
        return err
      })
  }

  const editUser = async data => {
    const url = `${process.env.REACT_APP_BACKEND_SERVICE_URL}/users/${data.id}`
    return axios
      .put(url, data)
      .then(res => {
        return res
      })
      .catch(err => {
        return err
      })
  }

  const validRefresh = () => {
    const token = window.localStorage.getItem('refreshToken')
    if (token) {
      return axios
        .post(`${process.env.REACT_APP_BACKEND_SERVICE_URL}/auth/refresh`, {
          refresh_token: token,
        })
        .then(res => {
          setAccessToken(res.data.access_token)
          // getUsers()
          window.localStorage.setItem('refreshToken', res.data.refresh_token)
          return true
        })
        .catch(err => {
          console.log(err)
          return false
        })
    }
    return false
  }

  const isAuthenticated = () => {
    if (accessToken || validRefresh()) {
      return true
    }
    return false
  }

  const handleRegisterFormSubmit = async data => {
    const url = `${process.env.REACT_APP_BACKEND_SERVICE_URL}/auth/register`
    return axios
      .post(url, data)
      .then(res => {
        return res
      })
      .catch(err => {
        return err
      })
  }

  const handleLoginFormSubmit = async data => {
    const url = `${process.env.REACT_APP_BACKEND_SERVICE_URL}/auth/login`
    return axios
      .post(url, data)
      .then(res => {
        setAccessToken(res.data.access_token)
        getUsers()
        window.localStorage.setItem('refreshToken', res.data.refresh_token)
        return res
      })
      .catch(err => {
        return err
      })
  }

  const logoutUser = () => {
    window.localStorage.removeItem('refreshToken')
    setAccessToken(null)
    message.success('You have logged out.')
  }

  const PageNotFound = () => (
    <div className={styles.not_found}>
      <div className={styles.not_found_title}>Oops, Page Not Found!</div>

      <div className={styles.not_found_image}>
        <img src={Image404} width="50%" alt="404 Page Not Found" />
      </div>
    </div>
  )

  const routes = [
    {
      path: '/user',
      name: 'User',
      component: UserLayout,
      routes: [
        {
          path: '/user',
          name: 'User',
          icon: <UserOutlined />,
          routes: [
            {
              path: '/user/status',
              name: 'User Status',
              exact: true,
              component: Status,
              props: {
                isAuthenticated,
                getUserStatus,
              },
            },
            {
              path: '/user/list',
              name: 'User List',
              exact: true,
              component: UserList,
              props: {
                isAuthenticated,
                getUsers,
                addUser,
                deleteUser,
              },
            },
          ],
        },
      ],
    },
    {
      path: '/login',
      name: 'Login',
      exact: true,
      component: Login,
      props: {
        isAuthenticated,
        handleLoginFormSubmit,
      },
    },
    {
      path: '/register',
      name: 'Register',
      exact: true,
      component: Register,
      props: {
        handleRegisterFormSubmit,
      },
    },
    {
      path: '/',
      exact: true,
      component: Home,
    },
    {
      path: '*',
      component: PageNotFound,
    },
  ]

  const navMenu = [
    {
      path: '/page1',
      name: 'Page1',
    },
    {
      path: '/page2',
      name: 'Page2',
    }
  ]

  return (
    <Router>
      <Switch>
        <HomeLayout
          isAuthenticated={isAuthenticated}
          logoutUser={logoutUser}
          routes={routes}
          navMenu={navMenu}
        />
      </Switch>
    </Router>
  )
}

export default App
