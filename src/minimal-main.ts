import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MinimalAppModule } from './app/minimal-app.module';

console.log('Minimal Angular app starting...');

platformBrowserDynamic().bootstrapModule(MinimalAppModule)
  .then(() => {
    console.log('✅ Minimal Angular app bootstrapped successfully!');
  })
  .catch(error => {
    console.error('❌ Minimal Angular bootstrap failed:', error);
    document.body.innerHTML = `
      <div style="padding: 40px; color: red; font-family: monospace;">
        <h1>ANGULAR BOOTSTRAP ERROR</h1>
        <p><strong>Error:</strong> ${error.message}</p>
        <p><strong>Stack:</strong></p>
        <pre>${error.stack}</pre>
      </div>
    `;
  });