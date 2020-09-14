const semverRegex = require("semver-regex")
const iso31661 = require("iso-3166")
const iso31662 = require("iso-3166/2")

module.exports = {

    isAlphanumericString(str) {
        const pattern = /^[-0-9a-zA-Z_]+$/;     //plus hyphens and underscores
        return pattern.test(str)
    },

    isSKU(str) {
        const pattern = /^[-0-9a-zA-Z_. /]+$/;     //plus hyphens, underscores, dots, blank spaces and slash 
        return pattern.test(str)
    },

    // match everything except for comma and semicolon
    isDescriptionString(str) {
        const pattern = /^[^,;]+$/;
        return pattern.test(str)
    },

    isPositiveInt(str) {
        const pattern = /^[0-9]*[1-9][0-9]*$/;
        return pattern.test(str)
    },

    isPositiveFloat(str) {
        const pattern = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
        return pattern.test(str)
    },

    isISO4217(str) {
        const pattern = /[A-Z]{3}/;
        return pattern.test(str)
    },

    isGTIN(str) {
        const pattern = /^(\d{8}|\d{12}|\d{13}|\d{14})$/;
        return pattern.test(str)
    },

    isHTTP(str) {
        const pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
        return pattern.test(str)
    },

    isDurationISO8601(str) {
        const pattern = /^P(?!$)(\d+(?:\.\d+)?Y)?(\d+(?:\.\d+)?M)?(\d+(?:\.\d+)?W)?(\d+(?:\.\d+)?D)?(T(?=\d)(\d+(?:\.\d+)?H)?(\d+(?:\.\d+)?M)?(\d+(?:\.\d+)?S)?)?$/
        return pattern.test(str)
    },

    isSemanticVersion(str) {
        return semverRegex().test(str)
    },

    isISO31661(value) {
        let ret = false
        iso31661.forEach((element) => {
            if (
                element.alpha2 === value ||
                element.alpha3 === value ||
                element.numeric === value ||
                element.name === value
            ) {
                ret = true
                return
            }
        })
        return ret
    },

    isISO31662(value) {
        let ret = false
        iso31662.forEach((element) => {
            if (element.code == value || element.name === value) {
                ret = true
                return
            }
        })
        return ret
    },


}