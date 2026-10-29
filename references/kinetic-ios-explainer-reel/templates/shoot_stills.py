import sys, asyncio
from playwright.async_api import async_playwright
TIMES=[("kf1_hook",2.9),("kf2_counters",9.6),("kf3_system",15.9),("kf4_cta",33.5)]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={"width":1080,"height":1920})
        for name,t in TIMES:
            await pg.goto(f"file:///path/to/your/project/kf/index.html?t={t}")
            await pg.wait_for_selector("body[data-ready='1']")
            await pg.wait_for_timeout(150)
            await pg.locator("#root").screenshot(path=f"/path/to/your/project/kf/{name}.png")
            print(name)
        await b.close()
asyncio.run(main())
