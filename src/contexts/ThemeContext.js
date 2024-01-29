import React, { createContext, useState } from 'react'

export const ThemeContext = createContext()

const pinkThemeLight = {
    type: 'light',
    primary: '#cb5774',
    primary400: '#e56f9d',
    primary600: '#cb5774',
    primary80: '#ff4f93cc',
    primary50: '#ff4f9380',
    primary30: '#420D1A',
    secondary: '#ffdde5bd',
    secondary70: '#eaeaeab3',
    secondary50: '#eaeaea80',
    tertiary: '#212121',
    tertiary80: '#212121cc',
    tertiary70: '#212121b3',
    tertiary50: '#21212180',
}

const pinkThemeDark = {
    type: 'dark',
    primary: '#ff4f93',
    primary400: '#e56f9d',
    primary600: '#e14381',
    primary80: '#ff4f93cc',
    primary50: '#ff4f9380',
    primary30: '#ff4f934d',
    secondary: '#212121',
    secondary70: '#212121b3',
    secondary50: '#21212180',
    tertiary: '#eaeaea',
    tertiary80: '#eaeaeacc',
    tertiary70: '#eaeaeab3',
    tertiary50: '#eaeaea80',
}

const themeData = {
    pinkThemeLight,
    pinkThemeDark
}


function ThemeContextProvider(props) {
    const [theme, setTheme] = useState(themeData.pinkThemeLight)
    const [drawerOpen, setDrawerOpen] = useState(false)

    const setHandleDrawer = () => {
        setDrawerOpen(!drawerOpen)
    }

    const value = { theme, drawerOpen, setHandleDrawer }
    return (
        <ThemeContext.Provider value={value}>
            {props.children}
        </ThemeContext.Provider>
    )
}

export default ThemeContextProvider