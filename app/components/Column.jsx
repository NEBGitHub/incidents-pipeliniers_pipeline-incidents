const React = require('react')
const ReactRedux = require('react-redux')

const WorkspaceComputations = require('../WorkspaceComputations.js')
const ColumnPaths = require('./ColumnPaths.jsx')

require('./Column.scss')

class Column extends React.Component {

  render() {
    return <g>
      <rect
        x={ WorkspaceComputations.columnX(this.props.columns, this.props.viewport, this.props.index) }
        y={ WorkspaceComputations.topBarHeight() }
        width={ WorkspaceComputations.columnWidth(this.props.columns) }
        height={ WorkspaceComputations.columnHeight(this.props.viewport) }
        fill='#FFDDFF'
      />
      <ColumnPaths index={this.props.index}/>
    </g>
  }
}

const mapStateToProps = state => {
  return {
    viewport: state.viewport,
    columns: state.columns,
  }
}


module.exports = ReactRedux.connect(mapStateToProps)(Column)