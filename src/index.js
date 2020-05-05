import appName from './app';

const startApp = async () => {
  const header = document.querySelector('[data-app-name]');
  if (!header) return;

  const programName = await appName();
  header.textContent = programName;
};

document.addEventListener('DOMContentLoaded', startApp);
