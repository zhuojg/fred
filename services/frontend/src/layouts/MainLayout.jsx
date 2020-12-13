import React, { useState, useEffect } from 'react'
import ProLayout, { DefaultFooter, PageContainer } from '@ant-design/pro-layout'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'
import { RouteWithSubRoutes } from '../App'
import NavBar from '../components/NavBar'

const MainLayout = props => {
  const {
    routes,
    homeNavMenu,
    mainNavMenu,
    authed,
    getUserStatus,
  } = props

  return (
    <ProLayout
      style={{ height: '100vh', width: '100%' }}
      logo={false}
      title="Fred"
      navTheme="light"
      onMenuHeaderClick={() => {
        window.location.href = '/'
      }}
      headerRender={() => (
        <NavBar
          authed={authed}
          getUserStatus={getUserStatus}
        />
      )}
      // collapsedButtonRender={false}
      // collapsed={false}
      pageTitleRender={false}
      menuDataRender={() => mainNavMenu}
      menuItemRender={(item, dom) => <Link to={item.path}>{dom}</Link>}
      footerRender={false}
      disableContentMargin
    >
      <PageContainer>
        <Switch>
          {routes.map((route, i) => (
            <RouteWithSubRoutes key={i} {...route} />
          ))}
        </Switch>
      </PageContainer>
    </ProLayout>
  )
}

export default MainLayout
