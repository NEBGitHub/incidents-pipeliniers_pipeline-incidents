
const React = require('react')
const ReactRedux = require('react-redux')
const Header = require('./header.jsx')
const EmptyCategories = require('./EmptyCategories.jsx')
const IncidentListShowHide = require('./IncidentListShowHide.jsx')
const SocialBar = require('./SocialBar.jsx')
const Disclaimer = require('./Disclaimer.jsx')

require('./Workspace.scss')

const Column = require('./Column.jsx')
const MapColumn = require('./MapColumn.jsx')
const SideBar = require('./SideBar.jsx')
const WorkspaceComputations = require('../WorkspaceComputations.js')
const MapContainer = require('./MapContainer.jsx')
const Constants = require('../Constants.js')
const IncidentListHeadings = require('./IncidentListHeadings.jsx')
const IncidentContainer = require('./IncidentContainer.jsx')
const StoryBar = require('./StoryBar.jsx')
const StoryWindow = require('./StoryWindow.jsx')
const ColumnTooltip = require('./ColumnTooltip/')
const AboutWindow = require('./AboutWindow.jsx')

class Workspace extends React.Component {


  columns() {
    return this.props.columns.map( (columnName) => {
      if (columnName === 'map') {
        return <MapColumn key={columnName}/>
      }
      else {
        return <Column
          columnName={columnName}
          key={columnName}
          columnType = { Constants.getIn(['columnTypes', 'WORKSPACE']) }
        />
      }
    }).toArray()
  }

  mapContainer() {
    if (WorkspaceComputations.mapDisplayed(this.props.columns)) {
      return <MapContainer/>
    }
    else {
      return null
    }
  }

  columnTooltip() {
    // Only render if a tooltip has been summoned
    if(this.props.columnTooltip.get('isActive')) return <ColumnTooltip/>
  }

  incidentListHtml() {
    return <IncidentContainer />
  }

  incidentListSvg() {
    return <g>
      <IncidentListHeadings />
      <IncidentListShowHide />
      <EmptyCategories />
    </g>
  }

  socialbar() {
    return <SocialBar/>
  }

  storyContent() {
    return <div>
      <StoryWindow/>
      <StoryBar/>
      <Disclaimer/>
    </div>
  }

  render() {

    // Many of the downstream computations require that the data be loaded
    // Bail out here if it isn't
    // TODO: show a loading screen of some sort?
    if (this.props.data.count() === 0 || this.props.categories.count() === 0) {
      return <div/>
    }

    const horizontalPositions = WorkspaceComputations.horizontalPositions(
      this.props.showEmptyCategories,
      this.props.viewport,
      this.props.data,
      this.props.columns,
      this.props.categories)

    const scrollPaneWidth = this.props.viewport.get('x') -
      Constants.getIn(['socialBar', 'width']) -
      Constants.getIn(['socialBar', 'leftMargin'])


    const clipContainerStyle = {
      width: `${scrollPaneWidth}px`
    }

    const workspaceStyle = {
      width: this.props.viewport.get('x'),
      height: this.props.viewport.get('y'),
    }

    return <div className = "workspace" style = { workspaceStyle }>
      <div
        className = 'workspaceOverlay'
        style = { {height: `${Constants.getIn(['topBar', 'height'])}px`} }
      >
        <Header />

      </div>

      <div
        className = 'workspaceClipContainer'
        style = { clipContainerStyle }
      >
        <div
          className = 'workspaceScrollPane'>
          { this.mapContainer() }
          { this.incidentListHtml() }
          <svg
            className = 'workspaceSvg'
            width = { horizontalPositions.getIn(['workspace', 'width']) }
            height = { horizontalPositions.getIn(['workspace', 'height']) }>

            { this.incidentListSvg() }

            {this.columns()}
            <SideBar/>
          </svg>
          {this.columnTooltip()}
        </div>
        <SocialBar/>
      </div>
      { this.storyContent() }
      <AboutWindow />
    </div>
  }
}

const mapStateToProps = state => {
  return {
    showEmptyCategories: state.showEmptyCategories,
    viewport: state.viewport,
    data: state.data,
    columns: state.columns,
    categories: state.categories,
    columnTooltip: state.columnTooltip,
  }
}

module.exports = ReactRedux.connect(mapStateToProps)(Workspace)
