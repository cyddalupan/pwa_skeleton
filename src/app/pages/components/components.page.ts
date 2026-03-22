import { Component } from '@angular/core';

@Component({
  selector: 'app-components',
  templateUrl: './components.page.html',
  styleUrls: ['./components.page.scss']
})
export class ComponentsPage {
  components = [
    { name: 'Buttons', icon: 'radio-button-on', description: 'Various button styles and states' },
    { name: 'Cards', icon: 'card', description: 'Card layouts with headers and content' },
    { name: 'Lists', icon: 'list', description: 'Ionic list components with items' },
    { name: 'Inputs', icon: 'create', description: 'Form inputs and validation' },
    { name: 'Modals', icon: 'albums', description: 'Modal dialogs and popups' },
    { name: 'Tabs', icon: 'folder', description: 'Tab navigation and routing' },
    { name: 'Grid', icon: 'grid', description: 'Responsive grid system' },
    { name: 'Icons', icon: 'star', description: 'Ionic icon library' }
  ];

  constructor() {}
}