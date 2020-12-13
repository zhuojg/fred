import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { message } from 'antd'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Status from './components/Status'
import UserList from './components/UserList'
import BasicLayout from './layouts/BasicLayout'
import MainLayout from './layouts/MainLayout'
import styles from './App.module.scss'
import Image404 from './img/404.svg'
import { UserOutlined } from '@ant-design/icons'
import './App.scss'

export function RouteWithSubRoutes(route) {
  return (
    <Route
      path={route.path}
      exact={route.exact}
      render={props => {
        console.log(props, 'route')
        // pass the sub-routes down to keep nesting
        return (
          <route.component {...route.props} {...props} routes={route.routes} />
        )
      }}
    />
  )
}

const App = () => {
  const [accessToken, setAccessToken] = useState(null)
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState(<></>)

  useEffect(() => {
    const getInitState = async () => {
      await isAuthenticated()
      setLoading(false)
    }
    getInitState()
  }, [])

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

  const isAuthenticated = async () => {
    if (accessToken || (await validRefresh())) {
      setAuthed(true)
      return true
    }
    setAuthed(false)
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

  // nav menu for landing page
  const homeRoute = [
    {
      path: '/page1',
      exact: true,
      name: 'Page 1',
    },
    {
      path: '/page2',
      exact: true,
      name: 'Page 2',
    },
  ]

  const userRoute = [
    {
      path: '/user',
      exact: true,
      name: 'User',
      // component: Status,
      props: {
        authed,
        getUserStatus,
      },
    },
    {
      path: '/user/status',
      exact: true,
      name: 'User Status',
      component: Status,
      props: {
        authed,
        getUserStatus,
      },
    },
    {
      path: '/user/list',
      exact: true,
      name: 'User List',
      component: UserList,
      props: {
        authed,
        getUsers,
        addUser,
        deleteUser,
      },
    },
  ]

  // basic pages
  const basicRoutes = [
    {
      path: '/login',
      name: 'Login',
      exact: true,
      component: Login,
      props: {
        authed,
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

  const routes = userRoute.concat(homeRoute).concat(basicRoutes)

  const homeNavMenu = homeRoute
  const mainNavMenu = [
    {
      path: '/user',
      name: 'User',
      icon: <UserOutlined />,
      routes: [
        {
          path: '/user/status',
          name: 'Status',
        },
        { path: '/user/list', name: 'List' },
      ],
    },
  ]

  useEffect(() => {
    if (loading) {
      // TODO: add content
      setContent(<></>)
    } else {
      let Layout = authed ? MainLayout : BasicLayout
      setContent(
        <Layout
          routes={routes}
          homeNavMenu={homeNavMenu}
          mainNavMenu={mainNavMenu}
          authed={authed}
          getUserStatus={getUserStatus}
        />,
      )
    }
  }, [loading])

  return (
    <Router>
      <Switch>{content}</Switch>
    </Router>
  )
}

export default App
