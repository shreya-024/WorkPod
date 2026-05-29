const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
    
    // Override localStorage to bypass protected route
    await page.goto('http://localhost:5174');
    await page.evaluate(() => {
      // Set Zustand store state so ProtectedSim doesn't redirect
      localStorage.setItem('sim-store', JSON.stringify({
        state: {
          role: 'SDE',
          scenario: {
            teamName: 'Test',
            members: [],
            tasks: []
          },
          messages: []
        }
      }));
    });
    
    await page.goto('http://localhost:5174/sim');
    
    // Wait for the channel list to load
    await page.waitForSelector('button', { timeout: 5000 });
    
    // Click whiteboard
    const buttons = await page.$$('button');
    let clicked = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('whiteboard')) {
        await btn.click();
        clicked = true;
        break;
      }
    }
    
    if (clicked) {
      console.log('Clicked whiteboard, waiting 2s...');
      await new Promise(r => setTimeout(r, 2000));
    }
    
    await browser.close();
  } catch (err) {
    console.log('SCRIPT_ERROR:', err.message);
  }
})();
