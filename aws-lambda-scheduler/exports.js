'use strict';
const axios = require('axios')

module.exports.luvbotScheduler = async (event, context) => {
  return new Promise((resolve, reject) => {
  axios.get('https://nodebot-rdetwukqdy.now.sh/make-playlist')
    .then((res) => {
      console.log('RESPONSE: ',res.data)
      resolve('Successful')
    })
    .catch((e) => {
      console.log('ERROR: ', e)
      reject('Error')
    }) 
  })
};