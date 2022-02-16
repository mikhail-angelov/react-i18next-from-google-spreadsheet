const { GoogleSpreadsheet } = require('google-spreadsheet')
const fs = require('fs')
const TRANSLATION_FILE = 'translation.json'

const load = async (options) => {
  const doc = new GoogleSpreadsheet(options.docId)
  doc.useApiKey(options.apiKey)
  try {
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[options.sheet - 1]
    const row_data = await sheet.getRows()
    const header = sheet.headerValues
    const colCount = header.length
    const rowCount = row_data.length
    
    const converted = {}
    let commentsColumnIndex

    for (let i = 1; i < colCount; i++) {
      if (options.ignoreCommentsColumn == true && header[i] == 'comments') {
        // do nothing
        commentsColumnIndex = i
      }
    }

    for (let i = 0; i < rowCount; i++) {
      for (let j = 1; j < colCount; j++) {
        if (options.ignoreCommentsColumn && j == commentsColumnIndex) {
          // do nothing
        } else {
          let lang = header[j]
          converted[lang] = converted[lang] || {}

          console.log(lang, i,j)
          const row = row_data[i]
          if (row === undefined) {
            continue
          }
          if (options.warnOnMissingValues && !row[header[j]]) {
            console.log('Cell is missing value at col ' + lang + ', row ' + i)
            throw new Error('Cell is missing value at col ' + lang + ', row ' + i)
          }
          const base = row[header[0]]
          const data = row[header[j]]
          converted[lang][base] = data
        }
      }
    }

    return converted
  } catch (e) {
    console.log('error', e)
    return null
  }

}

const save = (options, data) => {
  const folderName = options.folderName

  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName)
    }
  } catch (e) {
    console.log(`Invalid 'location' parameter: ${folderName}`)
    throw `Invalid 'location' parameter: ${folderName}`
  }

  Object.keys(data).forEach(lang => {
    try {
      fs.existsSync(`${folderName}/${lang}`)
    } catch (e) {
      console.log(`Invalid 'language' name: ${lang}`, e)
      throw `Invalid 'language' name: ${lang}`
    }
    if (!fs.existsSync(`${folderName}/${lang}`)) {
      try {
        fs.mkdirSync(`${folderName}/${lang}`)
      } catch (e) {
        console.log(`Invalid 'language' name: ${lang}`, e)
        throw `Invalid 'language' name: ${lang}`
      }
    }
    const content = JSON.stringify(data[lang], null, '\t')
    fs.writeFileSync(`${folderName}/${lang}/${TRANSLATION_FILE}`, content)
  })
}

module.exports = { load, save }
