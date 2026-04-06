export const environment = {
  production: false,
  apiUrl: 'http://172.16.1.101:5003/infospoke-portal',
  // apiUrl:'https://0m8wdbziw1.execute-api.ap-south-2.amazonaws.com/infospokeProd/Infospoke',
  //apiUrl: "http://localhost:5000",
  resumeDownloadApi:"https://0m8wdbziw1.execute-api.ap-south-2.amazonaws.com/infospokeProd/Website/job/download",
  //resumeDownloadApi: "http://localhost:5001/job/download",
  //atsUrl: "http://localhost:5002/api",
  //atsUrl:'https://sqrt8c9q-5002.inc1.devtunnels.ms/api'
  atsUrl:"https://0m8wdbziw1.execute-api.ap-south-2.amazonaws.com/infospokeProd/ats/api",
  tokenRefreshInterval: 840000,
  appName: 'Infospoke Admin',
  version: '2.0.0'
};