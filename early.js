const themes = {
    // These strings also need to match:
    // - the names of the linked CSS theme files
    // - the "value" of the radio buttons for choosing the theme
    LIGHT : "light",
    DARK : "dark"
}

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
        return themes.DARK
    } else {
        return themes.LIGHT
    }
}

function changeThemeResource(theme) {
    // TODO load all the images in the theme 
    document.getElementById("themeStyle").href = "themes/" + theme + "/theme" + ".css"
}