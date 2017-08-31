const React = require('react')
const ReactRedux = require('react-redux')

const IncidentBar = require('./IncidentBar.jsx')
const Constants = require('../Constants.js')
const WorkspaceComputations = require('../WorkspaceComputations.js')
const CategoryComputations = require('../CategoryComputations.js')
const IncidentComputations = require('../IncidentComputations.js')
const AddPinnedIncidentCreator = require('../actionCreators/AddPinnedIncidentCreator.js')
const RemovePinnedIncidentCreator = require('../actionCreators/RemovePinnedIncidentCreator.js')

require('./IncidentPopover.scss')

const popoverX = Constants.getIn(['incidentPopover', 'popoverX'])

class IncidentPopover extends React.Component {

  horizontalLine() {
    const horizontalLineY = this.props.y//Constants.getIn(['incidentPopover', 'horizontalLineY'])
    const transformHorizontal = `translate(${popoverX},${horizontalLineY})`
    const horizontalLineEnd = Constants.getIn(['incidentPopover', 'horizontalLineEnd'])
    return <g className="horizontalLine" transform = {transformHorizontal} >
      <line x1={0} y1={0} x2={horizontalLineEnd} y2={0} strokeWidth="1" />
      }
    </g>
  }

  showPopoverBody() {

    const pinHeight = Constants.getIn(['pinColumn', 'pinIconSize'])
    const pinWidth = Constants.getIn(['pinColumn', 'pinIconSize'])
    const showPopoverBodyY = this.props.y + 15 //Constants.getIn(['incidentPopover', 'showPopoverBodyY'])
    const transformPopoverBody = `translate(${popoverX},${showPopoverBodyY})`
    const lineHeight = Constants.getIn(['incidentPopover', 'lineHeight'])

    let imagePath = 'images/unpinned.svg'
    if(this.props.pinnedIncidents.contains(this.props.incident)) {
      imagePath = 'images/pinned.svg'
    }

    return <g transform = {transformPopoverBody}>
      <text className="subpop">
        <tspan x={0} dy=".6em">{this.props.incident.get('incidentNumber')}</tspan>
        <tspan x={0} dy={lineHeight}>Near {this.props.incident.get('nearestPopulatedCentre')}</tspan>
        <tspan x={0} dy={lineHeight}>Date reported:</tspan>
        <tspan x={0} dy={lineHeight}>{(this.props.incident.get('reportedDate').format('DD/MM/YYYY'))}</tspan>
      </text>
      <image 
        className = 'pinIcon'
        height = {pinHeight} 
        width = {pinWidth} 
        x={Constants.getIn(['incidentPopover', 'pinIconXY'])}
        y={Constants.getIn(['incidentPopover', 'pinIconXY'])}
        xlinkHref={imagePath}
        onClick={this.handlePinClick.bind(this)}></image>
    </g>
  }

  handlePinClick() {
    if(this.props.pinnedIncidents.contains(this.props.incident)) {
      this.props.unpinIncident(this.props.incident)
    }
    else {
      this.props.pinIncident(this.props.incident)
    }
  }

  //TODO: handle the case where no columns are displayed
  //TODO: what happens if the leftmost column is the map? 
  showYLine() {
    const categoryHeights = WorkspaceComputations.categoryHeights(
      this.props.showEmptyCategories,
      this.props.viewport,
      this.props.data,
      this.props.columns,
      this.props.categories, 
      this.props.columns.get(0)) 

    // TODO: I'm not very happy computing the vertical layout this way, refactor!
    let categoryY = WorkspaceComputations.columnY()

    const displayedCategories = CategoryComputations.displayedCategories(
      this.props.data,
      this.props.columns,
      this.props.categories, 
      this.props.columns.get(0))

    const categoryYCoordinates = displayedCategories
      .map( (visible, categoryName) => {
        const currentY = categoryY
        categoryY += categoryHeights.get(categoryName)

        return currentY
      })

    // TODO: This crashes when the selected incident belongs to multiple 
    // categories.
    const categoryName = this.props.incident.get(this.props.columns.get(0))

    const incidents = IncidentComputations.filteredIncidents(this.props.data, this.props.columns, this.props.categories)
    const incidentsSubset = IncidentComputations.categorySubset(
      incidents, 
      this.props.columns.get(0), 
      categoryName)

    const incidentIndex = incidentsSubset.indexOf(this.props.incident)
    const y = categoryYCoordinates.get(categoryName) + categoryHeights.get(categoryName) * (incidentIndex/incidentsSubset.count())
    const transformLine = `translate(0,${y})`

    const lineHeightX = Constants.getIn(['incidentPopover', 'lineHeightX'])
    const dotRadius = Constants.getIn(['incidentPopover', 'dotRadius'])
    const showYLineY = this.props.y//Constants.getIn(['incidentPopover', 'showYLineY'])
    const horizontalLineXStart = Constants.getIn(['incidentPopover', 'horizontalLineXStart'])
    
    return <svg className="verticalLine"
      xmlnsXlink='http://www.w3.org/1999/xlink'> 
      <line x1={lineHeightX} y1={showYLineY} x2={lineHeightX} y2={y} strokeWidth="1" /> //vertical line
      <g transform = {transformLine}>
        <line x1={lineHeightX} y1={0} x2={horizontalLineXStart} y2={0} strokeWidth="1" /> //horizontal stub
        <circle cx={horizontalLineXStart} cy="0" r={dotRadius}/>
      </g>
    </svg>
  }

  render() {
    return <g transform='translate(0,0)'>
      {this.showPopoverBody()}
      {this.horizontalLine()}
      {this.showYLine()}
    </g>
  }
  /**
    TODO: Should show popover when selected
    cursor should change to pointer
    pinned and unpinned image needs to update depending on selection
    popover should disappear when user clicks away
  **/

}

const mapStateToProps = state => {
  return {
    selectedIncident: state.selectedIncident,
    showEmptyCategories: state.showEmptyCategories,
    viewport: state.viewport,
    data: state.data,
    columns: state.columns,
    categories: state.categories,
    pinnedIncidents: state.pinnedIncidents
  }
}

const mapDispatchToProps = dispatch => {
  return {
    pinIncident: (incident) => {
      dispatch(AddPinnedIncidentCreator(incident))
    },
    unpinIncident: (incident) => {
      dispatch(RemovePinnedIncidentCreator(incident))
    }
  }
}

module.exports = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(IncidentPopover)
