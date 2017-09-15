const MemoizeImmutable = require('memoize-immutable')
const Immutable = require('immutable')

const IncidentComputations = require('./IncidentComputations.js')
const WorkspaceComputations = require('./WorkspaceComputations.js')
const CategoryComputations = require('./CategoryComputations.js')

const IncidentPathComputations = {}



// Returns an immutable list of heights of an incident within a column
// Single selection columns will have one height, multiple selection may have
// zero or more.
// incident: an immutable incident record
// columnName: string name of the column in question
// data, columns, categories: the respective objects from the store
IncidentPathComputations.incidentHeightsInColumn = function (incident, columnName, data, columns, categories, showEmptyCategories, viewport, categoryVerticalPositions) {

  const filteredIncidents = IncidentComputations.filteredIncidents(data, columns, categories)

  switch(columnName) {
  case 'year':
  case 'company':
  case 'status':
  case 'province':
  case 'substance':
  case 'releaseType':
  case 'pipelinePhase':
  case 'volumeCategory':
  case 'substanceCategory': {

    // For single selection columns, there will be one height

    const categoryName = incident.get(columnName)
    const subsetIncidents = IncidentComputations.categorySubset(filteredIncidents, columnName, categoryName)

    return Immutable.List([
      IncidentPathComputations.incidentHeightInCategory(incident, subsetIncidents, categoryName, categoryVerticalPositions)
    ])

  }
  case 'incidentTypes':
  case 'whatHappened':
  case 'whyItHappened':
  case 'pipelineSystemComponentsInvolved': {

    // For multiple selection columns, there may be zero or more heights

    const categoryNames = incident.get(columnName)
    return categoryNames.map( categoryName => {
      
      const subsetIncidents = IncidentComputations.categorySubset(filteredIncidents, columnName, categoryName)

      return IncidentPathComputations.incidentHeightInCategory(incident, subsetIncidents, categoryName, categoryVerticalPositions)
    })

  }
  }  
  
}


IncidentPathComputations.incidentHeightInCategory = function(incident, subsetIncidents, categoryName, categoryVerticalPositions) {

  const incidentIndex = subsetIncidents.indexOf(incident)

  const heightWithinCategory = (incidentIndex / subsetIncidents.count()) * categoryVerticalPositions.getIn([categoryName, 'height'])

  return categoryVerticalPositions.getIn([categoryName, 'y']) + heightWithinCategory

}


// Computes a y1 and y2 value for each of the ordinary paths in the current
// configuration.
// Also computes the number of incidents in each category.

