const React = require('react')
const ReactRedux = require('react-redux')

const Constants = require('../Constants.js')
const WorkspaceComputations = require('../WorkspaceComputations.js')
const DragColumnStartedCreator = require('../actionCreators/DragColumnStartedCreator.js')
const DragColumnCreator = require('../actionCreators/DragColumnCreator.js')
const DragColumnEndedCreator = require('../actionCreators/DragColumnEndedCreator.js')
const SnapColumnCreator = require('../actionCreators/SnapColumnCreator.js')

let columnWindowMoveHandler = null
let columnWindowEndHandler = null

require('./MapColumn.scss')

// NB: The 'map column' is not responsible for actually drawing the map. It is
// just a dummy object to occupy the same space as the actual map canvas.

// As the map is drawn with a canvas element, embedding it in the SVG would be
// a bad idea. See MapContainer and Map components.

class MapColumn extends React.Component {

  dragArrow() {
    const measurements = WorkspaceComputations.horizontalPositions(
      this.props.showEmptyCategories,
      this.props.viewport,
      this.props.data,
      this.props.columns,
      this.props.categories)
      .getIn(['columns', 'map'])

    const dragArrowX = measurements.get('x') + 
                       (measurements.get('width') / 2) - 
                       (Constants.getIn(['dragArrow', 'width']) / 2)

    return <image xlinkHref='images/horizontal_drag.svg' 
      className = 'dragArrow'
      height = {Constants.getIn(['dragArrow', 'height'])}
      width = {Constants.getIn(['dragArrow', 'width'])}
      x= {dragArrowX}
      y= {WorkspaceComputations.dragArrowY(this.props.viewport)}
      onMouseDown={this.handleDragStart.bind(this)}
      onMouseMove={this.handleDragMove.bind(this)}
      onMouseUp={this.handleDragEnd.bind(this)}>
    </image>
  }

  handleDragStart(e) {
    e.stopPropagation()
    e.preventDefault()

    const measurements = WorkspaceComputations.horizontalPositions(
      this.props.showEmptyCategories,
      this.props.viewport,
      this.props.data,
      this.props.columns,
      this.props.categories)
      .getIn(['columns', 'map'])

    const oldX = measurements.get('x') + 
                       (measurements.get('width') / 2) - 
                       (Constants.getIn(['dragArrow', 'width']) / 2)
    const offset = e.clientX - oldX

    this.props.onColumnDragStarted(true, 'map', oldX, e.clientX, offset)

    // These handlers will help keep the dragged column moving
    // even when the cursor is off the dragging handle. This
    // is necessary because the dragging handle is too small
    // making it harder to drag without the cursor leaving 
    // the handle.
    columnWindowEndHandler = this.handleDragEnd.bind(this)
    columnWindowMoveHandler = this.handleDragMove.bind(this)
    window.addEventListener('mouseup', columnWindowEndHandler)
    window.addEventListener('mousemove', columnWindowMoveHandler)
  }

  handleDragMove(e) {
    e.stopPropagation()
    e.preventDefault()

    // No need to fire unneeded events if drag hasn't started.
    if(!this.props.columnDragStatus.get('isStarted')) return 

    this.props.onColumnDrag(e.clientX)
  }

  handleDragEnd(e) {
    e.stopPropagation()
    e.preventDefault()

    // No need to fire unneeded evenets if drag hasn't started.
    if(!this.props.columnDragStatus.get('isStarted')) return
    this.props.onColumnDragEnded(false)
    const newX = this.props.columnDragStatus.get('newX') - 
                 this.props.columnDragStatus.get('offset')
    this.props.onColumnSnap(this.props.columnDragStatus.get('columnName'), this.props.columnDragStatus.get('oldX'), newX)

    // Remove the window event handlers previously attached.
    window.removeEventListener('mouseup', columnWindowEndHandler)
    window.removeEventListener('mousemove', columnWindowMoveHandler)
  }

  columnTransform() {
    let transformString = 'translate(0,0)'
    if(this.props.columnDragStatus.get('isStarted') &&
       this.props.columnDragStatus.get('columnName') === 'map') {
      const xTransform = this.props.columnDragStatus.get('newX') - 
                         this.props.columnDragStatus.get('offset') - 
                         this.props.columnDragStatus.get('oldX')
      transformString = `translate(${xTransform},0)`
    }
    return transformString
  }

  render() {

    const measurements = WorkspaceComputations.horizontalPositions(
      this.props.showEmptyCategories,
      this.props.viewport,
      this.props.data,
      this.props.columns,
      this.props.categories)
      .getIn(['columns', 'map'])

    return <g
      transform={this.columnTransform()}>
      <rect
        x={ measurements.get('x') }
        y={ measurements.get('y') }
        width={ measurements.get('width') }
        height={ measurements.get('height') }
        fill='#fff'
        opacity='0'
      />
      {this.dragArrow()}
    </g>
  }
}

const mapStateToProps = state => {
  return {
    viewport: state.viewport,
    columns: state.columns,
    categories: state.categories,
    data: state.data,
    showEmptyCategories: state.showEmptyCategories,
    columnDragStatus: state.columnDragStatus,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onColumnDragStarted: (isStarted, columnName, oldX, newX, offset) => {
      dispatch(DragColumnStartedCreator(isStarted, columnName, oldX, newX, offset))
    },
    onColumnDrag: (newX) => {
      dispatch(DragColumnCreator(newX))
    },
    onColumnDragEnded: (isStarted) => {
      dispatch(DragColumnEndedCreator(isStarted))
    },
    onColumnSnap: (columnName, oldX, newX) => {
      dispatch(SnapColumnCreator(columnName, oldX, newX))
    }
  }
}

module.exports = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(MapColumn)