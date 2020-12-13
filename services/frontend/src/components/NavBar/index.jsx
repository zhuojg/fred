import React, { useState, useEffect } from 'react'
import { Menu, Avatar, Button, Popover } from 'antd'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import styles from './index.module.scss'

const NavBar = props => {
  // const { logoutUser, isAuthenticated, navMenu, getUserStatus } = props
  const { authed, getUserStatus } = props

  const [popoverContent, setPopoverContent] = useState(<div></div>)

  useEffect(() => {
    const initUserData = async () => {
      let data = await getUserStatus()
      if (data && data.email && data.username) {
        setPopoverContent(
          <div>
            <div>E-mail: {data.email}</div>
            <div>Username: {data.username}</div>
          </div>,
        )
      } else {
        console.log(data)
      }
    }
    initUserData()
  }, [])

  const menu = (
    <>
      {authed ? (
        <div className={styles.navbar_avatar}>
          <Popover
            placement="bottomRight"
            content={popoverContent}
            arrowPointAtCenter
          >
            <Avatar
              style={{ verticalAlign: 'center' }}
              onClick={() => {
                window.location.href = '/user'
              }}
            >
              test
            </Avatar>
          </Popover>
        </div>
      ) : (
        <div className={styles.navbar_button}>
          <Button type="primary">
            <Link to="/register">Register</Link>
          </Button>
          <Button style={{ marginLeft: '12px' }}>
            <Link to="/login">Login</Link>
          </Button>
        </div>
      )}
    </>
  )

  return <div className={styles.navbar_wrap}>{menu}</div>
}

// NavBar.propTypes = {
//   logoutUser: PropTypes.func.isRequired,
//   isAuthenticated: PropTypes.func.isRequired,
// }

export default NavBar