IncidentPathComputations.pathMeasurements = function (data, columns, categories, showEmptyCategories, viewport) {

  // Do some necessary computations up front:
  const sidebarColumns = WorkspaceComputations.sidebarColumns(columns)

  const filteredData = IncidentComputations.filteredIncidents(
    data, 
    columns, 
    categories
  )

  const horizontalPositions = WorkspaceComputations.horizontalPositions(
    showEmptyCategories,
    viewport, 
    filteredData,
    columns,
    categories
  )



  // Get the list of columns which have paths
  // TODO: do I need to exclude the map from all this math? if it is set it up
  // with no categories, then we can ignore it.

  const pathColumns = columns.filter( columnName => columnName !== 'map')

  // If there is a leftmost sidebar column (that isn't the map) we should
  // include it also
  let sidebarPathColumn
  if (sidebarColumns.get(0) !== undefined && 
    sidebarColumns.get(0) !== 'map' &&
    pathColumns.count() > 0) {
    sidebarPathColumn = sidebarColumns.get(0)
  }



  // For each of the columns with paths, gather some information about them.
  
  // TODO: A better name for this variable
  let categoryInfo = Immutable.Map()  
  pathColumns.forEach( columnName => {

    const categoryVerticalPositions = WorkspaceComputations.categoryVerticalPositions(
      showEmptyCategories,
      viewport,
      filteredData,
      columns,
      categories, 
      columnName)

    const pathCategories = CategoryComputations.pathCategories(
      filteredData,
      columns,
      categories,
      columnName
    )

    categoryInfo = categoryInfo.set(columnName, pathCategories.map( (visible, categoryName) => {

      return Immutable.Map({
        verticalPosition: categoryVerticalPositions.get(categoryName),
        incidents: IncidentComputations.categorySubset(filteredData, columnName, categoryName).count(),
        columnMeasurements: horizontalPositions.getIn(['columns', columnName])
      })
    }))

  })


  
  // TODO: this and the above are a huge candidate for a refactor
  if (sidebarPathColumn !== undefined) {

    const pathCategories = CategoryComputations.pathCategories(
      filteredData,
      columns,
      categories,
      sidebarPathColumn
    )

    const categoryVerticalPositions = WorkspaceComputations.sidebarCategoryVerticalPositions(
      showEmptyCategories,
      viewport,
      filteredData,
      columns,
      categories,
      sidebarPathColumn
    )

    categoryInfo = categoryInfo.set(sidebarPathColumn, pathCategories.map( (visible, categoryName) => {
      return Immutable.Map({
        verticalPosition: categoryVerticalPositions.get(categoryName),
        incidents: IncidentComputations.categorySubset(filteredData, sidebarPathColumn, categoryName).count(),
        columnMeasurements: horizontalPositions.get('sideBar')
      })
    }))
  }




  // Find all of the column-column pairs that need paths
  // pathMeasurements: a map of maps of maps:, by source cat, by destination cat, by sourceMeasurement or destinationMeasurement

  let columnPairs = Immutable.List()
  for (let i = 0; i < columns.count() - 1; i++) {
    if (columns.get(i) === 'map' || columns.get(i+1) === 'map') {
      continue
    }

    columnPairs = columnPairs.push(Immutable.fromJS({
      source: {
        columnName: columns.get(i),
      },
      destination: {
        columnName: columns.get(i+1),
      },
      pathMeasurements: {}
    }))
  }

  let sidebarColumnPair
  if (sidebarPathColumn !== undefined) {
    sidebarColumnPair = Immutable.fromJS({
      source: {
        columnName: pathColumns.get(pathColumns.count() - 1),
      },
      destination: {
        columnName: sidebarPathColumn,
      },
      pathMeasurements: {}
    })
  }


  // Compute the start and end heights for each path, on each column

  // We compute the heights separately, first on the source categories, then
  // on the destination categories.

  columnPairs = columnPairs.map( columnPair => {

    const sourceVerticalPositions = WorkspaceComputations.categoryVerticalPositions(
      showEmptyCategories,
      viewport,
      filteredData,
      columns,
      categories,
      columnPair.getIn(['source', 'columnName'])
    )

    const destinationVerticalPositions = WorkspaceComputations.categoryVerticalPositions(
      showEmptyCategories,
      viewport,
      filteredData,
      columns,
      categories,
      columnPair.getIn(['destination', 'columnName'])
    )

    return IncidentPathComputations.computeHeightsForColumnPair(
      filteredData,
      columns, 
      categories,
      categoryInfo,
      columnPair,
      sourceVerticalPositions,
      destinationVerticalPositions
    )

  })

  if (sidebarColumnPair !== undefined) {

    const sourceVerticalPositions = WorkspaceComputations.categoryVerticalPositions(
      showEmptyCategories,
      viewport,
      filteredData,
      columns,
      categories,
      sidebarColumnPair.getIn(['source', 'columnName'])
    )

    const destinationVerticalPositions = WorkspaceComputations.sidebarCategoryVerticalPositions(
      showEmptyCategories,
      viewport,
      filteredData,
      columns,
      categories,
      sidebarPathColumn
    )
    sidebarColumnPair = IncidentPathComputations.computeHeightsForColumnPair(
      filteredData,
      columns, 
      categories,
      categoryInfo,
      sidebarColumnPair,
      sourceVerticalPositions,
      destinationVerticalPositions
    )
  }


  return Immutable.Map({
    columnPairs: columnPairs,
    sidebarColumnPair: sidebarColumnPair,
  })

}




