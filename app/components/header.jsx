const React = require('react')
const ReactRedux = require('react-redux')

const Constants = require('../Constants.js')
const ResetVisualizationCreator = require('../actionCreators/ResetVisualizationCreator.js')
const DefaultCategoryComputations = require('../DefaultCategoryComputations.js')

const WorkspaceComputations = require('../WorkspaceComputations.js')


require('./Header.scss')


class Header extends React.Component {

  resetAllClick() {
    const categories = DefaultCategoryComputations.initialState(this.props.data)
    this.props.resetVisualization(categories)
  }

  resetAllButton() {
    return <image 
      className = "resetAllButton"
      height = {Constants.getIn(['socialBar', 'iconSize'])}
      width = {Constants.getIn(['socialBar', 'iconSize'])}       
      y = {27}
      x ={Constants.getIn(['workspace', 'maxWidth']) - 24}
      onClick = { this.resetAllClick.bind(this) }
      xlinkHref='images/reset_button.svg'
    ></image>
  }

  render() {
    const headerWidth = Constants.getIn(['topBar', 'width'])
    const headerHeight = Constants.getIn(['topBar', 'height'])
    const yHeading = Constants.getIn(['topBar', 'yHeading'])
    const ySubpop = Constants.getIn(['topBar', 'ySubpop'])
    const transformString = `translate(${Constants.get('leftOuterMargin')},${Constants.get('topOuterMargin')})`

    return <g transform = { transformString } className = 'header'>
      <rect width={Constants.getIn(['socialBar', 'width'])}        
        height={Constants.getIn(['headerBar', 'height'])}
        x = {Constants.getIn(['workspace', 'maxWidth']) - 27}
        fill='#555556'
      />
      // TODO: add methodology PDF
      <a href='https://google.ca' target="_blank">
        <image 
          height = {Constants.getIn(['socialBar', 'iconSize'])}
          width = {Constants.getIn(['socialBar', 'iconSize'])}      
          y = {5}
          x ={Constants.getIn(['workspace', 'maxWidth']) - 24}
          xlinkHref='images/methodology-icon-white.svg'
        ></image>
      </a>

      <text x={Constants.getIn(['workspace', 'maxWidth']) - 105} 
        y={21}
        className="headerButtons">METHODOLOGY</text>

      <text x={Constants.getIn(['workspace', 'maxWidth']) - 80} 
        y={40} className="headerButtons">RESET ALL</text>

      { this.resetAllButton() }

      <svg width={headerWidth} height={headerHeight} xmlnsXlink='http://www.w3.org/1999/xlink'>
      
        <text x={0} y={yHeading} className="heading">Incidents at NEB-regulated pipelines and facilities</text>
        <text x={0} y={ySubpop} className="subpop">
          The information presented here is based on NEB data from 2008 to current for
          incidents reported under the Onshore Pipeline Regulations.
          New data is added on a quaterly basis.</text>
      </svg>
    </g>
  
  }
}

const mapStateToProps = (state) => { 
  return {
    data: state.data
  } 
}

const mapDispatchToProps = dispatch => {
  return {
    resetVisualization: (categories) => {
      dispatch(ResetVisualizationCreator(categories))
    }
  }
}

module.exports = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Header)