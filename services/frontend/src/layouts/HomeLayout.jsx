import React from 'react'
import NavBar from '../components/NavBar'
import ProLayout, { Footer, PageContainer } from '@ant-design/pro-layout'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'

function RouteWithSubRoutes(route) {
  return (
    <Route
      path={route.path}
      render={props => (
        // pass the sub-routes down to keep nesting
        <route.component {...route.props} {...props} routes={route.routes} />
      )}
    />
  )
}

const HomeLayout = props => {
  const { isAuthenticated, logoutUser, routes, navMenu } = props

  return (
    <>
      <ProLayout
        style={{ minHeight: '100vh' }}
        layout="top"
        navTheme="light"
        logo={false}
        title="Fred"
        disableContentMargin
        menuDataRender={() => navMenu}
        onMenuHeaderClick={() => {
          window.location.href = '/'
        }}
        rightContentRender={() => (
          <NavBar
            isAuthenticated={isAuthenticated}
            logoutUser={logoutUser}
            navMenu={navMenu}
          />
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

export default HomeLayout
