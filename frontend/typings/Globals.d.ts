declare module '*.module.css';

interface Window {
  Prowlarr: {
    apiKey: string;
    apiRoot: string;
    instanceName: string;
    theme: string;
    urlBase: string;
    version: string;
  };
}