IncidentPathComputations.computeHeightsForColumnPair = function(filteredData, columns, categories, categoryInfo, columnPair, sourceVerticalPositions, destinationVerticalPositions) {


  const sourcePathCategories = CategoryComputations.pathCategories(
    filteredData,
    columns,
    categories,
    columnPair.getIn(['source', 'columnName'])
  )

  const destPathCategories = CategoryComputations.pathCategories(
    filteredData,
    columns,
    categories,
    columnPair.getIn(['destination', 'columnName'])
  )



  // TODO: These two giant loops on sourcePathCategories and 
  // destPathCategories share exactly the same logic, but reversed.
  // Find a way to refactor this.

  sourcePathCategories.forEach( (sVisible, sourceCategory) => {

    const sourceCategoryIncidents = categoryInfo.getIn([
      columnPair.getIn(['source', 'columnName']),
      sourceCategory, 
      'incidents'
    ])

    const sourceCategoryHeight = sourceVerticalPositions.getIn([sourceCategory, 'height'])

    // A map of destination category names to a count of incidents shared
    // between the source category and destination category
    // We filter out the destination categories with no shared incidents
    const mutualIncidentCounts = destPathCategories.map( (dVisible, destinationCategory) => {

      return CategoryComputations.itemsInBothCategories(
        filteredData,
        columnPair.getIn(['source', 'columnName']),
        sourceCategory,
        columnPair.getIn(['destination', 'columnName']),
        destinationCategory
      )
    }).filter( count => count > 0 )

    const destinationCategoryIncidents = mutualIncidentCounts.reduce( (sum, count) => { return sum + count }, 0)

    let heightFactor
    if (sourceCategoryIncidents >= destinationCategoryIncidents) {
      // When there is the same number of incidents in the source category and
      // all of its destination categories, the height for all of the outgoing
      // paths should match the height of the category.
      // When there are more incidents in the source category than its
      // destinations, we are next to the system components column. We don't
      // use the full height of the category.
      // In either case, we apply no modifier to the heights
      heightFactor = 1
    }
    else {
      // When there are fewer incidents in the source category than in all of
      // its destination categories, we are next to a multiple selection
      // column and at least one incident is in more than one destination
      // category. The vertical height of all the paths added together will be
      // higher than the height of the outgoing category, so we apply a
      // modifier to scale the outgoing paths fit to within the category's 
      // height.

      heightFactor = sourceCategoryIncidents / destinationCategoryIncidents
    }

    let currentY = sourceVerticalPositions.getIn([sourceCategory, 'y'])

    mutualIncidentCounts.forEach( (count, destinationCategory) => {

      const y1 = currentY
      const y2 = y1 + (count / sourceCategoryIncidents) * sourceCategoryHeight * heightFactor

      const measurements = Immutable.fromJS({
        incidentCount: count,
        sourceCategory: sourceCategory,
        destinationCategory: destinationCategory,
        y1: y1,
        y2: y2,
      })
    
      columnPair = columnPair.setIn(['pathMeasurements', sourceCategory, destinationCategory, 'sourceMeasurement'], measurements)

      currentY = y2

    })

  })



  destPathCategories.forEach( (dVisible, destinationCategory) => {

    const destinationCategoryIncidents = categoryInfo.getIn([
      columnPair.getIn(['destination', 'columnName']),
      destinationCategory,
      'incidents'
    ])

    const destinationCategoryHeight = destinationVerticalPositions.getIn([destinationCategory, 'height'])

    // A map of source category names to a count of incidents shared
    // between the source category and destination category
    // We filter out the source categories with no shared incidents
    const mutualIncidentCounts = sourcePathCategories.map( (sVisible, sourceCategory) => {

      return CategoryComputations.itemsInBothCategories(
        filteredData,
        columnPair.getIn(['source', 'columnName']),
        sourceCategory,
        columnPair.getIn(['destination', 'columnName']),
        destinationCategory
      )
    }).filter( count => count > 0 )

    const sourceCategoryIncidents = mutualIncidentCounts.reduce( (sum, count) => { return sum + count }, 0)


    let heightFactor
    if (destinationCategoryIncidents >= sourceCategoryIncidents) {
      heightFactor = 1
    }
    else {
      heightFactor = destinationCategoryIncidents / sourceCategoryIncidents 
    }

    let currentY = destinationVerticalPositions.getIn([destinationCategory, 'y'])

    mutualIncidentCounts.forEach( (count, sourceCategory) => {

      const y1 = currentY
      const y2 = y1 + (count / destinationCategoryIncidents) * destinationCategoryHeight * heightFactor

      const measurements = Immutable.fromJS({
        incidentCount: count,
        sourceCategory: sourceCategory,
        destinationCategory: destinationCategory,
        y1: y1,
        y2: y2,
      })

      columnPair = columnPair.setIn(['pathMeasurements', sourceCategory, destinationCategory, 'destinationMeasurement'], measurements)


      currentY = y2

    })
  })

  return columnPair
}














// Computes the height, width, x, and y for each of the selected paths in the
// current configuration.
// Also computes the number of incidents within the current selection, in each
// category

IncidentPathComputations.selectedCategoryPathMeasurements = function () {

}













const MemoizedComputations = {}

for (const name of Object.keys(IncidentPathComputations)) {
  MemoizedComputations[name] = MemoizeImmutable(IncidentPathComputations[name])
}

window.ipc = MemoizedComputations

module.exports = MemoizedComputations