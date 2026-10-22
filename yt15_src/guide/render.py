import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--allow-file-access-from-files'])
        pg = await b.new_page(viewport={'width': 794, 'height': 1123})
        await pg.goto('file:///root/yt15/guide/guide.html'); await pg.wait_for_timeout(800)
        await pg.emulate_media(media='print')
        m = await pg.evaluate("""()=>[...document.querySelectorAll('.page')].map(p=>{const f=p.querySelector('.ft').getBoundingClientRect().top;let mb=0;p.querySelectorAll('.page > *:not(.ft), .in > *').forEach(c=>{if(c.classList.contains('art')||c.classList.contains('ov'))return;mb=Math.max(mb,c.getBoundingClientRect().bottom)});return Math.round(f-mb)})""")
        print('gap px per page', m)
        await pg.pdf(path='FULGORTEC-Guia-IA-no-Cinema.pdf', prefer_css_page_size=True, print_background=True)
        await b.close()
asyncio.run(main())
