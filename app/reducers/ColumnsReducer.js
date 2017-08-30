const Immutable = require('immutable')

const Constants = require('../Constants.js')

const defaults = Immutable.fromJS([
  'year',
  'incidentTypes',
  'status',
  'pipelineSystemComponentsInvolved',
  'substance',
  'volumeCategory',
  'releaseType',
  /*'whatHappened',
  'whyItHappened',
  'pipelinePhase',
  'substanceCategory',
  'company',
  'map',
  'province',*/
])




const ColumnsReducer = (state = defaults, action) => {

  switch(action.type) {

  case 'AddColumn':
    // Only real column names allowed
    if(!Constants.get('columnNames').contains(action.columnName)) {
      return state
    }

    if (state.contains(action.columnName)) {
      // Return if this column already exists in the set
      return state
    }
    else {
      // Add the column to end of the list
      return state.push(action.columnName)
    }

  case 'RemoveColumn':
    if (state.contains(action.columnName)) {
      return state.filter( item => {
        item !== action.columnName
      })
    }
    else {
      return state
    }

  case 'SetColumnsTo': {
    const columnNames = Constants.get('columnNames')

    // Only permit valid column names
    const validatedColumnNames = action.columnNames.filter( columnName => {
      columnNames.contains(columnName)      
    })

    return Immutable.List(validatedColumnNames)
  }

  case 'SnapColumn': {
    const currentIndex = state.indexOf(action.columnName)

    // Determine the size of the columns and paths based on the
    // number of columns in the workspace. Note that the dimensions
    // do not change after 6 columns.
    const columnCount = (state.count() >= 6)? 6 : state.count()
    const jump = Math.floor(Math.abs(action.newX - action.oldX)/(Constants.getIn(['columnDragOffsets', columnCount.toString()])))

    if(action.oldX > action.newX) {
      const newIndex = (currentIndex - jump < 0)? 0: Math.max(currentIndex - jump, 0)
      return state.delete(currentIndex).insert(newIndex, action.columnName)
    }

    else if(action.oldX < action.newX) {
      const newIndex = currentIndex + jump

      if(newIndex < state.count()) {
        return state.delete(currentIndex).insert(currentIndex + jump, action.columnName)        
      }
      else {
        return state.delete(currentIndex)
      }
    }

    return state
  }

  default:
    return state
  }
}


module.exports = ColumnsReducer