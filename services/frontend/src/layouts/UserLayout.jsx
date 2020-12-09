import React, { useState, useEffect } from 'react'
import ProLayout, { DefaultFooter, PageContainer } from '@ant-design/pro-layout'
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

const UserLayout = props => {
  const { routes } = props

  return (
    <ProLayout
      style={{ height: '100%', width: '100%' }}
      logo={false}
      title="Center"
      // navTheme="light"
      headerRender={false}
      // collapsedButtonRender={false}
      // collapsed={false}
      menuDataRender={() => routes}
      menuItemRender={(item, dom) => <Link to={item.path}>{dom}</Link>}
      footerRender={false}
    >
      <PageContainer>
        {routes[0].routes.map((route, i) => (
          <RouteWithSubRoutes key={i} {...route} />
        ))}
      </PageContainer>
    </ProLayout>
  )
}

export default UserLayout
