import './style.css';

const app = document.getElementById('app');
app.innerHTML = `
  <main class="container">
    <h1>Welcome 👋</h1>
    <p>Your Vite + JS site is running.</p>
    <p>Edit <code>src/main.js</code> and save to see HMR in action.</p>
  </main>
`;

if (import.meta.hot) {
  import.meta.hot.accept();
}
