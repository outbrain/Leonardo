import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import './styles/index.less';
import {App} from './components/App/App';

const container = document.getElementById('app');
const root = ReactDOM.createRoot(container);
root.render(<App />);


