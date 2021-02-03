const puppeteer = require('puppeteer')
const saveNewCookiesToFile = require('./saveNewCookiesToFile')
const {headlesMode} = require('../appSettings')

async function getInstanceBrowser(user) {

  const {executableBrowserPath: executablePath = '', browserProfilePath: userDataDir = ''} = user

  const browser = await puppeteer.launch({
    headless: headlesMode,
    args: ["--no-sandbox", "--disable-setuid-sandbox", '--start-maximized'],
    // devtools: true,
    executablePath,
    userDataDir
  })


  const page = await browser.newPage()
  await page.setCookie(...user.cookies);

  await page.setRequestInterception(true);

  page.on('request', request => {
    const url = request.url().toLowerCase()
    const resourceType = request.resourceType()

    if (resourceType == 'media' ||
      resourceType === 'image' ||
      resourceType === 'font' ||
      url.endsWith('.mp4') ||
      url.endsWith('.avi') ||
      url.endsWith('.flv') ||
      url.endsWith('.mov') ||
      url.endsWith('.wmv')
    ) {
      request.abort();
    }
    else
      request.continue();
  })



  await page.goto(`https://www.youtube.com`);
  await page.waitFor(3000)
  await page.goto(`https://www.youtube.com`);
  await page.waitFor(3000)

  const login = await detectionLogin(page)

  if (!login) {
    return {
      browser,
      page,
      error: true,
      errorReason: `Login error user: ${user.userName}`
    }
  } else {
    const newCookies = await page.cookies()
    saveNewCookiesToFile(user, newCookies)

    return {
      browser,
      page,
      error: false
    }
  }
}

async function detectionLogin(page) {

  const isLogin = await page.evaluate(checkByExistLoginButton)

  return isLogin


  async function checkByExistLoginButton() {
    const isExistLoginButton = document.querySelector('paper-button.style-scope.ytd-button-renderer.style-suggestive[aria-label="Войти"]')
    return !isExistLoginButton
  }
}


module.exports = getInstanceBrowser;