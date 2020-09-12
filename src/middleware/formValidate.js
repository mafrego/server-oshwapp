// const db = require('../service/validate.js')
const { ErrorHandler } = require('../helpers/error')
const regex = require('../service/regex')

const projectFormValidate = async (req, res, next) => {
  try {
    const { name } = req.body
    if (!regex.isAlphanumericString(name)) {
      throw new ErrorHandler(400, 'name not valid!')
    }
    const { description } = req.body
    if (!regex.isDescriptionString(description)) {
      throw new ErrorHandler(400, 'description not valid!')
    }
    const { version } = req.body
    if (!regex.isSemanticVersion(version)) {
      throw new ErrorHandler(400, 'version not valid!')
    }
    const { license } = req.body
    if (!regex.isAlphanumericString(license)) {
      throw new ErrorHandler(400, 'license not valid!')
    }
    const { country } = req.body
    if (!regex.isISO31661(country)) {
      throw new ErrorHandler(400, 'country not valid!')
    }
    const { region } = req.body
    if (region) {
      if (!regex.isISO31662(region)) {
        throw new ErrorHandler(400, 'region not valid!')
      }
    }
    const { link } = req.body
    if (link) {
      if (!regex.isHTTP(link)) {
        throw new ErrorHandler(400, 'link not valid!')
      }
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