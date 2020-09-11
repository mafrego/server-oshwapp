// const db = require('../service/validate.js')
const { ErrorHandler } = require('../helpers/error')

// TODO create service module to put all regex functions
function isAlphanumericString(str) {
  const pattern = /^[-0-9a-zA-Z_]+$/;     //plus hyphens and underscores
  return pattern.test(str)
}


const projectFormValidate = async (req, res, next) => {
  try {
    const {name} = req.body
    if (!isAlphanumericString(name)) {
      throw new ErrorHandler(400, 'name not valid')
    }
    next()
  } catch (error) {
    next(error)
  }
}

// const assemblyFormValidate = (req, res, next) => {

// }

module.exports = {
  projectFormValidate: projectFormValidate,
  // assemblyFormValidate: assemblyFormValidate
}