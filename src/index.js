const loader = require('./loader')
var argv = require('minimist')(process.argv.slice(2))

//arguments from terminal
let foundKey = argv.key
let foundLocation = argv.location
let foundRowNumber = argv.firstrow
let apiKey = argv.apikey

if ((typeof foundKey !== 'string' && typeof foundKey !== 'number') || foundKey == '') {
  console.error('Key is required: --key=... ')
  process.exit(1)
}
if ((typeof apiKey !== 'string') || foundKey == '') {
  console.error('api-key is required: --apikey=... ')
  process.exit(1)
}
if ((typeof foundLocation !== 'string' && typeof foundLocation !== 'number') || foundLocation == '') {
  console.error('Location is required: --location=... ')
  process.exit(1)
}
if (typeof foundRowNumber !== 'number' || foundRowNumber == '') {
  console.error('First row is required: --firstrow=... ')
  process.exit(1)
}

const loadOptions = { docId: foundKey, sheet: 1, firstRow: foundRowNumber, ignoreCommentsColumn: true, apiKey }
const saveOptions = { folderName: foundLocation }

loader.load(loadOptions).then((data) => {
  //console.log('-', data)
  try {
    loader.save(saveOptions, data)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
  console.log('!Done!')
}).catch(err => {
  console.error(err)
  process.exit(1)

})
