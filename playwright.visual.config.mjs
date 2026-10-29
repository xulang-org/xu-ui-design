import config from './playwright.config.mjs';
export default {
  ...config,
  testMatch:'visual.spec.mjs',
  outputDir:'.local/visual-results',
  retries:0,
  reporter:[['list'],['html',{outputFolder:'.local/visual-report',open:'never'}]],
  projects:config.projects.filter(project=>project.name==='chromium')
};
