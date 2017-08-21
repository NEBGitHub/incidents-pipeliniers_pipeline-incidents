const Immutable = require('immutable')

const Constants = require('../Constants.js')

const CategoryHoverStateReducer = (state = null, action) => {

  switch(action.type) {

  case 'CategoryHoverStateCreator':
   // When hovered, neither name or category should be null
    if((category !=== null) && (columnName !=== null)) {
      return state
    }

  case 'CategoryUnhoverStateCreator':
    return null

  default:
    return state
  }

}


module.exports = CategoryHoverStateReducer