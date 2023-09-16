const { Parser } = require("json2csv")
const fs = require('fs')

function toCSV(data) {
  const jsonToCSV = new Parser();
  console.log(data)
  try{
    fs.writeFileSync('./exports/list-users.csv', data, (err) => {
      if(err) {
        throw err
      } else {
        console.log("arquivo salvo com sucesso!!!")
        return jsonToCSV.parse(data)
      }
    })
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  toCSV
}