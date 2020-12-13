import React from 'react'
// import NavBar from '../components/NavBar'
import { Button } from 'antd'
import ProLayout, { Footer, PageContainer } from '@ant-design/pro-layout'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'
import { RouteWithSubRoutes } from '../App'

const BasicLayout = props => {
  const { routes, homeNavMenu } = props

  return (
    <>
      <ProLayout
        style={{ minHeight: '100vh' }}
        layout="top"
        navTheme="light"
        logo={false}
        title="Fred"
        disableContentMargin
        menuDataRender={() => homeNavMenu}
        onMenuHeaderClick={() => {
          window.location.href = '/'
        }}
        rightContentRender={() => (
          <div>
            <Button type="primary">
              <Link to="/register">Register</Link>
            </Button>
            <Button style={{ marginLeft: '12px' }}>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        )}
      >
        <Switch>
          {routes.map((route, i) => (
            <RouteWithSubRoutes key={i} {...route} />
          ))}
        </Switch>
      </ProLayout>
    </>
  )
}

export default BasicLayout
