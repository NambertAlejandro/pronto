const { chromium } = require('@playwright/test');
const fs=require('node:fs');fs.mkdirSync('test-results',{recursive:true});
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH} : {})});
const page=await browser.newPage({viewport:{width:1440,height:1100}});let errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto((process.env.TEMPUS_BASE_URL || 'http://127.0.0.1:4174') + '/contratar',{waitUntil:'networkidle'});await page.screenshot({path:'test-results/tempus-desktop.png',fullPage:true});
await page.getByRole('button',{name:'Escolher Essencial',exact:true}).click();
await page.getByPlaceholder('voce@exemplo.com').fill('demo@example.com');await page.getByRole('button',{name:'Continuar com e-mail',exact:true}).click();
await page.getByPlaceholder('000000').fill('000001');await page.getByRole('button',{name:'Confirmar e continuar',exact:true}).click();
await page.getByText('Código incorreto. Na demonstração, use 123456.').waitFor();await page.getByPlaceholder('000000').fill('123456');await page.getByRole('button',{name:'Confirmar e continuar',exact:true}).click();
await page.getByPlaceholder('Seu nome e sobrenome').fill('Nambert Silva');await page.getByRole('button',{name:'Continuar para pagamento',exact:true}).click();
await page.getByRole('button',{name:'Pix',exact:true}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Simular pedido com Pix',exact:true}).click();
await page.getByRole('button',{name:'Simular expiração',exact:true}).click();await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();
await page.getByRole('button',{name:'Simular confirmação',exact:true}).click();await page.getByRole('button',{name:'Configurar minha barbearia',exact:true}).click();await page.getByRole('dialog').waitFor();await page.getByRole('button',{name:'Voltar à confirmação',exact:true}).click();
await page.screenshot({path:'test-results/tempus-confirmado.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Explorar estados',exact:true}).click();await page.getByRole('button',{name:'Escolha do plano',exact:true}).click();await page.screenshot({path:'test-results/tempus-mobile.png',fullPage:true});
const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('Mobile horizontal overflow');
await page.getByRole('button',{name:'Reiniciar demonstração',exact:true}).click();await page.getByRole('button',{name:'Reiniciar fluxo',exact:true}).click();await page.getByRole('button',{name:'Escolher Profissional',exact:true}).click();await page.getByRole('button',{name:'Continuar com Apple',exact:true}).click();await page.getByRole('button',{name:'Continuar em demonstração',exact:true}).click();
if(errors.length)throw Error(errors.join('\n'));console.log('PASS: email validation, OTP error and success, account, checkout, Pix retry, confirmation boundary, Apple demo and mobile overflow.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});


