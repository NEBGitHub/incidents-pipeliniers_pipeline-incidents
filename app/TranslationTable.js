const Immutable = require('immutable')

const TranslationTable = Immutable.fromJS({ 
  columnHeadings: {
    incidentTypes: {
      en:'INCIDENT TYPE',
      fr:'TODO',
    },
    year: {
      en:'REPORTED DATE/YEAR',
      fr:'TODO',
    },
    company: {
      en:'COMPANY',
      fr:'TODO',
    },
    status: {
      en:'STATUS',
      fr:'TODO',
    },
    province: {
      en:'PROVINCES',
      fr:'TODO',
    },
    substance: {
      en:'SUBSTANCE',
      fr:'TODO',
    },
    releaseType: {
      en:'RELEASE TYPE',
      fr:'TODO',
    },
    whatHappened: {
      en:'WHAT HAPPENED',
      fr:'TODO',
    },
    whyItHappened: {
      en:'WHY IT HAPPENED',
      fr:'TODO',
    },
    pipelinePhase: {
      en:'PIPELINE PHASE',
      fr:'TODO',
    },
    volumeCategory: {
      en:'APPROX VOL RELEASED',
      fr:'TODO',
    },
    substanceCategory: {
      en:'SUBSTANCE CATEGORY',
      fr:'TODO',
    },
    pipelineSystemComponentsInvolved: {
      en:'SYS. COMP. INVOLVED',
      fr:'TODO',
    },
    map: {
      en:'MAP OVERVIEW',
      fr:'TODO',
    }
  },
})

module.exports = TranslationTable