changeThemeResource(getCurrentTheme())

function getCookie(name) {
    var cookie = document.cookie
      .split("; ")
      .find(row=>row.startsWith(name + "="))
    if (cookie != null) {
      return cookie.split('=')[1]
    }
    return null
}

function getCurrentTheme() {
    var theme = getCookie("theme")
    if (theme != null) {
        return theme
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return "dark_theme"
    } else {
        return "light_theme"
    }
}

function changeThemeResource(theme) {
    document.getElementById("themeStyle").href = theme + ".css"
}