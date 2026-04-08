export const environment = {
  production: true,
  // apiUrl: 'https://0m8wdbziw1.execute-api.ap-south-2.amazonaws.com/infospokeProd/Infospoke',
  tokenRefreshInterval: 840000,
  apiUrl: 'http://172.16.1.101:5003/infospoke-portal',
  atsUrl : 'http://172.16.1.101:5003/ats',
  resumeDownloadApi:"https://0m8wdbziw1.execute-api.ap-south-2.amazonaws.com/infospokeProd/Website/job/download",
  //resumeDownloadApi:"http://localhost:5000/job/download",
  //atsUrl:"http://localhost:5002/api",
  //atsUrl: 'http://43.205.207.97:5002/api'
  // atsUrl:"https://0m8wdbziw1.execute-api.ap-south-2.amazonaws.com/infospokeProd/ats/api",
  appName: 'Infospoke Admin',
  version: '2.0.0',
};