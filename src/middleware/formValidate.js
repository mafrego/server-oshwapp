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
    if (region) {                                           // region is not required
      if (!regex.isISO31662(region)) {
        throw new ErrorHandler(400, 'region not valid!')
      }
    }
    const { link } = req.body
    if (link) {                                            // link is not required
      if (!regex.isHTTP(link)) {
        throw new ErrorHandler(400, 'link not valid!')
      }
    }
    next()
  } catch (error) {
    next(error)
  }
}

const atomFormValidate = (req, res, next) => {
  try {
    const { name } = req.body
    if (!regex.isAlphanumericString(name)) {
      throw new ErrorHandler(400, 'name not valid!')
    }
    const { description } = req.body
    if (!regex.isDescriptionString(description)) {
      throw new ErrorHandler(400, 'description not valid')
    }
    const { moq } = req.body
    if (!regex.isPositiveInt(moq)) {
      throw new ErrorHandler(400, 'moq not valid!')
    }
    const { quantity } = req.body
    if (!regex.isPositiveInt(quantity)) {
      throw new ErrorHandler(400, 'quantity not valid!')
    }
    const { unitCost } = req.body
    if (!regex.isPositiveFloat(unitCost)) {
      throw new ErrorHandler(400, 'unit cost not valid!')
    }
    const { currency } = req.body
    if (!regex.isCurrency(currency)) {
      throw new ErrorHandler(400, 'currency not valid!')
    }
    const { GTIN } = req.body
    if (GTIN) {
      if (!regex.isGTIN(GTIN)) {
        throw new ErrorHandler(400, 'GTIN not valid!')
      }
    }
    const { SKU } = req.body
    if (SKU) {
      if (!regex.isAlphanumericString(SKU)) {
        throw new ErrorHandler(400, 'SKU not valid!')
      }
    }
    const { vendorUrl } = req.body
    if (vendorUrl) {                                            // vendor URL is not required
      if (!regex.isHTTP(vendorUrl)) {
        throw new ErrorHandler(400, 'vendor Url not valid!')
      }
    }
    const { leadTime } = req.body
    if (leadTime) {                                            // duration not required
      if (!regex.isDurationISO8601(leadTime)) {
        throw new ErrorHandler(400, ' leadTime not valid!')
      }
    }
    const { link } = req.body
    if (link) {                                            // link is not required
      if (!regex.isHTTP(link)) {
        throw new ErrorHandler(400, 'link not valid!')
      }
    }
    const { notes } = req.body
    if (notes) {                                            // notes are not required
      if (!regex.isAlphanumericString(notes)) {
        throw new ErrorHandler(400, 'notes not valid!')
      }
    }
    next()
  } catch (error) {
    next(error)
  }
}

const atomUpdateFormValidate = (req, res, next) => {
  try {
    // const { name } = req.body
    // if (!regex.isAlphanumericString(name)) {
    //   throw new ErrorHandler(400, 'name not valid!')
    // }
    const { description } = req.body
    if (!regex.isDescriptionString(description)) {
      throw new ErrorHandler(400, 'description not valid')
    }
    const { moq } = req.body
    if (!regex.isPositiveInt(moq)) {
      throw new ErrorHandler(400, 'moq not valid!')
    }
    const { quantity_to_assemble } = req.body
    if (!regex.isZeroPositiveInt(quantity_to_assemble)) {
      throw new ErrorHandler(400, 'quantity_to_assemble not valid!')
    }
    const { unitCost } = req.body
    if (!regex.isPositiveFloat(unitCost)) {
      throw new ErrorHandler(400, 'unit cost not valid!')
    }
    const { currency } = req.body
    if (!regex.isCurrency(currency)) {
      throw new ErrorHandler(400, 'currency not valid!')
    }
    const { GTIN } = req.body
    if (GTIN) {
      if (!regex.isGTIN(GTIN)) {
        throw new ErrorHandler(400, 'GTIN not valid!')
      }
    }
    const { SKU } = req.body
    if (SKU) {
      if (!regex.isAlphanumericString(SKU)) {
        throw new ErrorHandler(400, 'SKU not valid!')
      }
    }
    const { vendorUrl } = req.body
    if (vendorUrl) {                                            // vendor URL is not required
      if (!regex.isHTTP(vendorUrl)) {
        throw new ErrorHandler(400, 'vendor Url not valid!')
      }
    }
    const { leadTime } = req.body
    if (leadTime) {                                            // duration not required
      if (!regex.isDurationISO8601(leadTime)) {
        throw new ErrorHandler(400, ' leadTime not valid!')
      }
    }
    const { link } = req.body
    if (link) {                                            // link is not required
      if (!regex.isHTTP(link)) {
        throw new ErrorHandler(400, 'link not valid!')
      }
    }
    const { notes } = req.body
    if (notes) {                                            // notes are not required
      if (!regex.isAlphanumericString(notes)) {
        throw new ErrorHandler(400, 'notes not valid!')
      }
    }
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  projectFormValidate: projectFormValidate,
  atomFormValidate: atomFormValidate,
  atomUpdateFormValidate: atomUpdateFormValidate
}